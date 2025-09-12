# Testing the GitHub Actions Comment Trigger

This document explains how to test the new issue_comment trigger for the compile-on-review workflow.

## How the New Trigger Works

The `compile-on-review.yml` workflow now has two triggers:

1. **Original**: `pull_request: [review_requested]` - when @MaslowBot is requested as a reviewer
2. **New**: `issue_comment: [created]` - when a comment is made on a PR

### Comment Trigger Conditions

The workflow will run when a comment is created on a pull request that contains:
- `@MaslowBot` mention, OR
- `/build` command

### Examples of Triggering Comments

✅ **These comments will trigger the build:**
- `@MaslowBot please build the firmware`
- `Hey @MaslowBot, can you compile this?`
- `Let's do /build to test this change`
- `/build`
- `I need @MaslowBot to review and /build this`

❌ **These comments will NOT trigger the build:**
- `This looks good to me` (no trigger phrase)
- `@MaslowBot please build` (on an issue, not a PR)
- `MaslowBot build this` (missing @ symbol)

## Testing Instructions

### For Copilot-created PRs:

1. After Copilot creates a PR, go to the PR page
2. Add a comment with one of the trigger phrases (e.g., `@MaslowBot please build`)
3. The workflow should start automatically
4. Check the Actions tab to see the workflow running
5. Once complete, a comment will be posted with the build results

### For manual PRs:

The original functionality still works:
1. Create a PR
2. Request @MaslowBot as a reviewer
3. The workflow starts automatically

## Expected Behavior

When triggered via comment, the workflow will:
1. Get the latest commit SHA from the PR
2. Checkout that specific commit
3. Build the firmware using the same process
4. Upload the firmware.bin as an artifact
5. Post a comment indicating the build was triggered by a comment (not review request)

## Security

The comment trigger is secure because:
- It only runs on pull requests (not issues)
- It requires an explicit mention or command
- It uses the same build process as the review trigger
- Only authorized users can comment on PRs in private repos