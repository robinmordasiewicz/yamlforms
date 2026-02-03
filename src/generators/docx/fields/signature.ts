/**
 * DOCX Signature Field Visual Renderer
 * Creates styled visual representations of signature fields
 */

import { Paragraph, TextRun, BorderStyle } from 'docx';
import type { ResolvedStylesheet } from '../../../types/stylesheet.js';
import { mapFontFamily, hexToDocxColor, ptToTwip } from '../utils.js';

/**
 * Create a visual representation of a signature field
 */
export function createSignatureVisual(
  fieldName: string,
  stylesheet: ResolvedStylesheet
): Paragraph {
  const style = stylesheet.fields.signature;
  const fontName = mapFontFamily('Helvetica');

  // Create signature line with "X" indicator
  return new Paragraph({
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 8, // 1pt line
        color: hexToDocxColor(style.borderColor),
      },
    },
    spacing: {
      before: ptToTwip(20),
      after: ptToTwip(4),
    },
    children: [
      new TextRun({
        text: 'X',
        font: fontName,
        size: 24, // 12pt
        color: hexToDocxColor(style.borderColor),
      }),
      new TextRun({
        text: '_'.repeat(40),
        font: fontName,
        size: style.fontSize * 2,
        color: 'FFFFFF', // White/invisible underscores (the border is the line)
      }),
    ],
  });
}

/**
 * Create signature field with label and optional date field
 */
export function createSignatureWithLabel(
  fieldName: string,
  label: string,
  required: boolean,
  stylesheet: ResolvedStylesheet,
  options: { includeDate?: boolean; includeLine?: boolean } = {}
): Paragraph[] {
  const labelStyle = stylesheet.fields.label;
  const signatureStyle = stylesheet.fields.signature;
  const fontName = mapFontFamily(labelStyle.fontFamily);

  let labelText = label;
  if (required) {
    labelText += ' *';
  }

  const elements: Paragraph[] = [];

  // Label
  elements.push(
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
    })
  );

  // Signature line with X indicator
  if (options.includeLine !== false) {
    const borderColor = required ? signatureStyle.requiredBorderColor : signatureStyle.borderColor;

    elements.push(
      new Paragraph({
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: required ? signatureStyle.requiredBorderWidth * 8 : 8,
            color: hexToDocxColor(borderColor),
          },
        },
        spacing: {
          before: ptToTwip(16),
          after: ptToTwip(2),
        },
        children: [
          new TextRun({
            text: 'X ',
            font: fontName,
            size: 24, // 12pt
            color: 'CC0000', // Red X for emphasis
            bold: true,
          }),
          new TextRun({
            text: ' '.repeat(60), // Space for signature
            font: fontName,
            size: signatureStyle.fontSize * 2,
          }),
        ],
      })
    );

    // "Sign Here" hint
    elements.push(
      new Paragraph({
        spacing: {
          after: ptToTwip(8),
        },
        children: [
          new TextRun({
            text: 'Sign Here',
            font: fontName,
            size: 16, // 8pt
            color: '808080',
            italics: true,
          }),
        ],
      })
    );
  }

  // Date field if requested
  if (options.includeDate) {
    elements.push(
      new Paragraph({
        spacing: {
          before: ptToTwip(8),
          after: ptToTwip(4),
        },
        children: [
          new TextRun({
            text: 'Date:',
            font: fontName,
            size: labelStyle.fontSize * 2,
            color: hexToDocxColor(labelStyle.color),
          }),
        ],
      })
    );

    elements.push(
      new Paragraph({
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 8,
            color: hexToDocxColor(signatureStyle.borderColor),
          },
        },
        spacing: {
          after: ptToTwip(8),
        },
        children: [
          new TextRun({
            text: '____ / ____ / ________',
            font: fontName,
            size: signatureStyle.fontSize * 2,
            color: 'CCCCCC',
          }),
        ],
      })
    );
  }

  return elements;
}
