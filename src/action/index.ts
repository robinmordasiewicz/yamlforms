/**
 * GitHub Action Entry Point
 * Wraps the yamldocs library for use as a GitHub Action
 */

import { run } from './main.js';

// Run the action
run().catch((error: unknown) => {
  console.error('Action failed:', error);
  process.exit(1);
});
