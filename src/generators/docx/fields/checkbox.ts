/**
 * DOCX Checkbox Field Visual Renderer
 * Creates styled visual representations of checkboxes using Unicode symbols
 */

import { Paragraph, TextRun } from 'docx';
import type { ResolvedStylesheet } from '../../../types/stylesheet.js';
import { mapFontFamily, hexToDocxColor, ptToTwip } from '../utils.js';

// Unicode checkbox symbols
const CHECKBOX_UNCHECKED = '\u2610'; // ☐
const CHECKBOX_CHECKED = '\u2611'; // ☑

/**
 * Create a visual representation of a checkbox field
 */
export function createCheckboxVisual(
  fieldName: string,
  checked: boolean,
  stylesheet: ResolvedStylesheet
): Paragraph {
  const style = stylesheet.fields.checkbox;
  const fontName = mapFontFamily('Helvetica');

  // Use Unicode checkbox symbols
  const symbol = checked ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED;

  return new Paragraph({
    spacing: {
      after: ptToTwip(4),
    },
    children: [
      new TextRun({
        text: symbol,
        font: fontName,
        size: style.size * 2, // DOCX uses half-points
        color: hexToDocxColor(style.borderColor),
      }),
    ],
  });
}

/**
 * Create checkbox with label to the right
 */
export function createCheckboxWithLabel(
  fieldName: string,
  label: string,
  checked: boolean,
  required: boolean,
  stylesheet: ResolvedStylesheet
): Paragraph {
  const checkboxStyle = stylesheet.fields.checkbox;
  const labelStyle = stylesheet.fields.label;
  const fontName = mapFontFamily(labelStyle.fontFamily);

  const symbol = checked ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED;

  let labelText = label;
  if (required) {
    labelText += ' *';
  }

  return new Paragraph({
    spacing: {
      after: ptToTwip(8),
    },
    children: [
      new TextRun({
        text: `${symbol} `,
        font: fontName,
        size: checkboxStyle.size * 2,
        color: hexToDocxColor(checkboxStyle.borderColor),
      }),
      new TextRun({
        text: labelText,
        font: fontName,
        size: labelStyle.fontSize * 2,
        color: hexToDocxColor(labelStyle.color),
      }),
    ],
  });
}
