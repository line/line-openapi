#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

/**
 * Recursively collect all files under the given directory
 * that have a .yml or .yaml extension.
 */
async function collectYamlFiles(dir) {
    const excludeDirs = new Set(['node_modules', '.github']);
    let results = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded directories
        if (entry.isDirectory() && excludeDirs.has(entry.name)) {
            continue;
        }

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
    const cwd = process.cwd();
    const yamlFiles = await collectYamlFiles(cwd);
    let hasError = false;

    for (const filePath of yamlFiles) {
        console.log(`Processing ${filePath}...`);
        // Read the new (HEAD) file content
        let newContent;
        try {
            newContent = await fs.readFile(filePath, 'utf8');
        } catch {
            continue; // Skip if file cannot be read
        }

        // Get the old file content from origin/main (empty if not present)
        let oldContent = '';
        try {
            oldContent = execSync(`git show origin/main:${filePath}`, { encoding: 'utf8' });
        } catch {
            oldContent = '';
        }

        // Parse YAML contents
        let newObj, oldObj;
        try {
            newObj = parseYaml(newContent);
            oldObj = parseYaml(oldContent);
        } catch (err) {
            console.warn(`Warning: parse error in ${filePath}: ${err.message}`);
            continue;
        }
        console.log(`Parsed ${filePath} successfully.`);

        // Skip files that are not OpenAPI definitions
        if (!isOpenApi(newObj)) {
            continue;
        }
        console.log(`Checking ${filePath}...`);

        // Get keys newly added in newObj compared to oldObj
        const newKeys = getNewKeys(oldObj, newObj);

        // Filter paths whose last segment contains an underscore
        const invalid = newKeys.filter(p => {
            const last = p.split('.').pop();
            return last.includes('_');
        });

        if (invalid.length) {
            hasError = true;
            console.error(`\n[ERROR] ${filePath}: the following newly added keys contain underscores:`);
            invalid.forEach(p => console.error(`  - ${p}`));
        }
    }

    if (hasError) {
        process.exit(1);
    } else {
        console.log('OK: No underscores found in newly added OpenAPI keys.');
    }
}

main();
