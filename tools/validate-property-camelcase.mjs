#!/usr/bin/env node

/**
 * validate-property-camelcase.mjs
 *
 * Usage:
 *   node tools/validate-property-camelcase.mjs              # diff-based check: only newly added keys against origin/main
 *   node tools/validate-property-camelcase.mjs --full-scan  # full-scan: check all keys in each OpenAPI file
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

/**
 * Recursively collect all files under the given directory
 * that have a .yml or .yaml extension, excluding certain directories.
 */
async function collectYamlFiles(dir) {
    const excludeDirs = new Set(['node_modules', '.github']);
    let results = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && excludeDirs.has(entry.name)) continue;
        if (entry.isDirectory()) {
            const sub = await collectYamlFiles(fullPath);
            results = results.concat(sub);
        } else if (entry.isFile() && /\.(ya?ml)$/i.test(entry.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

/**
 * Parse the given YAML string into a JavaScript object.
 * Throws an error if parsing fails.
 */
function parseYaml(content) {
    try {
        return yaml.load(content) || {};
    } catch (err) {
        throw new Error(`YAML parse error: ${err.message}`);
    }
}

/**
 * Return all property paths in the object as an array of strings.
 * Each path is in the form "parent.child.key".
 * Arrays are traversed, but their indices are not included in the paths.
 */
function getAllObjectPaths(obj, prefix = '') {
    if (obj === null || typeof obj !== 'object') return [];
    if (Array.isArray(obj)) {
        return obj.flatMap(item => getAllObjectPaths(item, prefix));
    }
    let paths = [];
    for (const key of Object.keys(obj)) {
        const full = prefix ? `${prefix}.${key}` : key;
        paths.push(full);
        const child = obj[key];
        if (child !== null && typeof child === 'object') {
            paths = paths.concat(getAllObjectPaths(child, full));
        }
    }
    return paths;
}

/**
 * Compare the old and new objects and return an array of paths
 * that are present in newObj but not in oldObj.
 */
function getNewKeys(oldObj, newObj) {
    const oldSet = new Set(getAllObjectPaths(oldObj));
    return getAllObjectPaths(newObj).filter(p => !oldSet.has(p));
}

/**
 * Check if the object represents an OpenAPI definition.
 * Returns true if the root has an "openapi" property.
 */
function isOpenApi(obj) {
    return obj && typeof obj === 'object' &&
        Object.prototype.hasOwnProperty.call(obj, 'openapi');
}

async function main() {
    const args = process.argv.slice(2);
    const fullScan = args.includes('--full-scan');

    // Use the current working directory
    const cwd = process.cwd();
    const yamlFiles = await collectYamlFiles(cwd);
    let hasError = false;

    for (const filePath of yamlFiles) {
        const relPath = path.relative(cwd, filePath);
        console.log(`Processing ${relPath}`);

        // Read the new (HEAD) file content
        let newContent;
        try {
            newContent = await fs.readFile(filePath, 'utf8');
        } catch {
            continue;
        }

        // Get the old file content from origin/main (empty if not present)
        let oldContent = '';
        if (!fullScan) {
            try {
                oldContent = execSync(`git show origin/main:${relPath}`, { encoding: 'utf8' });
            } catch {
                oldContent = '';
            }
        }

        // Parse YAML contents
        let newObj, oldObj;
        try {
            newObj = parseYaml(newContent);
            oldObj = fullScan ? {} : parseYaml(oldContent);
        } catch (err) {
            console.warn(`Warning: parse error in ${relPath}: ${err.message}`);
            continue;
        }

        // Skip files that are not OpenAPI definitions
        if (!isOpenApi(newObj)) continue;

        // Determine keys to check: either full or diff
        const keysToCheck = fullScan
            ? getAllObjectPaths(newObj)
            : getNewKeys(oldObj, newObj);

        // Filter out example and x-www-form-urlencoded paths, then find underscores
        const invalid = keysToCheck.filter(p => {
            const last = p.split('.').pop();
            if (/\.examples?\./.test(p)) return false;
            if (/x-www-form-urlencoded/.test(p)) return false;
            return last.includes('_');
        });

        if (invalid.length) {
            hasError = true;
            console.error(`\n[ERROR] ${relPath}: the following ${
                fullScan ? 'keys' : 'newly added keys'
            } contain underscores:`);
            invalid.forEach(p => console.error(`  - ${p}`));
            console.error('[ERROR] You should change production code to use camelCase instead. ' +
                'Especially, request body as JSON should be camelCase. line-bot-sdk-ruby depends on this. ' +
                'However, You can ignore this if the defined class is not for JSON (like x-www-form-urlencoded), ' +
                'or the class is for response body.');
        }
    }

    if (hasError) {
        process.exit(1);
    } else {
        console.log(fullScan
            ? 'OK: No underscores found in OpenAPI keys (excluding examples and x-www-form-urlencoded).'
            : 'OK: No underscores found in newly added OpenAPI keys (excluding examples and x-www-form-urlencoded).'
        );
    }
}

main();
