/**
 * Design Tokens - Single Source of Truth for Styling
 *
 * All measurements are in points (pt) - the standard unit for PDF.
 * 1pt = 1/72 inch
 * 1px ≈ 0.75pt (at 96 DPI)
 * 1rem = 12pt (assuming 12pt base font)
 */

import type { FontFamily, StylesheetPageSize, AdmonitionVariant } from '../types/stylesheet.js';

// =============================================================================
// Unit Conversion Utilities
// =============================================================================

/** Convert points to pixels (for CSS) */
export const ptToPx = (pt: number): number => pt * (96 / 72); // 1pt = 1.333px

/** Convert points to rem (assuming 16px browser default) */
export const ptToRem = (pt: number): string => `${(ptToPx(pt) / 16).toFixed(4)}rem`;

/** Convert points to px string */
export const ptToPxStr = (pt: number): string => `${ptToPx(pt).toFixed(1)}px`;

// =============================================================================
// Color Tokens
// =============================================================================

export const colors = {
  // Grayscale
  black: '#000000',
  white: '#ffffff',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#f0f0f0',
    300: '#e0e0e0',
    400: '#cccccc',
    500: '#999999',
    600: '#767676',
    700: '#666666',
    800: '#555555',
    900: '#333333',
  },

  // Brand/Primary
  primary: {
    main: '#0066cc',
    dark: '#0052a3',
    light: '#e7f3ff',
  },

  // Semantic colors
  error: {
    main: '#dc3545',
    dark: '#721c24',
    light: '#f8d7da',
    text: '#c82333',
  },
  warning: {
    main: '#f0a000',
    dark: '#856404',
    light: '#fef3cd',
    text: '#664d03',
  },
  success: {
    main: '#28a745',
    dark: '#155724',
    light: '#d4edda',
    text: '#1e7e34',
  },
  info: {
    main: '#0c5460',
    dark: '#004085',
    light: '#d1ecf1',
    text: '#0c5460',
  },
  note: {
    main: '#666666',
    dark: '#333333',
    light: '#f0f0f0',
    text: '#333333',
  },
} as const;

// =============================================================================
// Typography Tokens (in points)
// =============================================================================

export const typography = {
  // Font families (maps to pdf-lib StandardFonts)
  fontFamily: {
    base: 'Helvetica' as FontFamily,
    bold: 'HelveticaBold' as FontFamily,
    mono: 'Courier' as FontFamily,
    monoBold: 'CourierBold' as FontFamily,
  },

  // Font sizes in points
  fontSize: {
    xs: 9, // Footer, fine print
    sm: 10, // Table cells, captions
    base: 11, // Labels, secondary text
    md: 12, // Body text, form fields
    lg: 14, // H4, emphasis
    xl: 16, // H2, H3
    '2xl': 18, // H1 secondary
    '3xl': 20, // H1 primary
  },

  // Line heights (multipliers)
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
  },
} as const;

// =============================================================================
// Spacing Tokens (in points)
// =============================================================================

export const spacing = {
  // Base spacing scale
  0: 0,
  1: 3, // ~4px
  2: 6, // ~8px
  3: 9, // ~12px
  4: 12, // ~16px
  5: 18, // ~24px
  6: 24, // ~32px
  8: 36, // ~48px
  10: 48, // ~64px

  // Semantic spacing
  page: {
    top: 72, // 1 inch
    bottom: 72,
    left: 72,
    right: 72,
  },
} as const;

// =============================================================================
// Border Tokens
// =============================================================================

export const borders = {
  width: {
    thin: 0.5,
    base: 1,
    medium: 1.5,
    thick: 2,
    heavy: 4,
  },
  radius: {
    sm: 2,
    base: 3,
    md: 4,
    lg: 6,
  },
} as const;

// =============================================================================
// Component-Specific Tokens
// =============================================================================

export const components = {
  // Page configuration
  page: {
    size: 'letter' as StylesheetPageSize,
    contentWidth: 468, // 612 - 72 - 72 (letter width minus margins)
  },

  // Headings
  heading: {
    h1: {
      fontSize: typography.fontSize['3xl'],
      fontFamily: typography.fontFamily.bold,
      color: colors.black,
      lineHeight: typography.lineHeight.tight,
      marginTop: 0,
      marginBottom: 18,
    },
    h2: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.black,
      lineHeight: typography.lineHeight.tight,
      marginTop: 24,
      marginBottom: 12,
    },
    h3: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.black,
      lineHeight: typography.lineHeight.tight,
      marginTop: 18,
      marginBottom: 12,
    },
    h4: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.bold,
      color: colors.black,
      lineHeight: typography.lineHeight.tight,
      marginTop: 12,
      marginBottom: 12,
    },
    h5: {
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.bold,
      color: colors.black,
      lineHeight: typography.lineHeight.tight,
      marginTop: 12,
      marginBottom: 12,
    },
    h6: {
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.bold,
      color: colors.black,
      lineHeight: typography.lineHeight.tight,
      marginTop: 12,
      marginBottom: 12,
    },
  },

  // Paragraph
  paragraph: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.base,
    color: colors.gray[800],
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: 12,
    maxWidth: 468,
  },

  // Horizontal rule
  rule: {
    thickness: borders.width.base,
    color: colors.gray[400],
    marginTop: 18,
    marginBottom: 18,
  },

  // Form fields
  field: {
    base: {
      borderWidth: borders.width.base,
      borderColor: colors.gray[600],
      backgroundColor: colors.primary.light, // Light blue background for form fields
    },
    text: {
      fontSize: typography.fontSize.sm,
      height: 20,
      padding: spacing[2],
    },
    textarea: {
      fontSize: typography.fontSize.sm,
      padding: spacing[2],
      lineHeight: typography.lineHeight.normal,
    },
    checkbox: {
      size: 12,
    },
    radio: {
      size: 12,
    },
    dropdown: {
      fontSize: typography.fontSize.sm,
      height: 20,
      padding: spacing[2],
    },
    signature: {
      fontSize: typography.fontSize.lg,
      requiredBorderColor: colors.error.dark,
      requiredBorderWidth: borders.width.thick,
    },
    label: {
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.base,
      color: colors.gray[900],
      marginBottom: spacing[2],
    },
  },

  // Tables
  table: {
    headerBackgroundColor: colors.gray[200],
    headerTextColor: colors.black,
    headerFontFamily: typography.fontFamily.bold,
    headerFontSize: typography.fontSize.sm,
    headerHeight: 24,
    rowBackgroundColor: colors.white,
    alternateRowColor: colors.gray[100],
    borderColor: colors.gray[500],
    borderWidth: borders.width.base,
    cellPadding: spacing[1],
    cellFontFamily: typography.fontFamily.base,
    cellFontSize: typography.fontSize.sm,
    cellTextColor: colors.gray[900],
    rowHeight: 22,
  },

  // Admonitions
  admonition: {
    borderWidth: borders.width.heavy,
    padding: spacing[3],
    titleFontFamily: typography.fontFamily.bold,
    titleFontSize: typography.fontSize.md,
    contentFontFamily: typography.fontFamily.base,
    contentFontSize: typography.fontSize.base,
    contentLineHeight: typography.lineHeight.normal,
    variants: {
      warning: {
        backgroundColor: colors.warning.light,
        borderColor: colors.warning.dark,
        titleColor: colors.warning.text,
        contentColor: colors.warning.text,
      },
      note: {
        backgroundColor: colors.note.light,
        borderColor: colors.note.main,
        titleColor: colors.note.text,
        contentColor: colors.note.text,
      },
      info: {
        backgroundColor: colors.info.light,
        borderColor: colors.info.main,
        titleColor: colors.info.text,
        contentColor: colors.info.text,
      },
      tip: {
        backgroundColor: colors.success.light,
        borderColor: colors.success.dark,
        titleColor: colors.success.text,
        contentColor: colors.success.text,
      },
      danger: {
        backgroundColor: colors.error.light,
        borderColor: colors.error.dark,
        titleColor: colors.error.text,
        contentColor: colors.error.text,
      },
    } as Record<
      AdmonitionVariant,
      {
        backgroundColor: string;
        borderColor: string;
        titleColor: string;
        contentColor: string;
      }
    >,
  },

  // Header/Footer
  header: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    color: colors.gray[700],
  },
  footer: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.base,
    color: colors.gray[700],
  },

  // Container (HTML specific proportions)
  container: {
    maxWidth: 612, // Match PDF letter width
    padding: spacing[4],
  },

  // Page Layout (HTML visual page simulation)
  pageLayout: {
    // A4 dimensions in pixels (at 96 DPI: 1pt = 1.333px)
    a4: {
      width: 793.7, // 595.28pt * (96/72)
      height: 1122.5, // 841.89pt * (96/72)
      contentWidth: 601.7, // (595.28 - 72 - 72)pt * (96/72) = 451.28pt in pixels
      margin: 96, // 72pt in pixels
    },
    // Letter dimensions in pixels
    letter: {
      width: 816, // 612pt * (96/72)
      height: 1056, // 792pt * (96/72)
      contentWidth: 624, // (612 - 72 - 72)pt * (96/72) = 468pt in pixels
      margin: 96, // 72pt in pixels
    },
    // Visual styling
    backgroundColor: '#e5e5e5',
    pageBackgroundColor: '#ffffff',
    pageShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    pageGap: 24,
    wrapperPadding: 24,
  },

  // Buttons (HTML specific)
  button: {
    fontSize: typography.fontSize.sm,
    paddingY: spacing[2],
    paddingX: spacing[3],
    borderRadius: borders.radius.base,
  },
} as const;

// =============================================================================
// Export all tokens
// =============================================================================

export const tokens = {
  colors,
  typography,
  spacing,
  borders,
  components,
} as const;

export type DesignTokens = typeof tokens;
