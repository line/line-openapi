#!/usr/bin/env zx

for (let ymlFile of globby.globbySync("*.yml", { ignore: ["docker-compose.yml"] })) {
    await $`spectral lint "${ymlFile}" --ruleset=.spectral.yaml`;
}
