#!/usr/bin/env zx


// Call this script from the parent repository
// This script determines the type of change to the parent repository
// by checking the latest commit message and the status of the submodule.
// The possible change types are:
// - submodule-update: The submodule has been updated.
// - other: The parent repository has been updated, but the submodule has not been updated.
// The change type is printed to the console.

const submoduleDir = "line-openapi";

async function determineChangeType() {
    // Get the latest commit message
    const { stdout: lastCommit } = await $`git log -1 --pretty=%s`;

    // Get the status of the submodule
    const { stdout: submoduleStatus } = await $`git submodule status ${submoduleDir}`;
    const hasUpdate = submoduleStatus.trim().startsWith('+');

    // Determine the type of change
    if (lastCommit.includes(submoduleDir)) {
        console.log("submodule-update");
    } else if (hasUpdate) {
        console.log("submodule-update");
    } else {
        console.log("other");
    }
}

await determineChangeType();
