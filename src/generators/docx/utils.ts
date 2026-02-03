/**
 * DOCX Generation Utilities
 */

/**
 * Convert points to twips (1/20th of a point)
 * DOCX uses twips for measurements
 */
export function ptToTwip(points: number): number {
  return Math.round(points * 20);
}

/**
 * Convert points to EMUs (English Metric Units)
 * DOCX uses EMUs for some measurements (914400 EMUs = 1 inch, 1 inch = 72 points)
 */
export function ptToEmu(points: number): number {
  return Math.round(points * (914400 / 72));
}

/**
 * Convert hex color string to DOCX color format (without #)
 */
export function hexToDocxColor(hex: string): string {
  return hex.replace(/^#/, '');
}

/**
 * Map font family names to DOCX-compatible font names
 */
export function mapFontFamily(fontFamily: string): string {
  const fontMap: Record<string, string> = {
    Helvetica: 'Arial',
    HelveticaBold: 'Arial',
    HelveticaOblique: 'Arial',
    HelveticaBoldOblique: 'Arial',
    Courier: 'Courier New',
    CourierBold: 'Courier New',
    CourierOblique: 'Courier New',
    CourierBoldOblique: 'Courier New',
    TimesRoman: 'Times New Roman',
    TimesRomanBold: 'Times New Roman',
    TimesRomanItalic: 'Times New Roman',
    TimesRomanBoldItalic: 'Times New Roman',
  };
  return fontMap[fontFamily] || 'Arial';
}

/**
 * Check if font family is bold variant
 */
export function isBoldFont(fontFamily: string): boolean {
  return fontFamily.includes('Bold');
}

/**
 * Check if font family is italic variant
 */
export function isItalicFont(fontFamily: string): boolean {
  return fontFamily.includes('Oblique') || fontFamily.includes('Italic');
}

/**
 * Estimate text width (approximate)
 * Used internally by wrapText
 */
function estimateTextWidth(text: string, fontSize: number): number {
  // Average character width is approximately 0.5 * fontSize for Helvetica/Arial
  return text.length * fontSize * 0.5;
}

/**
 * Wrap text to fit within a width
 */
export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = estimateTextWidth(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
