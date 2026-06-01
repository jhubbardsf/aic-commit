<div align="center">

# aic-commit

**AI-powered conventional commit messages and pull request descriptions, generated from your actual diffs.**

[![npm version](https://img.shields.io/npm/v/aic-commit?style=flat-square&color=orange)](https://www.npmjs.com/package/aic-commit)
[![npm downloads](https://img.shields.io/npm/dm/aic-commit?style=flat-square&color=orange)](https://www.npmjs.com/package/aic-commit)
[![license MIT](https://img.shields.io/npm/l/aic-commit?style=flat-square&color=orange)](LICENSE)
[![node >=16](https://img.shields.io/node/v/aic-commit?style=flat-square&color=orange)](package.json)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673?style=flat-square)](https://www.conventionalcommits.org)

**Providers:** OpenAI · Anthropic · Gemini · Z.AI

[Install](#installation) · [Quick Start](#quick-start) · [Usage](#usage) · [Providers](#ai-providers) · [PR](#pr-description-and-creation) · [Config](#configuration) · [Troubleshooting](#troubleshooting)

</div>

---

`aic-commit` reads your staged changes (or a branch diff), sends them to the AI provider of your choice, and writes a clean conventional commit message or a structured pull request description. It can stop at a preview, commit for you, or open a GitHub PR end to end.

> **▶ [See the animated demo](https://jhubbardsf.github.io/aic-commit/)** (the docs site shows an animated terminal of a real run).

```text
$ git add .
$ aic-commit
✅ Repository validated
✅ Configuration loaded
✅ API configuration validated
✅ Changes analyzed
✅ openai provider initialized
✅ Commit message generated
[10:42:13] ℹ️  Generated commit message:

feat(auth): add login form with validation

[10:42:13] ℹ️  Files to be committed: src/auth/login.tsx, src/auth/validation.ts
✅ Commit created successfully
[10:42:14] ✅ Commit created with AI-generated message
```

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [AI Providers](#ai-providers)
- [Examples](#examples)
- [PR Description and Creation](#pr-description-and-creation)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

## Features

- **Four providers.** OpenAI, Anthropic, Google Gemini, and Z.AI, swappable per run.
- **Conventional Commits.** Output follows the conventional commit format automatically.
- **PR descriptions and creation.** Generate a comprehensive PR body from a branch diff, or open a GitHub PR directly with an AI title and body.
- **Context-aware.** Messages are grounded in your actual code changes, not a generic template.
- **Configurable.** Config files, environment variables, and CLI flags, with clear precedence.
- **Smart filtering.** Exclude noisy files with glob patterns.
- **Flexible output.** Dry-run previews, multiple choices to pick from, and detailed multi-line messages.
- **Scriptable.** Human-readable or JSON output.
- **Fast.** Built with Bun.

## Installation

### Global (recommended)

```bash
npm install -g aic-commit     # npm
bun install -g aic-commit     # bun
yarn global add aic-commit    # yarn
```

### Per project

```bash
npm install --save-dev aic-commit   # npm
bun add --dev aic-commit            # bun
yarn add --dev aic-commit           # yarn
```

## Quick Start

**1. Set an API key for your provider.**

```bash
export OPENAI_API_KEY="sk-your-key-here"          # OpenAI (default)
export ANTHROPIC_API_KEY="sk-ant-your-key-here"   # Anthropic
export GEMINI_API_KEY="your-key-here"             # Google Gemini
export ZAI_API_KEY="your-key-here"                # Z.AI
```

**2. Stage your changes.**

```bash
git add .
```

**3. Generate and commit.**

```bash
aic-commit          # installed globally
npx aic-commit      # installed per-project
```

## Usage

### Basic

```bash
# Generate and commit with an AI message
aic-commit

# Generate a message without committing (dry run)
aic-commit --dry-run

# Add context for a better message
aic-commit --description "Implementing user authentication system"

# Exclude certain files
aic-commit --exclude "*.test.js" "docs/**"
```

### Advanced

```bash
# Specific provider and model
aic-commit --provider anthropic --model claude-3-sonnet-20240229

# Verbose output with debugging
aic-commit --verbose --debug

# JSON output for scripting
aic-commit --json --dry-run

# Custom configuration file
aic-commit --config ./my-config.json
```

### CLI options

| Option                        | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `-d, --description <text>`    | Additional context for the AI                  |
| `-x, --exclude <patterns...>` | File patterns to exclude (glob patterns)       |
| `--config <path>`             | Path to custom configuration file              |
| `--model <model>`             | AI model to use (overrides config)             |
| `--provider <provider>`       | AI provider: `openai`, `anthropic`, `gemini`   |
| `--max-tokens <number>`       | Maximum tokens for AI response (1-8000)        |
| `--choices <number>`          | Generate multiple options to choose from (2-5) |
| `--detailed`                  | Generate detailed multi-line commit messages   |
| `--dry-run`                   | Generate message without committing            |
| `-v, --verbose`               | Show detailed progress information             |
| `--debug`                     | Show debug information                         |
| `-q, --quiet`                 | Suppress all output except errors              |
| `--json`                      | Output results in JSON format                  |

> **Provider flag note:** the top-level `aic-commit --provider` flag accepts `openai`, `anthropic`, and `gemini`. To use Z.AI for commit generation, set `AIC_PROVIDER=zai` or configure `"provider": "zai"`. The `pr` subcommand does accept `--provider zai` directly. See [AI Providers](#ai-providers).

## Configuration

### Environment variables

```bash
# Provider selection
export AIC_PROVIDER=openai            # openai, anthropic, gemini, zai
export AIC_MODEL=gpt-4                # Model name

# API keys
export OPENAI_API_KEY=sk-...          # OpenAI
export ANTHROPIC_API_KEY=sk-ant-...   # Anthropic
export GEMINI_API_KEY=...             # Google Gemini
export ZAI_API_KEY=...                # Z.AI

# Optional settings
export AIC_MAX_TOKENS=150             # Maximum tokens for response
export AIC_TEMPERATURE=0.3            # AI temperature (0.0-2.0)
export AIC_DEFAULT_DESCRIPTION="..."  # Default description
export AIC_DEBUG=true                 # Z.AI provider-level request/usage logging
```

### Configuration files

Create a `.aiccommitrc.json` in your project root or home directory:

```json
{
  "provider": "openai",
  "model": "gpt-4",
  "maxTokens": 150,
  "temperature": 0.3,
  "excludePatterns": ["*.test.js", "*.spec.ts", "docs/**", "*.md"],
  "defaultDescription": "Code changes for feature development",
  "apiKeys": {
    "openai": "sk-your-key-here"
  }
}
```

Supported config file formats (discovered by `cosmiconfig`):

| File | Notes |
| ---- | ----- |
| `.aiccommitrc` | |
| `.aiccommitrc.json` | |
| `.aiccommitrc.js` | |
| `.aiccommit.config.js` | |
| `aiccommit.config.js` | |
| `package.json` | under the `"aiccommit"` key |

### Configuration precedence

Configuration resolves from highest to lowest priority:

1. **CLI flags**
2. **Environment variables**
3. **Config file** discovered by `cosmiconfig` (or an explicit `--config` path)
4. **Default values**

## AI Providers

The commands do not expose providers in exactly the same way:

| Surface | Accepts |
| ------- | ------- |
| `aic-commit --provider` | `openai`, `anthropic`, `gemini` |
| `aic-commit pr --provider` | `openai`, `anthropic`, `gemini`, `zai` |
| `AIC_PROVIDER` and config files | `openai`, `anthropic`, `gemini`, `zai` |

To use Z.AI for **commit** generation, set `AIC_PROVIDER=zai` or `"provider": "zai"` in config. The top-level `--provider` flag does not accept `zai`; the `pr` subcommand does.

### Default models

| Provider | Default model |
| -------- | ------------- |
| OpenAI | `gpt-4` |
| Anthropic | `claude-3-sonnet-20240229` |
| Gemini | `gemini-2.5-flash-lite` |
| Z.AI | `glm-4.6` |

### OpenAI (default)

```bash
export OPENAI_API_KEY="sk-your-key-here"
export AIC_PROVIDER=openai
export AIC_MODEL=gpt-4   # or gpt-3.5-turbo, gpt-4o, etc.
```

See the [OpenAI Models documentation](https://platform.openai.com/docs/models) for the current list of supported models.

### Anthropic Claude

```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
export AIC_PROVIDER=anthropic
export AIC_MODEL=claude-3-sonnet-20240229   # default in code
```

See the [Anthropic Models documentation](https://docs.anthropic.com/en/docs/models-overview) for the current list of supported Claude models.

### Google Gemini

```bash
export GEMINI_API_KEY="your-key-here"
export AIC_PROVIDER=gemini
export AIC_MODEL=gemini-2.5-flash-lite   # default in code
```

See the [Gemini Models documentation](https://ai.google.dev/gemini-api/docs/models) for the current list of supported models.

**Performance tip:** for fastest commit generation, use `gemini-2.5-flash-lite` with 250-300 tokens.

### Z.AI

```bash
export ZAI_API_KEY="your-key-here"
export AIC_PROVIDER=zai
export AIC_MODEL=glm-5.1   # or glm-5, glm-4.6, etc.
```

See the [Z.AI model documentation](https://docs.z.ai/guides/llm/glm-5) and [pricing documentation](https://docs.z.ai/guides/overview/pricing) for current model IDs and rates.

Notes:

- For commit generation, use `AIC_PROVIDER=zai` or config. The top-level `--provider` flag does not currently accept `zai`.
- The `pr` subcommand does accept `--provider zai`.
- With `AIC_DEBUG=true` or `DEBUG=true`, Z.AI logs request details, token usage, and an estimated request cost when pricing data is available.

## Examples

### Basic workflow

```bash
echo "console.log('Hello World');" > hello.js
git add hello.js
aic-commit --description "Add hello world example"
```

Output:

```text
✅ Repository validated
✅ Configuration loaded
✅ API configuration validated
✅ Changes analyzed
✅ openai provider initialized
✅ Commit message generated
[10:42:13] ℹ️  Generated commit message:

feat: add hello world console output

[10:42:13] ℹ️  Files to be committed: hello.js
✅ Commit created successfully
```

### Dry run with JSON output

```bash
aic-commit --dry-run --json
```

```json
{
  "message": "feat: add user authentication middleware",
  "provider": "openai",
  "model": "gpt-4",
  "files": ["src/auth.js", "src/middleware.js"],
  "dryRun": true
}
```

### Excluding files

```bash
# Exclude test files and documentation
aic-commit --exclude "*.test.js" "*.spec.ts" "docs/**" "README.md"

# Or via config file
echo '{"excludePatterns": ["*.test.*", "docs/**"]}' > .aiccommitrc.json
aic-commit
```

### Custom provider and model

```bash
# Claude with a specific model
aic-commit --provider anthropic --model claude-3-opus-20240229

# Gemini
aic-commit --provider gemini --model gemini-1.5-pro

# Gemini with a higher token limit (recommended for Gemini)
aic-commit --provider gemini --max-tokens 300

# Latest Gemini 2.5 with adequate tokens
aic-commit --provider gemini --model gemini-2.5-pro --max-tokens 400

# Z.AI via environment variables or config
AIC_PROVIDER=zai AIC_MODEL=glm-5.1 aic-commit --dry-run
```

### Multiple choices

Generate several options and pick the best one:

```bash
# Generate 3 options
aic-commit --choices 3

# Combine with other flags
aic-commit --choices 3 --provider anthropic --description "Auth system"

# View all options without committing
aic-commit --choices 3 --dry-run
```

Interactive selection:

```text
✅ Changes analyzed
✅ Commit message options generated

Choose your commit message:
1. feat(auth): add user authentication system
2. feat(security): implement login and signup flows
3. feat(backend): create user management endpoints

Select option (1-3): 2

✅ Commit created successfully
```

JSON output with multiple choices:

```bash
aic-commit --choices 3 --dry-run --json
```

### Detailed commit messages

Generate comprehensive multi-line messages with bullet-point explanations:

```bash
# Detailed commit with explanations
aic-commit --detailed --max-tokens 400

# Detailed plus multiple choices
aic-commit --detailed --choices 3 --max-tokens 600

# Preview the detailed format
aic-commit --detailed --dry-run --max-tokens 400
```

Example output:

```text
feat(auth): implement user authentication system

- add login and signup forms with validation
- integrate JWT token management for sessions
- create password reset functionality via email
- implement role-based access control middleware
- add user profile management endpoints
```

<details>
<summary><b>Detailed messages with multiple choices, and token sizing guidance</b></summary>

Detailed plus choices:

```text
Choose your commit message:
1. feat(auth): implement user authentication system

- add login and signup forms with validation
- integrate JWT token management for sessions
- create password reset functionality via email
- implement role-based access control middleware

2. feat(security): create user authentication features

- design secure login flow with input validation
- develop JWT-based session management system
- build password recovery via email verification
- add user role permissions and access control

3. feat(backend): develop authentication infrastructure

- create user registration and login endpoints
- implement secure session handling with JWT
- add password reset email functionality
- build role-based permission system

Select option (1-3): _
```

Token requirements for detailed commits:

- **Simple detailed:** 300-500 tokens
- **Detailed + choices:** 500-800 tokens
- **Complex projects:** 600-1000 tokens

</details>

<details>
<summary><b>Troubleshooting token limits</b></summary>

If you hit `MAX_TOKENS` errors, especially with Gemini, raise the limit:

```bash
# Increase the token limit for better response completion
aic-commit --max-tokens 300

# For complex changes, go higher
aic-commit --max-tokens 500

# For detailed commits
aic-commit --detailed --max-tokens 600
```

Provider-specific recommendations:

| Provider | Recommended tokens |
| -------- | ------------------ |
| OpenAI | 150-200 (efficient) |
| Anthropic | 150-250 (balanced) |
| Gemini | 300-400 (needs more to complete responses) |
| Detailed commits | 400-800 (depending on complexity) |

</details>

## PR Description and Creation

Generate an AI pull request description by comparing your current branch against a base branch, or open a GitHub PR directly with an AI-generated title and body.

### Basic usage

```bash
# Generate a PR description (compares to dev by default)
aic-commit pr

# Create a GitHub PR with an AI title and body
aic-commit pr --create

# Create a PR without opening the browser
aic-commit pr --create --no-open

# Compare to a different base branch
aic-commit pr --base main

# Add context for a better description
aic-commit pr -d "This adds OAuth2 support for third-party integrations"

# Print only (do not copy to clipboard)
aic-commit pr --no-clipboard

# JSON output for scripting
aic-commit pr --json

# Use Z.AI for PR generation
aic-commit pr --provider zai --model glm-5.1
```

### PR subcommand options

| Option                        | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `-b, --base <branch>`         | Base branch to compare against (default: `dev`)  |
| `-d, --description <text>`    | Additional context for the AI                    |
| `-c, --create`                | Create a PR with GitHub CLI (`gh`)               |
| `--no-open`                   | Do not open the PR in the browser (`--create` only) |
| `--no-clipboard`              | Do not copy to clipboard (description mode only) |
| `-x, --exclude <patterns...>` | File patterns to exclude (glob patterns)         |
| `--config <path>`             | Path to custom configuration file                |
| `--model <model>`             | AI model to use (overrides config)               |
| `--provider <provider>`       | AI provider: `openai`, `anthropic`, `gemini`, `zai` |
| `--max-tokens <number>`       | Maximum tokens for AI response (1-8000)          |
| `-v, --verbose`               | Show detailed progress information               |
| `--debug`                     | Show debug information                           |
| `-q, --quiet`                 | Suppress progress output                         |
| `--json`                      | Output results in JSON format                    |

### Creating PRs with GitHub CLI

When you pass `--create`, the tool:

1. Verifies that `gh` is installed and authenticated
2. Checks whether a PR already exists for the current branch
3. Pushes the branch to `origin` if it has no upstream or is ahead of remote
4. Generates a structured PR title and body with the configured AI provider
5. Runs `gh pr create`

The created PR opens in your browser by default. Use `--no-open` to skip that.

**Requirements for `--create`:**

- `gh` must be installed
- `gh auth login` must already be completed
- The current branch must be pushable to `origin`
- There must be commits between the current branch and the selected base branch

### PR templates

The tool automatically detects and uses your repository's PR template if one exists. Checked locations, in order:

1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/pull_request_template.md`
3. `PULL_REQUEST_TEMPLATE.md`
4. `pull_request_template.md`
5. `.github/PULL_REQUEST_TEMPLATE/default.md`

If no template is found, a sensible default with Summary, Changes, Testing, and Checklist sections is used.

### Example output

Description-only output:

```text
## Summary

Implements OAuth2 authentication flow for third-party integrations, allowing users to connect external services securely.

## Changes

- Add OAuth2 authorization endpoint in `src/auth/oauth.ts`
- Implement token exchange and refresh logic
- Create callback handler for OAuth redirects
- Add secure token storage using encrypted cookies
- Update user model to store OAuth provider connections

## Testing

- Unit tests added for token exchange logic
- Integration tests for OAuth flow with mock provider
- Manual testing with Google and GitHub OAuth

## Checklist

- [ ] Code follows project conventions
- [ ] Tests added/updated as needed
- [ ] Documentation updated as needed
```

JSON output when creating a PR:

```json
{
  "title": "feat: add OAuth2 support for third-party integrations",
  "description": "## Summary\n\nImplements OAuth2 authentication flow for third-party integrations...",
  "url": "https://github.com/owner/repo/pull/123",
  "number": 123,
  "provider": "openai",
  "model": "gpt-4",
  "baseBranch": "dev",
  "currentBranch": "feature/oauth2-support",
  "filesChanged": ["src/auth/oauth.ts", "src/models/user.ts"]
}
```

### Tips

- **Use context.** The `-d` flag helps the AI understand the purpose of your changes beyond what the diff shows.
- **Token limits.** PR descriptions benefit from higher limits. Set `AIC_MAX_TOKENS=800` or more for comprehensive descriptions.
- **GitHub CLI flow.** `--create` creates the PR directly, so clipboard copying is skipped in that mode.
- **Branch pushing.** `--create` pushes the current branch to `origin` if needed before creating the PR.
- **Custom templates.** Add a `.github/PULL_REQUEST_TEMPLATE.md` to keep PR formats consistent across your team.

## Troubleshooting

Common errors and solutions:

| Error                     | Solution                                 |
| ------------------------- | ---------------------------------------- |
| "Not a git repository"    | Run from within a git repository         |
| "No staged changes found" | Stage files with `git add`               |
| "API key not found"       | Set the appropriate environment variable |
| "Invalid API key"         | Check your API key format and validity   |
| "Quota exceeded"          | Check your API billing/usage limits      |
| "Model not found"         | Use a supported model name               |
| "Unverified commits"      | Configure commit signing (see below)     |

<details>
<summary><b>Commit signing (Unverified commits on GitHub)</b></summary>

If your commits show as "Unverified" on GitHub, this is a commit signing configuration issue. The tool respects your git signing settings, but you may need to configure SSH or GPG signing.

**SSH commit signing (recommended)**

1. Enable SSH signing in git:

```bash
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey "ssh-ed25519 YOUR_SSH_PUBLIC_KEY"
```

2. Configure the allowed signers file:

```bash
mkdir -p ~/.config/git
echo "your-email@example.com ssh-ed25519 YOUR_SSH_PUBLIC_KEY" > ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

3. Add your SSH key to GitHub under Settings → SSH and GPG keys as a **Signing Key** (not just authentication).

**GPG commit signing**

1. Generate a GPG key:

```bash
gpg --full-generate-key
```

2. Configure git to use GPG:

```bash
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY_ID
```

3. Add your GPG key to GitHub: export with `gpg --armor --export YOUR_GPG_KEY_ID`, then add it under Settings → SSH and GPG keys.

**Verify it works**

```bash
echo "test" > test.txt && git add test.txt && git commit -m "test: verify signing"
git verify-commit HEAD
```

A "Good signature" result means your commits will show as "Verified" on GitHub.

</details>

## API Reference

### Command line interface

The main command is `aic-commit`, with a `pr` subcommand for pull request workflows.

### Exit codes

| Code | Meaning |
| ---- | ------- |
| `0` | Success |
| `1` | Error (invalid configuration, API error, git error, etc.) |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun test`
5. Build the project: `bun run build`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development setup

```bash
# Clone
git clone https://github.com/jhubbardsf/aic-commit.git
cd aic-commit

# Install dependencies
bun install

# Lint and format
bun run lint
bun run format

# Run tests
bun test

# Build
bun run build

# Test the built CLI locally
./dist/cli.js --help
```

### Code quality

This project uses ESLint and Prettier for consistent code quality:

```bash
bun run lint           # check for linting issues
bun run lint:fix       # auto-fix linting issues
bun run format         # format with Prettier
bun run format:check   # verify formatting
```

The build process runs linting and formatting checks before building.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.
