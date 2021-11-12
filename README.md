# Uplift Code

Code metrics and insights for Git projects.

## Getting started

- Install the extension
- Open your project as a [vscode workspace](https://code.visualstudio.com/docs/editor/workspaces)
- Your status bar will now display some metrics about the active file. If you click it, more details appear, also including a summary of metrics for the entire project.

## Metrics

Here's an overview of all metrics calculated by UpliftCode and their meaning.

By default, all metrics are calculated taking in account the git commits done in the last 12 months. This can be changed with the `upliftCode.since` settings configuration.

### Churn

Churn or file churn is the number of times a file has changed in a given time range, calculated by counting the number of commits this file appears on. It will tell you which files are the ones that are constantly changing, thus the ones more likely to be hotspots of bugs or related to features with constant requirement changes.

### Complexity / Complexity Trend

Coming soon.

### Temporal Coupling

Coming soon.
