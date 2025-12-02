#!/usr/bin/env zx

// https://github.com/OpenAPITools/openapi-generator/issues/13684
process.env.JAVA_OPTS = '--add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED';

for (let generator of ['java', 'kotlin', 'ruby', 'php', 'javascript', 'python']) {
    for (let ymlFile of globby.globbySync("*.yml", { ignore: ["docker-compose.yml"] })) {
        const basename = ymlFile.replace(".yml", "");
        await $`openapi-generator generate -g ${generator} -i "${ymlFile}" -o tmp/${generator}/${basename}`;
    }
}
