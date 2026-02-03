/**
 * DOCX Content Renderer
 * Renders content elements (headings, paragraphs, admonitions, rules, tables, spacers)
 */

import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  ShadingType,
  HeadingLevel,
} from 'docx';
import type {
  SchemaContentElement,
  HeadingContent,
  ParagraphContent,
  AdmonitionContent,
  SpacerContent,
  TableContent,
  TableCell as SchemaTableCell,
  TableRow as SchemaTableRow,
  TableColumn,
  FieldContent,
} from '../../types/index.js';
import type { ResolvedStylesheet } from '../../types/stylesheet.js';
import { normalizeFieldOptions } from '../../parsers/schema.js';
import { mapFontFamily, isBoldFont, isItalicFont, hexToDocxColor, ptToTwip } from './utils.js';
import {
  createTextFieldVisual,
  createTextareaVisual,
  createCheckboxVisual,
  createDropdownVisual,
} from './fields/index.js';

/** Prefix labels for admonition variants */
const ADMONITION_PREFIXES: Record<string, string> = {
  warning: 'Warning',
  note: 'Note',
  info: 'Info',
  tip: 'Tip',
  danger: 'Danger',
};

/**
 * Render all content elements from schema
 */
export function renderSchemaContent(
  content: SchemaContentElement[],
  stylesheet: ResolvedStylesheet
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const element of content) {
    const rendered = renderContentElement(element, stylesheet);
    if (Array.isArray(rendered)) {
      elements.push(...rendered);
    } else {
      elements.push(rendered);
    }
  }

  return elements;
}

/**
 * Render a single content element
 */
function renderContentElement(
  element: SchemaContentElement,
  stylesheet: ResolvedStylesheet
): Paragraph | Table | (Paragraph | Table)[] {
  switch (element.type) {
    case 'heading':
      return renderHeading(element, stylesheet);
    case 'paragraph':
      return renderParagraph(element, stylesheet);
    case 'admonition':
      return renderAdmonition(element, stylesheet);
    case 'rule':
      return renderRule(stylesheet);
    case 'spacer':
      return renderSpacer(element);
    case 'table':
      return renderTable(element, stylesheet);
    case 'field':
      return renderField(element, stylesheet);
    default:
      // Unknown element type, return empty paragraph
      return new Paragraph({});
  }
}

/**
 * Render heading content
 */
function renderHeading(element: HeadingContent, stylesheet: ResolvedStylesheet): Paragraph {
  const level = Math.max(1, Math.min(6, element.level)) as 1 | 2 | 3 | 4 | 5 | 6;
  const style = stylesheet.headings[level];
  const fontName = mapFontFamily(style.fontFamily);
  const bold = isBoldFont(style.fontFamily);
  const italics = isItalicFont(style.fontFamily);

  // Map heading level to DOCX HeadingLevel
  const headingLevelMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  return new Paragraph({
    heading: headingLevelMap[level],
    spacing: {
      before: ptToTwip(style.marginTop),
      after: ptToTwip(style.marginBottom),
    },
    children: [
      new TextRun({
        text: element.text,
        font: fontName,
        size: style.fontSize * 2, // DOCX uses half-points
        color: hexToDocxColor(style.color),
        bold,
        italics,
      }),
    ],
  });
}

/**
 * Render paragraph content
 */
function renderParagraph(element: ParagraphContent, stylesheet: ResolvedStylesheet): Paragraph {
  const style = stylesheet.paragraph;
  const fontName = mapFontFamily(style.fontFamily);
  const bold = isBoldFont(style.fontFamily);
  const italics = isItalicFont(style.fontFamily);
  const fontSize = element.fontSize ?? style.fontSize;

  return new Paragraph({
    spacing: {
      after: ptToTwip(style.marginBottom),
      line: style.lineHeight ? Math.round(style.lineHeight * 240) : 360, // 240 = single spacing
    },
    children: [
      new TextRun({
        text: element.text,
        font: fontName,
        size: fontSize * 2, // DOCX uses half-points
        color: hexToDocxColor(style.color),
        bold,
        italics,
      }),
    ],
  });
}

/**
 * Render admonition content as a styled table (for border effect)
 */
function renderAdmonition(element: AdmonitionContent, stylesheet: ResolvedStylesheet): Table {
  const style = stylesheet.admonitions[element.variant] ?? stylesheet.admonitions.note;
  const prefix = ADMONITION_PREFIXES[element.variant] ?? 'Note';
  const titleText = `${prefix}: ${element.title}`;

  const titleFontName = mapFontFamily(style.titleFontFamily);
  const contentFontName = mapFontFamily(style.contentFontFamily);
  const contentBold = isBoldFont(style.contentFontFamily);

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          // Left border accent cell
          new TableCell({
            width: {
              size: ptToTwip(style.borderWidth),
              type: WidthType.DXA,
            },
            shading: {
              type: ShadingType.SOLID,
              color: hexToDocxColor(style.borderColor),
              fill: hexToDocxColor(style.borderColor),
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [new Paragraph({})],
          }),
          // Content cell
          new TableCell({
            shading: {
              type: ShadingType.SOLID,
              color: hexToDocxColor(style.backgroundColor),
              fill: hexToDocxColor(style.backgroundColor),
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: {
              top: ptToTwip(style.padding),
              bottom: ptToTwip(style.padding),
              left: ptToTwip(style.padding),
              right: ptToTwip(style.padding),
            },
            children: [
              // Title
              new Paragraph({
                spacing: { after: ptToTwip(6) },
                children: [
                  new TextRun({
                    text: titleText,
                    font: titleFontName,
                    size: style.titleFontSize * 2,
                    color: hexToDocxColor(style.titleColor),
                    bold: true, // Title is typically bold
                  }),
                ],
              }),
              // Content
              new Paragraph({
                spacing: {
                  line: Math.round(style.contentLineHeight * 240),
                },
                children: [
                  new TextRun({
                    text: element.text,
                    font: contentFontName,
                    size: style.contentFontSize * 2,
                    color: hexToDocxColor(style.contentColor),
                    bold: contentBold,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Render horizontal rule as a paragraph with bottom border
 */
function renderRule(stylesheet: ResolvedStylesheet): Paragraph {
  const style = stylesheet.rule;

  return new Paragraph({
    spacing: {
      before: ptToTwip(style.marginTop),
      after: ptToTwip(style.marginBottom),
    },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: style.thickness * 8, // Border size in 1/8 points
        color: hexToDocxColor(style.color),
      },
    },
    children: [], // Empty paragraph with just border
  });
}

/**
 * Render spacer as empty paragraph with specific spacing
 */
function renderSpacer(element: SpacerContent): Paragraph {
  return new Paragraph({
    spacing: {
      after: ptToTwip(element.height),
    },
    children: [],
  });
}

/**
 * Expand simplified table definitions to full table structure
 */
function expandTableDefinition(table: TableContent): TableContent {
  // If using rowCount with fieldPrefix, generate explicit rows
  if (table.rowCount && table.fieldPrefix) {
    const rows: SchemaTableRow[] = [];
    for (let i = 1; i <= table.rowCount; i++) {
      const cells: SchemaTableCell[] = table.columns.map((col: TableColumn) => {
        if (col.cellType === 'label') {
          return { type: 'label' as const, value: '' };
        }
        const prefix = table.fieldPrefix ?? 'field';
        const fieldName = col.fieldSuffix
          ? `${prefix}_${col.fieldSuffix}_${i}`
          : `${prefix}_col${table.columns.indexOf(col)}_${i}`;
        if (col.cellType === 'dropdown') {
          return {
            type: 'dropdown' as const,
            fieldName,
            options: col.options ?? [],
          };
        }
        if (col.cellType === 'checkbox') {
          return { type: 'checkbox' as const, fieldName };
        }
        return { type: 'text' as const, fieldName };
      });
      rows.push({ cells });
    }
    return { ...table, rows };
  }

  // If using values syntax in rows, expand to full cells
  if (table.rows?.some((r) => r.values)) {
    const expandedRows: SchemaTableRow[] = table.rows.map((row) => {
      if (!row.values) return row;
      const cells: SchemaTableCell[] = row.values.map((value, colIndex) => {
        const col = table.columns[colIndex];
        if (!col) {
          return { type: 'label' as const, value: String(value) };
        }

        if (col.cellType === 'label') {
          return { type: 'label' as const, value: String(value) };
        }

        const fieldName = String(value);
        if (fieldName === '') {
          return { type: 'label' as const, value: '' };
        }

        if (col.cellType === 'dropdown') {
          return {
            type: 'dropdown' as const,
            fieldName,
            options: col.options ?? [],
          };
        }
        if (col.cellType === 'checkbox') {
          return {
            type: 'checkbox' as const,
            fieldName,
            default: typeof value === 'boolean' ? value : undefined,
          };
        }
        if (col.cellType === 'text') {
          return { type: 'text' as const, fieldName };
        }

        if (typeof value === 'boolean') {
          return { type: 'checkbox' as const, fieldName: '', default: value };
        }
        if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldName)) {
          return { type: 'text' as const, fieldName };
        }
        return { type: 'label' as const, value: typeof value === 'string' ? value : String(value) };
      });
      return { cells };
    });
    return { ...table, rows: expandedRows };
  }

  return table;
}

/**
 * Render table content
 */
function renderTable(element: TableContent, stylesheet: ResolvedStylesheet): (Paragraph | Table)[] {
  const expandedTable = expandTableDefinition(element);
  const style = stylesheet.table;
  const showBorders = expandedTable.showBorders !== false;
  const rowHeight = expandedTable.rowHeight ?? style.rowHeight;
  const headerHeight = expandedTable.headerHeight ?? style.headerHeight;

  const elements: (Paragraph | Table)[] = [];

  // Add table label if provided
  if (expandedTable.label) {
    const labelStyle = stylesheet.fields.label;
    elements.push(
      new Paragraph({
        spacing: { after: ptToTwip(4) },
        children: [
          new TextRun({
            text: expandedTable.label,
            font: mapFontFamily(labelStyle.fontFamily),
            size: labelStyle.fontSize * 2,
            color: hexToDocxColor(labelStyle.color),
          }),
        ],
      })
    );
  }

  // Calculate column widths
  const totalWidth = expandedTable.columns.reduce((sum, col) => sum + col.width, 0);

  // Create header row
  const headerFontName = mapFontFamily(style.headerFontFamily);
  const headerCells = expandedTable.columns.map(
    (col) =>
      new TableCell({
        width: {
          size: Math.round((col.width / totalWidth) * 100),
          type: WidthType.PERCENTAGE,
        },
        shading: {
          type: ShadingType.SOLID,
          color: hexToDocxColor(style.headerBackgroundColor),
          fill: hexToDocxColor(style.headerBackgroundColor),
        },
        verticalAlign: VerticalAlign.CENTER,
        margins: {
          top: ptToTwip(style.cellPadding),
          bottom: ptToTwip(style.cellPadding),
          left: ptToTwip(style.cellPadding),
          right: ptToTwip(style.cellPadding),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: col.label,
                font: headerFontName,
                size: style.headerFontSize * 2,
                color: hexToDocxColor(style.headerTextColor),
                bold: true,
              }),
            ],
          }),
        ],
      })
  );

  // Create data rows
  const dataRows = (expandedTable.rows ?? []).map((row, rowIndex) => {
    const isAlternate = rowIndex % 2 === 1;
    const bgColor = isAlternate ? style.alternateRowColor : style.rowBackgroundColor;

    const cells = (row.cells ?? []).map((cell, colIndex) => {
      const col = expandedTable.columns[colIndex];
      if (!col) return createEmptyTableCell(bgColor, style);

      return createTableCell(cell, col, bgColor, style, stylesheet);
    });

    return new TableRow({
      height: {
        value: ptToTwip(rowHeight),
        rule: 'atLeast' as const,
      },
      children: cells,
    });
  });

  // Create table
  const borderStyle = showBorders
    ? {
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
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: style.borderWidth * 8,
          color: hexToDocxColor(style.borderColor),
        },
        insideVertical: {
          style: BorderStyle.SINGLE,
          size: style.borderWidth * 8,
          color: hexToDocxColor(style.borderColor),
        },
      }
    : undefined;

  elements.push(
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: borderStyle,
      rows: [
        new TableRow({
          height: {
            value: ptToTwip(headerHeight),
            rule: 'atLeast' as const,
          },
          tableHeader: true,
          children: headerCells,
        }),
        ...dataRows,
      ],
    })
  );

  return elements;
}

/**
 * Create empty table cell
 */
function createEmptyTableCell(bgColor: string, style: ResolvedStylesheet['table']): TableCell {
  return new TableCell({
    shading: {
      type: ShadingType.SOLID,
      color: hexToDocxColor(bgColor),
      fill: hexToDocxColor(bgColor),
    },
    margins: {
      top: ptToTwip(style.cellPadding),
      bottom: ptToTwip(style.cellPadding),
      left: ptToTwip(style.cellPadding),
      right: ptToTwip(style.cellPadding),
    },
    children: [new Paragraph({})],
  });
}

/**
 * Create table cell with content
 */
function createTableCell(
  cell: SchemaTableCell,
  col: TableColumn,
  bgColor: string,
  style: ResolvedStylesheet['table'],
  stylesheet: ResolvedStylesheet
): TableCell {
  const cellFontName = mapFontFamily(style.cellFontFamily);

  let content: Paragraph;

  if (cell.type === 'label') {
    content = new Paragraph({
      children: [
        new TextRun({
          text: cell.value,
          font: cellFontName,
          size: style.cellFontSize * 2,
          color: hexToDocxColor(style.cellTextColor),
        }),
      ],
    });
  } else if (cell.type === 'text') {
    content = createTextFieldVisual(cell.fieldName, cell.default as string | undefined, stylesheet);
  } else if (cell.type === 'dropdown') {
    const options = normalizeFieldOptions(cell.options);
    content = createDropdownVisual(
      cell.fieldName,
      options,
      cell.default as string | undefined,
      stylesheet
    );
  } else if (cell.type === 'checkbox') {
    content = createCheckboxVisual(cell.fieldName, cell.default === true, stylesheet);
  } else {
    content = new Paragraph({});
  }

  return new TableCell({
    shading: {
      type: ShadingType.SOLID,
      color: hexToDocxColor(bgColor),
      fill: hexToDocxColor(bgColor),
    },
    verticalAlign: VerticalAlign.CENTER,
    margins: {
      top: ptToTwip(style.cellPadding),
      bottom: ptToTwip(style.cellPadding),
      left: ptToTwip(style.cellPadding),
      right: ptToTwip(style.cellPadding),
    },
    children: [content],
  });
}

/**
 * Render standalone field content
 */
function renderField(element: FieldContent, stylesheet: ResolvedStylesheet): Paragraph[] {
  const labelStyle = stylesheet.fields.label;
  const labelPosition = element.labelPosition ?? 'above';
  const elements: Paragraph[] = [];

  // Add label (labelPosition is 'above' or 'left')
  if (labelPosition) {
    elements.push(
      new Paragraph({
        spacing: { after: ptToTwip(4) },
        children: [
          new TextRun({
            text: element.label,
            font: mapFontFamily(labelStyle.fontFamily),
            size: labelStyle.fontSize * 2,
            color: hexToDocxColor(labelStyle.color),
          }),
        ],
      })
    );
  }

  // Add field visual based on type
  let fieldParagraph: Paragraph;
  switch (element.fieldType) {
    case 'text':
      fieldParagraph = createTextFieldVisual(
        element.fieldName,
        element.default as string | undefined,
        stylesheet
      );
      break;
    case 'textarea':
      fieldParagraph = createTextareaVisual(
        element.fieldName,
        element.default as string | undefined,
        stylesheet,
        element.height
      );
      break;
    case 'dropdown': {
      const options = normalizeFieldOptions(element.options);
      fieldParagraph = createDropdownVisual(
        element.fieldName,
        options,
        element.default as string | undefined,
        stylesheet
      );
      break;
    }
    case 'checkbox':
      fieldParagraph = createCheckboxVisual(
        element.fieldName,
        element.default === true,
        stylesheet
      );
      break;
    default:
      fieldParagraph = new Paragraph({});
  }

  elements.push(fieldParagraph);
  return elements;
}
