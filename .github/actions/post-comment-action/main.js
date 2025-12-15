const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        const language = process.env.LANGUAGE;

        const octokit = github.getOctokit(token);
        const context = github.context;

        const stepName = 'Show diff'

        const prNumber = context.payload.pull_request.number;
        const runId = context.runId;
        const jobName = context.job;

        // Delete the previous comment if it exists
        let comments = [];
        try {
            const response = await octokit.rest.issues.listComments({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: prNumber,
            });
            comments = response.data;
        } catch (error) {
            if (error.status === 403) {
                console.log('Unable to list comments (forked PR), skipping cleanup');
            } else {
                throw error;
            }
        }

        const medadataForComment = `<!-- ${jobName}-comment -->`;

        for (const comment of comments) {
            if (
                comment.user.login === 'github-actions[bot]' &&
                comment.body.includes(medadataForComment)
            ) {
                try {
                    await octokit.rest.issues.deleteComment({
                        owner: context.repo.owner,
                        repo: context.repo.repo,
                        comment_id: comment.id,
                    });
                } catch (error) {
                    if (error.status === 403) {
                        console.log('Unable to delete comment (forked PR)');
                    } else {
                        throw error;
                    }
                }
            }
        }

        // Post the new comment
        const { data: { jobs } } = await octokit.rest.actions.listJobsForWorkflowRun({
            owner: context.repo.owner,
            repo: context.repo.repo,
            run_id: runId,
        });

        const currentJob = jobs.find(job => job.name === jobName);
        if (!currentJob) {
            throw new Error(`Job ${jobName} not found`);
        }

        const jobId = currentJob.id;

        const step = currentJob.steps.find(step => step.name === stepName);
        if (!step) {
            throw new Error(`Step '${stepName}' not found`);
        }

        const stepNumber = currentJob.steps.indexOf(step) + 1;

        const url = `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${runId}/job/${jobId}?pr=${prNumber}#step:${stepNumber}:1`;

        // Create comment as markdown
        let fullCommentBody = `## ${language.toUpperCase()} \n` +
            `You can check generated code in ${language}\n\n` +
            `[Check the diff here](${url})`;

        await octokit.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: prNumber,
            body: `${medadataForComment}\n${fullCommentBody}`,
        });
    } catch (error) {
        // Handle 403 errors from forked PRs gracefully
        if (error.status === 403 && error.message.includes('Resource not accessible by integration')) {
            core.warning('Unable to post comment - this is expected for PRs from forked repositories. See .github/workflows/warn-pr-from-forked-repository.yml for more information.');
            console.log('Skipping comment creation due to permissions (forked PR)');
        } else {
            console.error(error);
            core.setFailed(`Error in this script: ${error.message}`);
        }
    }
}

run();
