/**
 * DOCX Radio Button Field Visual Renderer
 * Creates styled visual representations of radio button groups using Unicode symbols
 */

import { Paragraph, TextRun } from 'docx';
import type { ResolvedStylesheet } from '../../../types/stylesheet.js';
import type { FieldOption } from '../../../types/index.js';
import { mapFontFamily, hexToDocxColor, ptToTwip } from '../utils.js';

// Unicode radio button symbols
const RADIO_UNSELECTED = '\u25CB'; // ○
const RADIO_SELECTED = '\u25C9'; // ◉

/**
 * Create a visual representation of a radio button
 */
export function createRadioButtonVisual(
  selected: boolean,
  stylesheet: ResolvedStylesheet
): TextRun {
  const style = stylesheet.fields.radio;
  const fontName = mapFontFamily('Helvetica');

  const symbol = selected ? RADIO_SELECTED : RADIO_UNSELECTED;

  return new TextRun({
    text: symbol,
    font: fontName,
    size: style.size * 2, // DOCX uses half-points
    color: hexToDocxColor(style.borderColor),
  });
}

/**
 * Create a radio group with options
 */
export function createRadioGroupVisual(
  fieldName: string,
  options: FieldOption[],
  selectedValue: string | undefined,
  stylesheet: ResolvedStylesheet
): Paragraph[] {
  const radioStyle = stylesheet.fields.radio;
  const labelStyle = stylesheet.fields.label;
  const fontName = mapFontFamily(labelStyle.fontFamily);

  return options.map((option) => {
    const isSelected = option.value === selectedValue || option.label === selectedValue;
    const symbol = isSelected ? RADIO_SELECTED : RADIO_UNSELECTED;

    return new Paragraph({
      spacing: {
        after: ptToTwip(4),
      },
      children: [
        new TextRun({
          text: `${symbol} `,
          font: fontName,
          size: radioStyle.size * 2,
          color: hexToDocxColor(radioStyle.borderColor),
        }),
        new TextRun({
          text: option.label,
          font: fontName,
          size: labelStyle.fontSize * 2,
          color: hexToDocxColor(labelStyle.color),
        }),
      ],
    });
  });
}

/**
 * Create radio group with label
 */
export function createRadioGroupWithLabel(
  fieldName: string,
  label: string,
  options: FieldOption[],
  selectedValue: string | undefined,
  required: boolean,
  stylesheet: ResolvedStylesheet
): Paragraph[] {
  const labelStyle = stylesheet.fields.label;
  const fontName = mapFontFamily(labelStyle.fontFamily);

  let labelText = label;
  if (required) {
    labelText += ' *';
  }

  const elements: Paragraph[] = [
    // Label paragraph
    new Paragraph({
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
    }),
    // Radio options
    ...createRadioGroupVisual(fieldName, options, selectedValue, stylesheet),
  ];

  return elements;
}
