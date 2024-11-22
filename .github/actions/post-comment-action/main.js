const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(token);
        const context = github.context;

        const commentBody = core.getInput('language');
        const stepName = 'Show diff'

        const prNumber = context.payload.pull_request.number;
        const runId = context.runId;
        const jobName = context.job;

        // ジョブIDとステップ番号を取得
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

        const url = `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${runId}/jobs/${jobId}?pr=${prNumber}#step:${stepNumber}:1`;

        const fullCommentBody = `Generated code can be seen here(${commentBody})\n\n[View logs here](${url})`;

        // 以前のコメントを削除
        const { data: comments } = await octokit.rest.issues.listComments({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: prNumber,
        });

        for (const comment of comments) {
            if (
                comment.user.login === 'github-actions[bot]' &&
                comment.body.includes(`<!-- ${jobName}-comment -->`)
            ) {
                await octokit.rest.issues.deleteComment({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    comment_id: comment.id,
                });
            }
        }

        // 新しいコメントを投稿
        await octokit.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: prNumber,
            body: `<!-- ${jobName}-comment -->\n${fullCommentBody}`,
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();