# GitHub Workflows

This document explains the CI/CD (Continuous Integration/Continuous Deployment) setup for the URL Shortener API using GitHub Actions.

## Overview

The CI/CD pipeline automates the testing, building, and deployment of the application. The workflow is defined in `.github/workflows/ci-cd.yml`.

## Workflow Stages

### 1. Build and Test

This job runs on every push to the  `master`, and `develop` branches, as well as on pull requests to `master` and `develop`.

Steps:
- Sets up a PostgreSQL database for testing
- Installs Node.js and project dependencies
- Lints the code
- Builds the application
- Runs the test suite

### 2. Deploy to Staging

This job runs only when changes are pushed to the `develop` branch and only if the build and test job succeeds.

Steps:
- Prepares for deployment to the staging environment
- (The actual deployment commands are placeholders that should be customized for your infrastructure)

### 3. Deploy to Production

This job runs only when changes are pushed to the `master` branch and only if the build and test job succeeds.

Steps:
- Prepares for deployment to the production environment
- (The actual deployment commands are placeholders that should be customized for your infrastructure)

## Deployment Configuration

The deployment steps in the workflow file are currently placeholders. To implement actual deployments:

1. Uncomment and modify the Docker build and push steps
2. Add any necessary secrets to your GitHub repository:
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets and variables > Actions
   - Add secrets for Docker registry credentials, SSH keys, etc.

## Workflow Customization

You may want to customize the workflow to suit your specific needs:

- **Change the trigger branches**: Edit the `on` section to add or remove branches that trigger the workflow
- **Add additional testing steps**: Add more comprehensive testing jobs
- **Customize deployment logic**: Modify the deployment jobs to match your hosting environment (AWS, GCP, Azure, etc.)
- **Add notifications**: Implement Slack, email, or other notifications for workflow status

## Troubleshooting

If the workflow fails, check the following:

1. **Failed tests**: Look at the test logs to identify failing tests
2. **Build errors**: Check for compilation or build errors
3. **Deployment issues**: Ensure all required secrets and environment variables are properly configured
4. **Database connection**: Verify the PostgreSQL service connection is working correctly

For detailed logs, go to the Actions tab in your GitHub repository and click on the workflow run to see the complete logs. 