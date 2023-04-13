#!/usr/bin/env zx

const fs = require('fs');

// All discriminator destination schemas should use `allOf` to inherit the parent class.
for (let ymlFile of globby.globbySync("*.yml")) {
    console.log(`Processing ${ymlFile}`);
    const yml = YAML.parse(fs.readFileSync(ymlFile, {encoding: 'utf-8'}));
    for (let schemaName in yml['components']['schemas']) {
        const schemaBody = yml['components']['schemas'][schemaName];
        const discriminators = schemaBody['discriminator'];
        if (discriminators) {
            for (const key of Object.values(discriminators['mapping'])) {
                const dstName = key.replace("#/components/schemas/", "");
                const dstBody = yml['components']['schemas'][dstName];
                if (!dstBody['allOf']) {
                    console.log(dstName);
                }
            }
        }
    }
}
