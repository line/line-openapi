const fs = require('fs');

async function main() {
    // このディレクトリから walk していく。
    const base = "../line-dev-docs-v4/";

    // すべてのエンドポイントがドキュメントにのっているか確認する。
    // とりあえずめちゃくちゃナイーブな実装にする。

    const ymlFiles = fs.readdirSync(".").filter(file => {
        return file.endsWith('.yml') && file !== 'webhook.yml'
    });
    for (let ymlFile of ymlFiles) {
        console.log(`\n\n# ${ymlFile}\n\n`)

        const content = fs.readFileSync(ymlFile, 'utf-8');
        const yml = YAML.parse(content);
        for (const path in yml['paths']) {
            const mdFiles = globby.globbySync(`${base}/docs/en/_partials/**/*.md`);
            let found = false;
            for (let mdFile of mdFiles) {
                const md = fs.readFileSync(mdFile, 'utf-8')
                if (md.includes(path)) {
                    console.info(`${mdFile} ${path}`)
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.error(`◇◇◇◇ ${path} is not in docs. ◇◇◇◇`)
            }
        }
    }
}

await main();
