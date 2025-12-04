# GitHub Actions Workflow Test

This file documents testing scenarios for the `compile-webui.yml` workflow.

## Trigger Conditions

The workflow should activate when:

1. **Pull Request Review Request**: When @MaslowBot is requested as a reviewer
   - Single reviewer: `github.event.requested_reviewer.login == 'MaslowBot'`
   - Multiple reviewers: `contains(github.event.requested_reviewers.*.login, 'MaslowBot')`

2. **Issue Comment**: When a comment on a PR contains build commands
   - Comment contains: `please build`
   - Comment contains: `/build`

## Expected Build Process

1. Checkout repository code
2. Setup Node.js 20
3. Cache npm dependencies
4. Run `npm install`
5. Run `gulp package --lang en`
6. Upload `dist/index.html.gz` as artifact
7. Comment on PR with build results

## Expected Output

- **Artifact**: `index.html.gz` (~125KB)
- **Build Time**: ~8 seconds total
- **Retention**: 30 days
- **Location**: GitHub Actions artifacts

## Test Commands

To test the workflow manually:
```bash
npm install
gulp package --lang en
ls -la dist/index.html.gz
```

Expected file size: ~125KB compressed