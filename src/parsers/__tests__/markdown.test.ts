/**
 * Markdown Parser Tests
 */

import { describe, it, expect } from 'vitest';
import { parseMarkdownString, markdownToPlainText, extractHeadings } from '../markdown.js';

describe('parseMarkdownString', () => {
  it('should parse basic markdown', () => {
    const markdown = `# Hello World

This is a paragraph.

## Section 1

Content here.`;

    const result = parseMarkdownString(markdown);
    expect(result.title).toBe('Hello World');
    expect(result.sections.length).toBe(2);
    expect(result.sections[0].title).toBe('Hello World');
    expect(result.sections[1].title).toBe('Section 1');
  });

  it('should parse frontmatter', () => {
    const markdown = `---
title: Custom Title
author: Test Author
---

# Content Title

Some content.`;

    const result = parseMarkdownString(markdown);
    expect(result.frontmatter.title).toBe('Custom Title');
    expect(result.frontmatter.author).toBe('Test Author');
    expect(result.title).toBe('Custom Title');
  });

  it('should generate HTML', () => {
    const markdown = `# Test

**Bold** and *italic*.`;

    const result = parseMarkdownString(markdown);
    expect(result.html).toContain('<h1>');
    expect(result.html).toContain('<strong>Bold</strong>');
    expect(result.html).toContain('<em>italic</em>');
  });
});

describe('markdownToPlainText', () => {
  it('should strip headers', () => {
    const result = markdownToPlainText('# Header\n## Subheader');
    expect(result).toBe('Header\nSubheader');
  });

  it('should strip bold and italic', () => {
    const result = markdownToPlainText('**bold** and *italic*');
    expect(result).toBe('bold and italic');
  });

  it('should preserve link text', () => {
    const result = markdownToPlainText('[Click here](https://example.com)');
    expect(result).toBe('Click here');
  });
});

describe('extractHeadings', () => {
  it('should extract all headings', () => {
    const markdown = `# H1
## H2
### H3
#### H4`;

    const headings = extractHeadings(markdown);
    expect(headings.length).toBe(4);
    expect(headings[0]).toEqual({ level: 1, text: 'H1' });
    expect(headings[1]).toEqual({ level: 2, text: 'H2' });
    expect(headings[2]).toEqual({ level: 3, text: 'H3' });
    expect(headings[3]).toEqual({ level: 4, text: 'H4' });
  });
});
