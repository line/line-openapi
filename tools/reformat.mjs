#!/usr/bin/env zx

const fs = require('fs');

for (let ymlFile of globby.globbySync("*.yml")) {
    console.log(`Processing ${ymlFile}`);

    const src = fs.readFileSync(ymlFile, 'utf-8');

    // convert single quotes to double quotes.
    let dst = src.replace(/ '([^']+)'/g, ` "$1"`);
    dst = dst.replace(/ (\/[^:\n]+):/g, ` "$1":`);
    dst = dst.replace(/(description|summary): ([^|"'][^\n]+)/g,
        (m, key, val) => `${key}: "${val.replace(/"/g, '`')}"`);

    fs.writeFileSync(ymlFile, dst);
}
