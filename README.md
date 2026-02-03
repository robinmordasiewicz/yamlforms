# yamlforms

[![npm version](https://img.shields.io/npm/v/yamlforms.svg)](https://www.npmjs.com/package/yamlforms)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate fillable PDF forms, interactive HTML forms, and styled DOCX documents from YAML schema definitions.

## Features

- **Multi-format output** -- PDF with AcroForm fields, interactive HTML, and styled DOCX from a single schema
- **Rich content types** -- headings, paragraphs, tables, admonitions, horizontal rules, and spacers
- **Form field types** -- text, textarea, checkbox, radio, dropdown, and signature
- **Tables with embedded form fields** -- text, dropdown, and checkbox cells inside table rows
- **Calculated fields** -- formulas that compute values from other fields (number, currency, percentage, text)
- **Conditional logic** -- show, hide, enable, or disable fields based on trigger values
- **CSS-based styling** -- custom stylesheets with `var()` support; WCAG 2.1 AA compliant defaults
- **Flow layout** -- content stacks vertically with automatic page breaks
- **Auto-numbered labels** -- optional sequential numbering for standalone fields
- **Watch mode** -- auto-regenerate on file changes during development
- **GitHub Action** -- generate documents and publish to GitHub Pages in CI/CD

## Installation

```bash
npm install -g yamlforms
```

**Requirements:** Node.js 24+

## Quick Start

```bash
# Initialize a new project
yamlforms init my-forms
cd my-forms

# Generate a PDF from the sample schema
yamlforms generate schemas/sample-form.yaml

# Generate multiple formats
yamlforms generate schemas/sample-form.yaml --format pdf,html,docx

# Watch for changes during development
yamlforms generate schemas/sample-form.yaml --watch
```

## CLI Reference

### `generate <schema>`

Generate documents from a form schema.

| Option                   | Description                                             | Default           |
| ------------------------ | ------------------------------------------------------- | ----------------- |
| `-o, --output <dir>`     | Output directory                                        | current directory |
| `-f, --format <formats>` | Comma-separated formats: `pdf`, `html`, `docx`          | `pdf`             |
| `-c, --config <path>`    | Path to configuration file                              | auto-detected     |
| `-w, --watch`            | Watch schema and config for changes, regenerate on save | --                |
| `-v, --verbose`          | Verbose output                                          | --                |

### `validate <schema>`

Validate a schema file against the JSON schema.

| Option          | Description                   |
| --------------- | ----------------------------- |
| `-v, --verbose` | Show detailed validation info |

### `preview <schema>`

Preview form fields from a schema without generating files (dry run).

| Option                  | Description                            | Default |
| ----------------------- | -------------------------------------- | ------- |
| `-f, --format <format>` | Output format: `table`, `json`, `yaml` | `table` |

### `init [directory]`

Scaffold a new project. Creates:

- `schemas/` with a sample form schema
- `styles/` directory
- `dist/` output directory
- `yamlforms.config.yaml` with default settings
- `.gitignore`

## Schema Reference

### Basic Structure

```yaml
$schema: 'form-schema/v1'

form:
  id: my-form
  title: My Form
  version: '1.0.0'
  author: Jane Doe
  description: A sample form
  pages: 1
  positioning: flow
  numbering: true
  stylesheet: './custom.css'

content:
  - type: heading
    level: 1
    text: 'Form Title'

  - type: field
    label: 'Full Name'
    fieldType: text
    fieldName: full_name
    required: true

fields: []

calculations: []

conditionalFields: []

validation:
  rules: []
```

### Form Metadata

| Property      | Type    | Required | Default | Description                                                   |
| ------------- | ------- | -------- | ------- | ------------------------------------------------------------- |
| `id`          | string  | yes      | --      | Unique form identifier. Must match `^[a-zA-Z][a-zA-Z0-9_-]*$` |
| `title`       | string  | yes      | --      | Form title (non-empty)                                        |
| `version`     | string  | no       | --      | Semver version (`X.Y.Z`)                                      |
| `author`      | string  | no       | --      | Author name                                                   |
| `description` | string  | no       | --      | Form description                                              |
| `pages`       | integer | no       | `1`     | Number of pages (minimum 1)                                   |
| `positioning` | string  | no       | `flow`  | Positioning mode. Only `flow` is supported                    |
| `numbering`   | boolean | no       | `false` | Auto-number standalone field labels (1., 2., 3., ...)         |
| `stylesheet`  | string  | no       | --      | Path to a custom CSS stylesheet                               |

### Content Types

Content elements are defined in the `content` array. Each element has a `type` and optional `page` and `position` properties (rarely needed in flow mode).

#### heading

```yaml
- type: heading
  level: 2 # 1-6
  text: 'Section Title'
```

#### paragraph

```yaml
- type: paragraph
  text: 'Body text content.'
  maxWidth: 400 # Maximum width in points (optional)
  fontSize: 12 # Font size in points, 6-72 (optional)
```

#### field

Standalone form field rendered in the content flow.

```yaml
- type: field
  label: 'Email Address'
  labelPosition: above # above (default) or left
  labelWidth: 120 # Width in points when labelPosition is left
  fieldType: text # text, dropdown, checkbox, textarea
  fieldName: email # Unique identifier, ^[a-zA-Z][a-zA-Z0-9_]*$
  width: 300 # Field width in points (default: content width)
  height: 60 # Field height in points (for textarea)
  placeholder: 'user@example.com'
  default: ''
  required: true
  options: [] # For dropdown fields (see Field Options)
```

#### table

See the [Tables](#tables) section below.

#### admonition

```yaml
- type: admonition
  variant: warning # warning, note, info, tip, danger
  title: 'Important'
  text: 'Please read carefully before proceeding.'
```

#### rule

Horizontal line separator.

```yaml
- type: rule
```

#### spacer

```yaml
- type: spacer
  height: 24 # Height in points (minimum 1)
```

### Tables

Tables support three approaches for defining rows.

#### Column Definition

Each column requires `label` and `width`. Optional properties set defaults for all cells in the column.

| Property      | Type   | Required | Description                                                     |
| ------------- | ------ | -------- | --------------------------------------------------------------- |
| `label`       | string | yes      | Column header text                                              |
| `width`       | number | yes      | Column width in points (minimum 10)                             |
| `cellType`    | string | no       | Default cell type: `text`, `dropdown`, `checkbox`, `label`      |
| `fieldSuffix` | string | no       | Suffix for auto-generated field names (used with `fieldPrefix`) |
| `options`     | array  | no       | Options for dropdown cells in this column                       |

#### Approach 1: Manual Cells

Each row defines an array of cell objects.

```yaml
- type: table
  columns:
    - { label: 'Name', width: 150 }
    - { label: 'Role', width: 120, cellType: dropdown, options: ['Dev', 'QA', 'PM'] }
    - { label: 'Active', width: 60 }
  rows:
    - cells:
        - { type: text, fieldName: name_1 }
        - { type: dropdown, fieldName: role_1, options: ['Dev', 'QA', 'PM'] }
        - { type: checkbox, fieldName: active_1 }
```

Cell types:

| Cell Type  | Required Properties   | Optional             |
| ---------- | --------------------- | -------------------- |
| `label`    | `value` (static text) | --                   |
| `text`     | `fieldName`           | `default`            |
| `dropdown` | `fieldName`           | `options`, `default` |
| `checkbox` | `fieldName`           | `default`            |

#### Approach 2: Compact Values

Each row provides a `values` array. The cell type is inferred from the column's `cellType` (or defaults to `text`). Strings become label values or field names depending on the column type.

```yaml
- type: table
  columns:
    - { label: 'Item', width: 200, cellType: label }
    - { label: 'Qty', width: 80, cellType: text }
  rows:
    - values: ['Widget A', 'qty_1']
    - values: ['Widget B', 'qty_2']
```

#### Approach 3: Auto-generated Rows

Use `rowCount` and `fieldPrefix` to generate identical rows. Field names are built as `{fieldPrefix}_row{N}_{fieldSuffix}`.

```yaml
- type: table
  fieldPrefix: timesheet
  rowCount: 5
  columns:
    - { label: 'Date', width: 100, cellType: text, fieldSuffix: date }
    - { label: 'Hours', width: 80, cellType: text, fieldSuffix: hours }
    - { label: 'Billable', width: 60, cellType: checkbox, fieldSuffix: billable }
```

#### Table Properties

| Property       | Type    | Default    | Description                                    |
| -------------- | ------- | ---------- | ---------------------------------------------- |
| `label`        | string  | --         | Optional description displayed above the table |
| `columns`      | array   | (required) | Column definitions                             |
| `rows`         | array   | --         | Explicit row definitions                       |
| `fieldPrefix`  | string  | --         | Base name for auto-generated field names       |
| `rowCount`     | integer | --         | Number of rows to auto-generate (1-50)         |
| `rowHeight`    | number  | `22`       | Data row height in points (minimum 10)         |
| `headerHeight` | number  | `24`       | Header row height in points (minimum 10)       |
| `showBorders`  | boolean | `true`     | Show table borders                             |

### Legacy Positioned Fields

The `fields` array supports absolute positioning for precise control. Each field requires explicit page and position coordinates.

| Property          | Type                  | Required | Description                                                      |
| ----------------- | --------------------- | -------- | ---------------------------------------------------------------- |
| `name`            | string                | yes      | Field identifier (`^[a-zA-Z][a-zA-Z0-9_]*$`)                     |
| `type`            | string                | yes      | `text`, `checkbox`, `radio`, `dropdown`, `textarea`, `signature` |
| `label`           | string                | yes      | Field label                                                      |
| `page`            | integer               | yes      | Page number (1-indexed)                                          |
| `position`        | object                | yes      | `{ x, y, width?, height? }` in points                            |
| `required`        | boolean               | no       | Whether the field is required                                    |
| `placeholder`     | string                | no       | Placeholder text                                                 |
| `maxLength`       | integer               | no       | Maximum character length                                         |
| `multiline`       | boolean               | no       | Enable multiline for text fields                                 |
| `options`         | array                 | no       | Options for radio and dropdown fields                            |
| `default`         | string/boolean/number | no       | Default value                                                    |
| `validation`      | object                | no       | Validation rules (see below)                                     |
| `fontSize`        | number                | no       | Font size in points (6-72, default: 12)                          |
| `fontColor`       | string                | no       | Hex color (`#RRGGBB`)                                            |
| `backgroundColor` | string                | no       | Hex color (`#RRGGBB`)                                            |
| `borderColor`     | string                | no       | Hex color (`#RRGGBB`)                                            |
| `labelPosition`   | string                | no       | `left`, `right`, `above`, `none`                                 |
| `readOnly`        | boolean               | no       | Make the field read-only                                         |
| `hidden`          | boolean               | no       | Hide the field                                                   |

### Field Options

Options can be specified as objects or as simple strings:

```yaml
# Object format
options:
  - value: 'us'
    label: 'United States'
  - value: 'ca'
    label: 'Canada'

# String format (value = label)
options:
  - 'United States'
  - 'Canada'
```

### Field Validation

Applied on legacy positioned fields via the `validation` property:

| Property    | Type    | Description                            |
| ----------- | ------- | -------------------------------------- |
| `pattern`   | string  | Regex pattern                          |
| `message`   | string  | Error message shown on pattern failure |
| `min`       | number  | Minimum numeric value                  |
| `max`       | number  | Maximum numeric value                  |
| `minLength` | integer | Minimum character length               |
| `maxLength` | integer | Maximum character length               |

```yaml
fields:
  - name: email
    type: text
    label: 'Email'
    page: 1
    position: { x: 72, y: 700, width: 250 }
    validation:
      pattern: '^[\w.-]+@[\w.-]+\.\w+$'
      message: 'Enter a valid email address'
```

### Calculated Fields

Define formulas that reference other field names. Calculations are evaluated in order, so later calculations can reference earlier ones.

```yaml
calculations:
  - name: subtotal
    formula: 'quantity * price'
    format: currency
    decimals: 2

  - name: tax
    formula: 'subtotal * 0.1'
    format: currency
    decimals: 2

  - name: total
    formula: 'subtotal + tax'
    format: currency
    decimals: 2
```

| Property   | Type    | Required | Description                                       |
| ---------- | ------- | -------- | ------------------------------------------------- |
| `name`     | string  | yes      | Calculated field name (`^[a-zA-Z][a-zA-Z0-9_]*$`) |
| `formula`  | string  | yes      | Expression referencing other fields               |
| `format`   | string  | no       | `number`, `currency`, `percentage`, `text`        |
| `decimals` | integer | no       | Decimal places (0-10)                             |

### Conditional Fields

Show, hide, enable, or disable fields based on a trigger field's value.

```yaml
conditionalFields:
  - trigger:
      field: employment_type
      value: 'contractor'
      operator: equals # equals (default), not_equals, contains, greater, less
    show: ['hourly_rate', 'contract_end_date']
    hide: ['annual_salary']

  - trigger:
      field: has_dependents
      value: true
    show: ['dependent_count', 'dependent_names']
```

| Property           | Type                  | Description                                           |
| ------------------ | --------------------- | ----------------------------------------------------- |
| `trigger.field`    | string                | Field name to watch                                   |
| `trigger.value`    | string/boolean/number | Value to compare                                      |
| `trigger.operator` | string                | `equals`, `not_equals`, `contains`, `greater`, `less` |
| `show`             | string[]              | Fields to show when condition is met                  |
| `hide`             | string[]              | Fields to hide when condition is met                  |
| `enable`           | string[]              | Fields to enable when condition is met                |
| `disable`          | string[]              | Fields to disable when condition is met               |

### Validation Rules

Top-level rules that validate cross-field relationships:

```yaml
validation:
  rules:
    - if: 'end_date < start_date'
      then: 'error: End date must be after start date'

    - if: 'quantity > 100'
      then: 'warning: Large orders require manager approval'
```

The `then` string can be prefixed with `error:`, `warning:`, or `info:` to set severity.

## Styling

yamlforms uses a CSS-based styling system parsed with [css-tree](https://github.com/nicolo-ribaudo/csstree). The default stylesheet follows WCAG 2.1 AA, ISO 9241-115, and PDF/UA standards.

### Custom Stylesheet

Point to a custom CSS file from the schema:

```yaml
form:
  id: my-form
  title: My Form
  stylesheet: './custom.css'
```

### Supported Selectors

| Selector                                                                                                   | Targets                           |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `:root`                                                                                                    | CSS custom properties (variables) |
| `@page`                                                                                                    | Page size and margins             |
| `h1` -- `h6`                                                                                               | Heading levels                    |
| `p`                                                                                                        | Paragraphs                        |
| `hr`                                                                                                       | Horizontal rules                  |
| `.header`                                                                                                  | Page header                       |
| `.footer`                                                                                                  | Page footer                       |
| `.admonition`                                                                                              | Base admonition styles            |
| `.admonition-title`                                                                                        | Admonition title text             |
| `.admonition-content`                                                                                      | Admonition body text              |
| `.admonition-warning`, `.admonition-note`, `.admonition-info`, `.admonition-tip`, `.admonition-danger`     | Variant-specific styles           |
| `.field`                                                                                                   | Base form field styles            |
| `.field-text`, `.field-textarea`, `.field-checkbox`, `.field-radio`, `.field-dropdown`, `.field-signature` | Field-type-specific styles        |
| `.field-label`                                                                                             | Field label text                  |
| `.table`                                                                                                   | Base table styles                 |
| `.table-header`                                                                                            | Table header row                  |
| `.table-row`                                                                                               | Table data rows                   |
| `.table-cell`                                                                                              | Table cell styles                 |
| `.table-row-alternate`                                                                                     | Alternate row background          |

### CSS Variables

Define variables in `:root` and reference them with `var()`:

```css
:root {
  --brand-color: #003366;
  --brand-font: HelveticaBold;
}

h1 {
  color: var(--brand-color);
  font-family: var(--brand-font);
}
```

### Supported Units

| Unit | Description | Conversion        |
| ---- | ----------- | ----------------- |
| `pt` | Points      | 1pt (base unit)   |
| `px` | Pixels      | 1px = 0.75pt      |
| `in` | Inches      | 1in = 72pt        |
| `cm` | Centimeters | 1cm = 28.35pt     |
| `mm` | Millimeters | 1mm = 2.835pt     |
| `em` | Em          | 1em = 12pt (base) |

### Available Fonts

| Font Name              | Variant      |
| ---------------------- | ------------ |
| `Helvetica`            | Regular      |
| `HelveticaBold`        | Bold         |
| `HelveticaOblique`     | Oblique      |
| `HelveticaBoldOblique` | Bold Oblique |
| `Courier`              | Regular      |
| `CourierBold`          | Bold         |
| `CourierOblique`       | Oblique      |
| `CourierBoldOblique`   | Bold Oblique |
| `TimesRoman`           | Regular      |
| `TimesRomanBold`       | Bold         |
| `TimesRomanItalic`     | Italic       |
| `TimesRomanBoldItalic` | Bold Italic  |

## Configuration

yamlforms auto-detects configuration files by searching up the directory tree for:

- `yamlforms.config.yaml` / `yamlforms.config.yml` / `yamlforms.config.json`
- `.yamlformsrc` / `.yamlformsrc.yaml` / `.yamlformsrc.yml` / `.yamlformsrc.json`

### Example Configuration

```yaml
input:
  schemas: './schemas'
  styles: './styles'

output:
  directory: './dist'
  formats:
    - pdf
    - html
  filenameTemplate: '{name}'

pdf:
  pageSize: letter
  margins:
    top: 72
    bottom: 72
    left: 72
    right: 72
  fonts:
    default: Helvetica
    monospace: Courier
  embedFonts: false
  compress: true

html:
  embedStyles: true
  includeJs: true
  pageLayout:
    enabled: true
    pageSize: letter
    showPageNumbers: true

docx:
  pageSize: letter
  margins:
    top: 72
    bottom: 72
    left: 72
    right: 72
  fonts:
    default: Helvetica
    monospace: Courier
  formFieldStyle: box # underline, box, or shaded
  includeFormFieldHints: true
```

### Filename Template Variables

| Variable    | Description                           |
| ----------- | ------------------------------------- |
| `{name}`    | Schema form ID                        |
| `{format}`  | Output format (pdf, html, docx)       |
| `{version}` | Form version from schema (or `1.0.0`) |
| `{date}`    | Current date (YYYY-MM-DD)             |

### Page Sizes

| Size      | Dimensions (points) | Dimensions (inches) |
| --------- | ------------------- | ------------------- |
| `letter`  | 612 x 792           | 8.5 x 11            |
| `a4`      | 595.28 x 841.89     | 8.27 x 11.69        |
| `legal`   | 612 x 1008          | 8.5 x 14            |
| `tabloid` | 792 x 1224          | 11 x 17             |

## GitHub Action

### Basic Usage

```yaml
- uses: robinmordasiewicz/yamlforms@v1
```

Uses default settings: generates PDFs from `schemas/*.yaml` into `dist/`.

### Inputs

| Input            | Description                                                              | Default               |
| ---------------- | ------------------------------------------------------------------------ | --------------------- |
| `command`        | Command to run: `generate` or `validate`                                 | `generate`            |
| `schema`         | Path to YAML schema file or glob pattern                                 | `schemas/*.yaml`      |
| `output`         | Output directory for generated files                                     | `dist`                |
| `format`         | Output formats: `pdf`, `html`, `docx` (comma-separated)                  | `pdf`                 |
| `fail-on-error`  | Fail the action if validation errors occur                               | `true`                |
| `publish`        | Enable GitHub Pages publishing                                           | `true`                |
| `publish-method` | `pages-api` (requires deploy-pages action) or `branch` (pushes directly) | `pages-api`           |
| `pages-branch`   | Branch name for branch-based publishing                                  | `gh-pages`            |
| `generate-index` | Generate `index.html` listing all documents                              | `true`                |
| `index-title`    | Title for the generated index page                                       | `Generated Documents` |

### Outputs

| Output                | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `files`               | JSON array of generated file paths                             |
| `pdf-count`           | Number of PDF files generated                                  |
| `html-count`          | Number of HTML files generated                                 |
| `docx-count`          | Number of DOCX files generated                                 |
| `validation-errors`   | JSON array of validation errors (if any)                       |
| `pages-url`           | URL of deployed GitHub Pages site                              |
| `index-file`          | Path to generated `index.html`                                 |
| `pages-artifact-path` | Path for `upload-pages-artifact` (use with `pages-api` method) |

### Workflow Examples

**Generate and upload as artifacts:**

```yaml
- uses: robinmordasiewicz/yamlforms@v1
  id: yamlforms
  with:
    schema: 'schemas/*.yaml'
    format: 'pdf,html,docx'
    output: 'dist'

- uses: actions/upload-artifact@v4
  with:
    name: forms
    path: dist/
```

**Deploy to GitHub Pages (pages-api method -- recommended):**

```yaml
permissions:
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: robinmordasiewicz/yamlforms@v1
        with:
          schema: 'schemas/*.yaml'
          format: 'pdf,html,docx'

      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist

      - uses: actions/deploy-pages@v4
        id: deployment
```

**Deploy to GitHub Pages (branch method):**

```yaml
permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: robinmordasiewicz/yamlforms@v1
        with:
          schema: 'schemas/*.yaml'
          format: 'pdf,html,docx'
          publish-method: branch
          pages-branch: gh-pages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Validate schemas in pull requests:**

```yaml
- uses: robinmordasiewicz/yamlforms@v1
  with:
    command: validate
    schema: 'schemas/**/*.yaml'
```

**Generate only (no publishing):**

```yaml
- uses: robinmordasiewicz/yamlforms@v1
  with:
    schema: 'schemas/*.yaml'
    publish: 'false'
```

## Development

```bash
git clone https://github.com/robinmordasiewicz/yamlforms.git
cd yamlforms
npm install

npm run build        # Compile TypeScript
npm test             # Run tests
npm run typecheck    # Type checking
npm run lint         # Linting
```

## License

MIT
