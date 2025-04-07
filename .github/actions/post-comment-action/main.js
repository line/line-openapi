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
        const { data: comments } = await octokit.rest.issues.listComments({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: prNumber,
        });

        const medadataForComment = `<!-- ${jobName}-comment -->`;

        for (const comment of comments) {
            if (
                comment.user.login === 'github-actions[bot]' &&
                comment.body.includes(medadataForComment)
            ) {
                await octokit.rest.issues.deleteComment({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    comment_id: comment.id,
                });
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

        // for warning
        if (language === 'ruby') {
            const { data: files } = await octokit.rest.pulls.listFiles({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: prNumber,
            });

            const isWebhookEventAdded = files.some(file => file.filename.includes('webhook.yml'));
            if (isWebhookEventAdded) {
                fullCommentBody += "\n\n⚠️You may need to modify code when a webhook event is added, even when tests are passed." +
                    `Parser in line-bot-sdk-${language} in not generated automatically.` +
                    "Please add tests and modify parser manually in each repository before release.";
            }
        }

        await octokit.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: prNumber,
            body: `${medadataForComment}\n${fullCommentBody}`,
        });
    } catch (error) {
        console.error(error);
        core.setFailed(`Error in this script: ${error.message}`);
    }
}

run();
