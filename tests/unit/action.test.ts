/**
 * Unit tests for GitHub Action
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as core from '@actions/core';

// Mock @actions/core
vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  getBooleanInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}));

// Mock @actions/glob
vi.mock('@actions/glob', () => ({
  create: vi.fn().mockResolvedValue({
    glob: vi.fn().mockResolvedValue([]),
  }),
}));

describe('GitHub Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input parsing', () => {
    it('should use default values when not provided', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        if (name === 'schema') return 'test.yaml';
        return '';
      });
      vi.mocked(core.getBooleanInput).mockReturnValue(true);

      // Import after mocks are set up
      const { run } = await import('../../src/action/main.js');

      await run();

      // Should not fail with default inputs
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it('should handle validate command', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        switch (name) {
          case 'command':
            return 'validate';
          case 'schema':
            return 'nonexistent.yaml';
          default:
            return '';
        }
      });
      vi.mocked(core.getBooleanInput).mockReturnValue(false);

      const { run } = await import('../../src/action/main.js');

      await run();

      // Should warn about no files found, not fail
      expect(core.warning).toHaveBeenCalled();
    });

    it('should handle generate command', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        switch (name) {
          case 'command':
            return 'generate';
          case 'schema':
            return 'nonexistent.yaml';
          case 'output':
            return 'dist';
          case 'format':
            return 'pdf';
          default:
            return '';
        }
      });
      vi.mocked(core.getBooleanInput).mockReturnValue(false);

      const { run } = await import('../../src/action/main.js');

      await run();

      // Should set outputs even with no files
      expect(core.setOutput).toHaveBeenCalledWith('files', '[]');
      expect(core.setOutput).toHaveBeenCalledWith('pdf-count', '0');
      expect(core.setOutput).toHaveBeenCalledWith('html-count', '0');
    });

    it('should fail on invalid command', async () => {
      vi.mocked(core.getInput).mockImplementation((name: string) => {
        switch (name) {
          case 'command':
            return 'invalid';
          case 'schema':
            return 'test.yaml';
          default:
            return '';
        }
      });
      vi.mocked(core.getBooleanInput).mockReturnValue(true);

      const { run } = await import('../../src/action/main.js');

      await run();

      expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('Invalid command'));
    });
  });
});
