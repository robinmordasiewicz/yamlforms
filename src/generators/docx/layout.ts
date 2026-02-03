/**
 * DOCX Layout Module
 * Handles page setup, sections, headers/footers, margins
 */

import {
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  AlignmentType,
  PageOrientation,
  convertInchesToTwip,
} from 'docx';
import type { DocxConfig, PageSize } from '../../types/index.js';
import type { ResolvedStylesheet } from '../../types/stylesheet.js';
import { PAGE_SIZES } from '../../types/index.js';
import { mapFontFamily, isBoldFont, isItalicFont, ptToTwip, hexToDocxColor } from './utils.js';

/**
 * Page dimensions for DOCX (in twips)
 */
export interface DocxPageDimensions {
  width: number;
  height: number;
}

/**
 * Get page dimensions in twips for DOCX
 */
export function getPageDimensions(pageSize: PageSize): DocxPageDimensions {
  const size = PAGE_SIZES[pageSize];
  return {
    width: ptToTwip(size.width),
    height: ptToTwip(size.height),
  };
}

/**
 * Create document section properties
 */
export function createSectionProperties(
  config: DocxConfig,
  stylesheet: ResolvedStylesheet
): {
  page: {
    size: {
      width: number;
      height: number;
      orientation: (typeof PageOrientation)[keyof typeof PageOrientation];
    };
    margin: { top: number; right: number; bottom: number; left: number };
  };
} {
  const pageDimensions = getPageDimensions(stylesheet.page.size);
  const margins = stylesheet.page.margins;

  return {
    page: {
      size: {
        width: pageDimensions.width,
        height: pageDimensions.height,
        orientation: PageOrientation.PORTRAIT,
      },
      margin: {
        top: ptToTwip(margins.top),
        right: ptToTwip(margins.right),
        bottom: ptToTwip(margins.bottom),
        left: ptToTwip(margins.left),
      },
    },
  };
}

/**
 * Create header for document
 */
export function createHeader(
  title: string,
  stylesheet: ResolvedStylesheet,
  showPageNumbers = true
): Header {
  const style = stylesheet.header;
  const fontName = mapFontFamily(style.fontFamily);
  const bold = isBoldFont(style.fontFamily);
  const italics = isItalicFont(style.fontFamily);

  const children: Paragraph[] = [];

  if (showPageNumbers) {
    // Header with title on left, page numbers on right
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            font: fontName,
            size: style.fontSize * 2, // DOCX uses half-points
            color: hexToDocxColor(style.color),
            bold,
            italics,
          }),
          new TextRun({
            text: '\t\t',
          }),
          new TextRun({
            text: 'Page ',
            font: fontName,
            size: style.fontSize * 2,
            color: hexToDocxColor(style.color),
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            font: fontName,
            size: style.fontSize * 2,
            color: hexToDocxColor(style.color),
          }),
          new TextRun({
            text: ' of ',
            font: fontName,
            size: style.fontSize * 2,
            color: hexToDocxColor(style.color),
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            font: fontName,
            size: style.fontSize * 2,
            color: hexToDocxColor(style.color),
          }),
        ],
        tabStops: [
          {
            type: 'right' as const,
            position: convertInchesToTwip(6.5), // Right margin position
          },
        ],
      })
    );
  } else {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            font: fontName,
            size: style.fontSize * 2,
            color: hexToDocxColor(style.color),
            bold,
            italics,
          }),
        ],
      })
    );
  }

  return new Header({
    children,
  });
}

/**
 * Create footer for document
 */
export function createFooter(text: string, stylesheet: ResolvedStylesheet): Footer {
  const style = stylesheet.footer;
  const fontName = mapFontFamily(style.fontFamily);
  const bold = isBoldFont(style.fontFamily);
  const italics = isItalicFont(style.fontFamily);

  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            font: fontName,
            size: style.fontSize * 2, // DOCX uses half-points
            color: hexToDocxColor(style.color),
            bold,
            italics,
          }),
        ],
      }),
    ],
  });
}

/**
 * Calculate content area width in points
 */
export function getContentWidth(stylesheet: ResolvedStylesheet): number {
  const pageSize = PAGE_SIZES[stylesheet.page.size];
  const margins = stylesheet.page.margins;
  return pageSize.width - margins.left - margins.right;
}
