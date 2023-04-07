#!/usr/bin/env zx

for (let ymlFile of globby.globbySync("*.yml")) {
    await $`spectral lint "${ymlFile}" --ruleset=.spectral.yaml`;
}
