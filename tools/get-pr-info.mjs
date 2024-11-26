#!/usr/bin/env zx

import fs from "fs/promises";


// Call this script from the parent repository
// This script generates a JSON file containing information about the latest PR
// that updated the submodule.
// The JSON file contains the following information:
// - url: The URL of the PR.
// - title: The title of the PR.
// - body: The body of the PR.
// The JSON file is saved as pr_info.json in the parent repository.

const submoduleDir = "line-openapi";
const repo = "line/line-openapi";

async function generatePrInfo() {
    // Change to the submodule directory
    cd(submoduleDir);

    // Get the latest commit message in the submodule
    const { stdout: lastCommit } = await $`git log -1 --pretty=%s`;
    console.log("Last commit in submodule:", lastCommit.trim());

    // Extract the PR number from the commit message
    const prNumberMatch = lastCommit.match(/#(\d+)/);
    if (!prNumberMatch) {
        console.error("No PR number found in submodule's latest commit. Exiting.");
        process.exit(1);
    }
    const prNumber = prNumberMatch[1];
    console.log("Detected PR number:", prNumber);

    const prUrl = `https://github.com/${repo}/pull/${prNumber}`;
    console.log("Constructed PR URL:", prUrl);

    // Get the PR title and body
    const prInfo = JSON.parse(await $`gh pr view ${prNumber} --repo ${repo} --json title,body`);
    const prTitle = prInfo.title;
    const prBody = prInfo.body;

    // Save the PR information to a JSON file
    const output = {
        url: prUrl,
        title: prTitle,
        body: prBody,
    };
    await fs.writeFile("../pr_info.json", JSON.stringify(output, null, 2));
    console.log("PR information saved to pr_info.json");

    // Return to the parent directory
    cd("..");
}

await generatePrInfo();
