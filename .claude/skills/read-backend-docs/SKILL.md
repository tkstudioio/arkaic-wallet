---
description: Fetch and display all the backend documentation from the GitHub repository
user_type: user
---

# read-docs

Navigate and fetch project documentation from the GitHub repository `tkstudioio/arkaic-backend`.

## Instructions

Use the raw GitHub URLs to fetch documentation. Do **not** fetch all files at once. Instead, follow a targeted approach based on what the user needs.

### Base URL

https://raw.githubusercontent.com/tkstudioio/arkaic-backend/refs/heads/master/

### Available documentation

| File            | Purpose                                                      |
| --------------- | ------------------------------------------------------------ |
| `/README.md`    | Human-facing project overview, API table, setup instructions |
| `/docs/**/*.md` | Commands, runtime environment, infrastructure                |
| `/postman.json` | Full Postman collection — all API endpoints with examples    |

### Navigation strategy

1. **Start from the README.** Always fetch `/README.md` first — it serves as the index of the project documentation.
2. **Identify the relevant sections.** Based on the user's request (or the context of the current task), determine which specific doc files are needed. Scan the README for Markdown links pointing to files under `docs/` (pattern: `docs/**/*.md`).
3. **Fetch only what is needed.** Fetch only the doc files that are relevant to the question or task at hand. Do not fetch the entire documentation tree unless the user explicitly asks for it.
4. **If the user asks for everything**, then fetch all linked docs in parallel.

### Output format

For each file fetched, print a clear heading with the file path, then its content verbatim. If a fetch fails, note the error and continue with the remaining files.

After presenting all files, print a short summary of what was loaded.
