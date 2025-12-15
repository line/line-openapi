#!/usr/bin/env zx

const fs = require('fs');

for (let ymlFile of globby.globbySync("*.yml", { ignore: ["docker-compose.yml"] })) {
    console.log(`Processing ${ymlFile}`);

    await convertSingleQuotesToDoubleQuotes(ymlFile);
    await trimTrailingWhitespace(ymlFile);
}

async function convertSingleQuotesToDoubleQuotes(ymlFile) {
    const content = fs.readFileSync(ymlFile, 'utf-8');

    let dst = content.replace(/ '([^']+)'/g, ` "$1"`);
    dst = dst.replace(/ (\/[^:\n]+):/g, ` "$1":`);
    dst = dst.replace(/(description|summary): ([^|"'][^\n]+)/g,
        (m, key, val) => `${key}: "${val.replace(/"/g, '`')}"`);

    await fs.writeFileSync(ymlFile, dst);
}


async function trimTrailingWhitespace(ymlFile) {
    const content = await fs.readFileSync(ymlFile, "utf8");

    const trimmedContent = content
        .split("\n")
        .map((line) => line.replace(/\s+$/, ""))
        .join("\n");

    await fs.writeFileSync(ymlFile, trimmedContent, "utf8");
}
