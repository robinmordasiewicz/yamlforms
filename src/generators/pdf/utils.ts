/**
 * PDF Generation Utilities
 */

import { rgb, type RGB } from 'pdf-lib';

/**
 * Convert hex color string to PDF-lib RGB
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  return rgb(r, g, b);
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(color: RGB): string {
  const r = Math.round(color.red * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.green * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.blue * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Calculate text width (approximate)
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  // Average character width is approximately 0.5 * fontSize for Helvetica
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

/**
 * Convert points to inches
 */
export function pointsToInches(points: number): number {
  return points / 72;
}

/**
 * Convert inches to points
 */
export function inchesToPoints(inches: number): number {
  return inches * 72;
}

/**
 * Convert millimeters to points
 */
export function mmToPoints(mm: number): number {
  return mm * 2.83465;
}

/**
 * Convert points to millimeters
 */
export function pointsToMm(points: number): number {
  return points / 2.83465;
}

