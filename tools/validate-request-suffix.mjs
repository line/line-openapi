#!/usr/bin/env zx

const fs = require('fs');

let nonSuffixed = 0;

// All request objects should have `Request` suffix.
for (let ymlFile of globby.globbySync("*.yml", { ignore: ["docker-compose.yml"] })) {
    console.log(`# Processing ${ymlFile}`);
    const yml = YAML.parse(fs.readFileSync(ymlFile, {encoding: 'utf-8'}));
    for (let pathName in yml['paths']) {
        for (let pathObject of Object.values(yml['paths'][pathName])) {
            const requestBody = pathObject['requestBody'];
            if (requestBody && requestBody['content'] && requestBody['content']['application/json'] && requestBody['content']['application/json']['schema']) {
                const schema = requestBody['content']['application/json']['schema'];
                const ref = schema['$ref'];
                if (!ref.endsWith("Request")) {
                    console.error(`  Non "Request" suffixed request object was detected in ${pathName}: ${ref}`);
                    nonSuffixed += 1;
                }
            }
        }
    }
}

if (nonSuffixed > 0 ) {
    console.error("There's non-Request suffixed request object.");
    process.exit(1);
}
