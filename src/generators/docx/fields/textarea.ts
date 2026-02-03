/**
 * DOCX Textarea Field Visual Renderer
 * Creates styled visual representations of multi-line text areas
 */

import { Paragraph, TextRun, BorderStyle } from 'docx';
import type { ResolvedStylesheet } from '../../../types/stylesheet.js';
import { mapFontFamily, hexToDocxColor, ptToTwip } from '../utils.js';

/**
 * Create a visual representation of a textarea field (bordered box with multiple lines)
 */
export function createTextareaVisual(
  fieldName: string,
  defaultValue: string | undefined,
  stylesheet: ResolvedStylesheet,
  height?: number
): Paragraph {
  const style = stylesheet.fields.textarea;
  const fontName = mapFontFamily('Helvetica');

  // Calculate approximate line count based on height
  const lineCount = height ? Math.max(3, Math.floor(height / style.fontSize)) : 4;

  // Display default value or placeholder with multiple lines
  let displayText: string;
  if (defaultValue) {
    displayText = defaultValue;
  } else {
    // Create placeholder lines
    const lines = Array(lineCount).fill('_'.repeat(40));
    displayText = lines.join('\n');
  }

  return new Paragraph({
    border: {
      top: {
        style: BorderStyle.SINGLE,
        size: style.borderWidth * 8,
        color: hexToDocxColor(style.borderColor),
      },
      bottom: {
        style: BorderStyle.SINGLE,
        size: style.borderWidth * 8,
        color: hexToDocxColor(style.borderColor),
      },
      left: {
        style: BorderStyle.SINGLE,
        size: style.borderWidth * 8,
        color: hexToDocxColor(style.borderColor),
      },
      right: {
        style: BorderStyle.SINGLE,
        size: style.borderWidth * 8,
        color: hexToDocxColor(style.borderColor),
      },
    },
    spacing: {
      after: ptToTwip(12),
      line: Math.round(style.lineHeight * 240),
    },
    children: [
      new TextRun({
        text: displayText,
        font: fontName,
        size: style.fontSize * 2,
        color: defaultValue ? '000000' : 'CCCCCC', // Gray for placeholder
      }),
    ],
  });
}

/**
 * Draw textarea field label
 */
export function createTextareaLabel(
  label: string,
  required: boolean,
  stylesheet: ResolvedStylesheet
): Paragraph {
  const labelStyle = stylesheet.fields.label;
  const fontName = mapFontFamily(labelStyle.fontFamily);

  let labelText = label;
  if (required) {
    labelText += ' *';
  }

  return new Paragraph({
    spacing: {
      after: ptToTwip(4),
    },
    children: [
      new TextRun({
        text: labelText,
        font: fontName,
        size: labelStyle.fontSize * 2,
        color: hexToDocxColor(labelStyle.color),
      }),
    ],
  });
}
