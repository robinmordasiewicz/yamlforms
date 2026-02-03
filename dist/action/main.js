/**
 * GitHub Action Main Logic
 * Handles input parsing, schema processing, and output generation
 */
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { resolve, basename, dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import { parseSchema, SchemaValidationError } from '../parsers/schema.js';
import { generatePdf, savePdf } from '../generators/pdf/index.js';
import { generateHtml, saveHtml } from '../generators/html/index.js';
/**
 * Parse action inputs from environment
 */
function getInputs() {
    const command = core.getInput('command') || 'generate';
    const schema = core.getInput('schema', { required: true });
    const output = core.getInput('output') || 'dist';
    const formatInput = core.getInput('format') || 'pdf';
    const failOnError = core.getBooleanInput('fail-on-error');
    // Parse format input
    const format = formatInput
        .split(',')
        .map((f) => f.trim().toLowerCase())
        .filter((f) => f === 'pdf' || f === 'html');
    if (format.length === 0) {
        format.push('pdf');
    }
    if (command !== 'generate' && command !== 'validate') {
        throw new Error(`Invalid command: ${command}. Must be 'generate' or 'validate'.`);
    }
    return {
        command,
        schema,
        output,
        format,
        failOnError,
    };
}
/**
 * Find schema files matching the input pattern
 */
async function findSchemaFiles(pattern) {
    const globber = await glob.create(pattern, {
        followSymbolicLinks: false,
    });
    const files = await globber.glob();
    // Filter for YAML files only
    return files.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
}
/**
 * Validate a single schema file
 */
async function validateSchemaFile(filePath) {
    try {
        await parseSchema(filePath);
        return { valid: true };
    }
    catch (error) {
        if (error instanceof SchemaValidationError) {
            return { valid: false, errors: error.errors };
        }
        return {
            valid: false,
            errors: [{ path: '/', message: error instanceof Error ? error.message : String(error) }],
        };
    }
}
/**
 * Generate documents from a schema file
 */
async function generateFromSchema(schemaPath, outputDir, formats) {
    const results = [];
    const schemaName = basename(schemaPath, '.yaml').replace('.yml', '');
    const schemaDir = dirname(schemaPath);
    try {
        // Parse schema
        const schema = await parseSchema(schemaPath);
        // Ensure output directory exists
        await mkdir(outputDir, { recursive: true });
        // Generate PDF if requested
        if (formats.includes('pdf')) {
            try {
                const pdf = await generatePdf({
                    schema,
                    basePath: schemaDir,
                });
                const pdfPath = join(outputDir, `${schemaName}.pdf`);
                await savePdf(pdf, pdfPath);
                results.push({
                    file: pdfPath,
                    type: 'pdf',
                    success: true,
                });
                core.info(`✅ Generated PDF: ${pdfPath} (${pdf.fieldCount} fields, ${pdf.pageCount} pages)`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.push({
                    file: join(outputDir, `${schemaName}.pdf`),
                    type: 'pdf',
                    success: false,
                    error: errorMessage,
                });
                core.error(`❌ Failed to generate PDF for ${schemaPath}: ${errorMessage}`);
            }
        }
        // Generate HTML if requested
        if (formats.includes('html')) {
            try {
                const html = await generateHtml({ schema });
                const htmlPath = join(outputDir, `${schemaName}.html`);
                await saveHtml(html, htmlPath);
                results.push({
                    file: htmlPath,
                    type: 'html',
                    success: true,
                });
                core.info(`✅ Generated HTML: ${htmlPath}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.push({
                    file: join(outputDir, `${schemaName}.html`),
                    type: 'html',
                    success: false,
                    error: errorMessage,
                });
                core.error(`❌ Failed to generate HTML for ${schemaPath}: ${errorMessage}`);
            }
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.error(`❌ Failed to parse schema ${schemaPath}: ${errorMessage}`);
        // Add failure results for all requested formats
        for (const format of formats) {
            results.push({
                file: join(outputDir, `${schemaName}.${format}`),
                type: format,
                success: false,
                error: errorMessage,
            });
        }
    }
    return results;
}
/**
 * Run the validate command
 */
async function runValidate(inputs) {
    core.info(`🔍 Validating schemas: ${inputs.schema}`);
    const files = await findSchemaFiles(inputs.schema);
    if (files.length === 0) {
        core.warning(`No schema files found matching: ${inputs.schema}`);
        return;
    }
    core.info(`Found ${files.length} schema file(s)`);
    const validationErrors = [];
    let validCount = 0;
    for (const file of files) {
        const result = await validateSchemaFile(file);
        if (result.valid) {
            core.info(`✅ ${file}: Valid`);
            validCount++;
        }
        else {
            core.error(`❌ ${file}: Invalid`);
            validationErrors.push({
                file,
                errors: result.errors ?? [],
            });
            // Log individual errors
            for (const err of result.errors ?? []) {
                core.error(`   ${err.path}: ${err.message}`);
            }
        }
    }
    // Set outputs
    core.setOutput('validation-errors', JSON.stringify(validationErrors));
    // Summary
    core.info('');
    core.info(`📊 Validation Summary: ${validCount}/${files.length} valid`);
    if (validationErrors.length > 0 && inputs.failOnError) {
        core.setFailed(`${validationErrors.length} schema(s) failed validation`);
    }
}
/**
 * Run the generate command
 */
async function runGenerate(inputs) {
    core.info(`📄 Generating documents from: ${inputs.schema}`);
    core.info(`   Output: ${inputs.output}`);
    core.info(`   Formats: ${inputs.format.join(', ')}`);
    const files = await findSchemaFiles(inputs.schema);
    if (files.length === 0) {
        core.warning(`No schema files found matching: ${inputs.schema}`);
        core.setOutput('files', JSON.stringify([]));
        core.setOutput('pdf-count', '0');
        core.setOutput('html-count', '0');
        return;
    }
    core.info(`Found ${files.length} schema file(s)`);
    const allResults = [];
    const validationErrors = [];
    for (const file of files) {
        core.info(`\n📝 Processing: ${file}`);
        const results = await generateFromSchema(file, resolve(inputs.output), inputs.format);
        allResults.push(...results);
        // Check for failures that indicate validation errors
        const failures = results.filter((r) => !r.success);
        if (failures.length > 0) {
            validationErrors.push({
                file,
                errors: failures.map((f) => ({ path: '/', message: f.error ?? 'Unknown error' })),
            });
        }
    }
    // Calculate counts
    const successfulFiles = allResults.filter((r) => r.success).map((r) => r.file);
    const pdfCount = allResults.filter((r) => r.type === 'pdf' && r.success).length;
    const htmlCount = allResults.filter((r) => r.type === 'html' && r.success).length;
    const failureCount = allResults.filter((r) => !r.success).length;
    // Set outputs
    core.setOutput('files', JSON.stringify(successfulFiles));
    core.setOutput('pdf-count', String(pdfCount));
    core.setOutput('html-count', String(htmlCount));
    core.setOutput('validation-errors', JSON.stringify(validationErrors));
    // Summary
    core.info('');
    core.info('📊 Generation Summary:');
    core.info(`   PDF files: ${pdfCount}`);
    core.info(`   HTML files: ${htmlCount}`);
    if (failureCount > 0) {
        core.info(`   Failures: ${failureCount}`);
        if (inputs.failOnError) {
            core.setFailed(`${failureCount} file(s) failed to generate`);
        }
    }
}
/**
 * Main action entry point
 */
export async function run() {
    try {
        const inputs = getInputs();
        core.info('🚀 yamldocs GitHub Action');
        core.info(`   Command: ${inputs.command}`);
        switch (inputs.command) {
            case 'validate':
                await runValidate(inputs);
                break;
            case 'generate':
                await runGenerate(inputs);
                break;
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        core.setFailed(`Action failed: ${message}`);
    }
}
//# sourceMappingURL=main.js.map