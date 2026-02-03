/**
 * DOCX Text Field Visual Renderer
 * Creates styled visual representations of text input fields
 */

import { Paragraph, TextRun, BorderStyle } from 'docx';
import type { ResolvedStylesheet } from '../../../types/stylesheet.js';
import { mapFontFamily, hexToDocxColor, ptToTwip } from '../utils.js';

/**
 * Create a visual representation of a text input field (bordered box)
 */
export function createTextFieldVisual(
  fieldName: string,
  defaultValue: string | undefined,
  stylesheet: ResolvedStylesheet
): Paragraph {
  const style = stylesheet.fields.text;
  const fontName = mapFontFamily('Helvetica');

  // Display default value or placeholder underscores
  const displayText = defaultValue ?? '_'.repeat(20);

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
      after: ptToTwip(8),
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
 * Draw text field label
 */
export function createTextFieldLabel(
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
