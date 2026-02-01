/**
 * Watch Command
 * Watches for file changes and regenerates outputs
 */

import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import chokidar from 'chokidar';
import type { GenerateOptions } from '../../types/index.js';
import { executeGenerate, printGenerateResults } from './generate.js';

export interface WatchOptions extends GenerateOptions {
  debounce?: number;
}

/**
 * Execute the watch command
 */
export async function executeWatch(options: WatchOptions): Promise<void> {
  const { content, schema, debounce = 300 } = options;

  const contentPath = resolve(content);
  if (!existsSync(contentPath)) {
    throw new Error(`Content file not found: ${contentPath}`);
  }

  // Files to watch
  const watchPaths: string[] = [contentPath];

  if (schema) {
    const schemaPath = resolve(schema);
    if (existsSync(schemaPath)) {
      watchPaths.push(schemaPath);
    }
  }

  console.log(chalk.cyan('\n📁 Watching for changes...\n'));
  console.log(chalk.gray('  Files being watched:'));
  for (const path of watchPaths) {
    console.log(chalk.gray(`    • ${path}`));
  }
  console.log('');

  // Debounce timer
  let debounceTimer: NodeJS.Timeout | null = null;

  // Generate function
  const generate = async () => {
    console.log(chalk.yellow('\n🔄 Changes detected, regenerating...\n'));

    try {
      const results = await executeGenerate(options);
      printGenerateResults(results);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (failCount === 0) {
        console.log(chalk.green(`✓ All ${successCount} outputs generated successfully`));
      } else {
        console.log(
          chalk.yellow(`⚠ ${successCount} succeeded, ${failCount} failed`)
        );
      }
    } catch (error) {
      const err = error as Error;
      console.error(chalk.red(`\n✗ Error: ${err.message}`));
    }

    console.log(chalk.gray('\n  Watching for changes... (Ctrl+C to exit)\n'));
  };

  // Initial generation
  await generate();

  // Set up file watcher
  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  // Handle file changes with debouncing
  const handleChange = (path: string, event: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      console.log(chalk.gray(`  ${event}: ${path}`));
      await generate();
    }, debounce);
  };

  watcher.on('change', (path) => handleChange(path, 'Modified'));
  watcher.on('add', (path) => handleChange(path, 'Added'));
  watcher.on('unlink', (path) => {
    console.log(chalk.yellow(`\n⚠ File removed: ${path}`));
    console.log(chalk.gray('  Watching for changes... (Ctrl+C to exit)\n'));
  });

  watcher.on('error', (error) => {
    console.error(chalk.red(`\nWatcher error: ${error.message}`));
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log(chalk.cyan('\n\n👋 Stopping watch mode...\n'));
    watcher.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive
  await new Promise(() => {});
}
