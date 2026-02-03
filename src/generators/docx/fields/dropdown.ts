/**
 * DOCX Dropdown Field Visual Renderer
 * Creates styled visual representations of dropdown/select fields
 */

import { Paragraph, TextRun, BorderStyle } from 'docx';
import type { ResolvedStylesheet } from '../../../types/stylesheet.js';
import type { FieldOption } from '../../../types/index.js';
import { mapFontFamily, hexToDocxColor, ptToTwip } from '../utils.js';

/**
 * Create a visual representation of a dropdown field (bordered box with hint)
 */
export function createDropdownVisual(
  fieldName: string,
  options: FieldOption[],
  selectedValue: string | undefined,
  stylesheet: ResolvedStylesheet
): Paragraph {
  const style = stylesheet.fields.dropdown;
  const fontName = mapFontFamily('Helvetica');

  // Display selected value or placeholder
  let displayText: string;
  if (selectedValue) {
    const selectedOption = options.find(
      (opt) => opt.value === selectedValue || opt.label === selectedValue
    );
    displayText = selectedOption ? selectedOption.label : selectedValue;
  } else {
    displayText = '(select)';
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
      after: ptToTwip(8),
    },
    children: [
      new TextRun({
        text: displayText,
        font: fontName,
        size: style.fontSize * 2,
        color: selectedValue ? '000000' : '808080', // Gray for placeholder
      }),
      new TextRun({
        text: ' \u25BC', // Dropdown arrow ▼
        font: fontName,
        size: style.fontSize * 2,
        color: '808080',
      }),
    ],
  });
}

/**
 * Create dropdown with label
 */
export function createDropdownWithLabel(
  fieldName: string,
  label: string,
  options: FieldOption[],
  selectedValue: string | undefined,
  required: boolean,
  labelPosition: 'left' | 'right' | 'above' | 'none',
  stylesheet: ResolvedStylesheet
): Paragraph[] {
  const labelStyle = stylesheet.fields.label;
  const fontName = mapFontFamily(labelStyle.fontFamily);

  if (labelPosition === 'none') {
    return [createDropdownVisual(fieldName, options, selectedValue, stylesheet)];
  }

  let labelText = label;
  if (required) {
    labelText += ' *';
  }

  if (labelPosition === 'above') {
    return [
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
      // Dropdown
      createDropdownVisual(fieldName, options, selectedValue, stylesheet),
    ];
  }

  // For left/right positions, combine in single paragraph
  const style = stylesheet.fields.dropdown;
  let displayText: string;
  if (selectedValue) {
    const selectedOption = options.find(
      (opt) => opt.value === selectedValue || opt.label === selectedValue
    );
    displayText = selectedOption ? selectedOption.label : selectedValue;
  } else {
    displayText = '(select)';
  }

  const labelRun = new TextRun({
    text: labelText,
    font: fontName,
    size: labelStyle.fontSize * 2,
    color: hexToDocxColor(labelStyle.color),
  });

  const spacerRun = new TextRun({
    text: '  ',
  });

  const dropdownRun = new TextRun({
    text: `[${displayText} \u25BC]`,
    font: fontName,
    size: style.fontSize * 2,
    color: selectedValue ? '000000' : '808080',
  });

  const children =
    labelPosition === 'left'
      ? [labelRun, spacerRun, dropdownRun]
      : [dropdownRun, spacerRun, labelRun];

  return [
    new Paragraph({
      spacing: {
        after: ptToTwip(8),
      },
      children,
    }),
  ];
}
