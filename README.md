# AI Conventional Commit

AI-powered conventional commit message and PR description generator that analyzes your staged changes or branch diffs and creates meaningful commit messages, pull request descriptions, and GitHub pull requests.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [AI Providers](#ai-providers)
- [Examples](#examples)
- [PR Description and Creation](#pr-description-and-creation)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Features

- **AI-Powered**: Supports OpenAI, Anthropic, Google Gemini, and ZAI
- **Conventional Commits**: Follows the conventional commit format automatically
- **PR Descriptions and Creation**: Generate comprehensive pull request descriptions from branch diffs or create a GitHub PR directly
- **Context-Aware**: Analyzes your actual code changes to generate relevant messages
- **Configurable**: Support for config files, environment variables, and CLI options
- **Smart Filtering**: Exclude files with glob patterns
- **Flexible**: Supports dry-run mode and custom descriptions
- **Multiple Output Formats**: Human-readable or JSON output
- **Fast**: Built with Bun for optimal performance

## Installation

### Global Installation (Recommended)

```bash
# Using npm
npm install -g ai-conventional-commit

# Using bun
bun install -g ai-conventional-commit

# Using yarn
yarn global add ai-conventional-commit
```

### Per-project Installation

```bash
# Using npm
npm install --save-dev ai-conventional-commit

# Using bun
bun add --dev ai-conventional-commit

# Using yarn
yarn add --dev ai-conventional-commit
```

## Quick Start

1. **Set up your AI provider API key:**

```bash
# For OpenAI (default)
export OPENAI_API_KEY="sk-your-key-here"

# For Anthropic
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# For Google Gemini
export GEMINI_API_KEY="your-key-here"

# For ZAI
export ZAI_API_KEY="your-key-here"
```

2. **Stage your changes:**

```bash
git add .
```

3. **Generate and commit:**

```bash
# If installed globally
aic-commit

# If installed per-project
npx aic-commit
```

## Usage

### Basic Usage

```bash
# Generate and commit with AI message
aic-commit

# Generate message without committing (dry run)
aic-commit --dry-run

# Add context for better messages
aic-commit --description "Implementing user authentication system"

# Exclude certain files
aic-commit --exclude "*.test.js" "docs/**"
```

### Advanced Usage

```bash
# Use specific AI provider and model
aic-commit --provider anthropic --model claude-3-sonnet-20240229

# Verbose output with debugging
aic-commit --verbose --debug

# JSON output for scripting
aic-commit --json --dry-run

# Custom configuration file
aic-commit --config ./my-config.json
```

### CLI Options

| Option                        | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `-d, --description <text>`    | Additional context for the AI                  |
| `-x, --exclude <patterns...>` | File patterns to exclude (glob patterns)       |
| `--config <path>`             | Path to custom configuration file              |
| `--model <model>`             | AI model to use (overrides config)             |
| `--provider <provider>`       | AI provider: openai, anthropic, gemini         |
| `--max-tokens <number>`       | Maximum tokens for AI response (1-8000)        |
| `--choices <number>`          | Generate multiple options to choose from (2-5) |
| `--detailed`                  | Generate detailed multi-line commit messages   |
| `--dry-run`                   | Generate message without committing            |
| `-v, --verbose`               | Show detailed progress information             |
| `--debug`                     | Show debug information                         |
| `-q, --quiet`                 | Suppress all output except errors              |
| `--json`                      | Output results in JSON format                  |

## Configuration

### Environment Variables

```bash
# Provider selection
export AIC_PROVIDER=openai            # openai, anthropic, gemini, zai
export AIC_MODEL=gpt-4                # Model name

# API Keys
export OPENAI_API_KEY=sk-...         # OpenAI API key
export ANTHROPIC_API_KEY=sk-ant-...  # Anthropic API key
export GEMINI_API_KEY=...            # Google Gemini API key
export ZAI_API_KEY=...               # ZAI API key

# Optional settings
export AIC_MAX_TOKENS=150            # Maximum tokens for response
export AIC_TEMPERATURE=0.3           # AI temperature (0.0-2.0)
export AIC_DEFAULT_DESCRIPTION="..." # Default description
export AIC_DEBUG=true                # ZAI provider-level request/usage logging
```

Note: the top-level `aic-commit --provider` flag currently accepts `openai`, `anthropic`, and `gemini`. To use ZAI for commit-message generation, set `AIC_PROVIDER=zai` or put `"provider": "zai"` in config. The `pr` subcommand does accept `--provider zai` directly.

### Configuration Files

Create a `.aiccommitrc.json` file in your project root or home directory:

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

Supported config file formats:

- `.aiccommitrc`
- `.aiccommitrc.json`
- `.aiccommitrc.js`
- `.aiccommit.config.js`
- `aiccommit.config.js`
- `package.json` (under `"aiccommit"` key)

### Configuration Priority

Configuration is loaded in this order (highest to lowest priority):

1. CLI flags
2. Environment variables
3. Config file discovered by `cosmiconfig` (or an explicit `--config` path)
4. Default values

## AI Providers

The commands do not all expose providers in exactly the same way:

- `aic-commit --provider` supports `openai`, `anthropic`, and `gemini`
- `aic-commit pr --provider` supports `openai`, `anthropic`, `gemini`, and `zai`
- `AIC_PROVIDER` and config files support all four: `openai`, `anthropic`, `gemini`, and `zai`

Default models in code:

| Provider | Default model |
| -------- | ------------- |
| OpenAI | `gpt-4` |
| Anthropic | `claude-3-sonnet-20240229` |
| Gemini | `gemini-2.5-flash-lite` |
| ZAI | `glm-4.6` |

### OpenAI (Default)

```bash
export OPENAI_API_KEY="sk-your-key-here"
export AIC_PROVIDER=openai
export AIC_MODEL=gpt-4  # or gpt-3.5-turbo, gpt-4o, etc.
```

**Available Models:** See [OpenAI Models Documentation](https://platform.openai.com/docs/models) for the current list of supported models.

### Anthropic Claude

```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
export AIC_PROVIDER=anthropic
export AIC_MODEL=claude-3-sonnet-20240229  # default in code
```

**Available Models:** See [Anthropic Models Documentation](https://docs.anthropic.com/en/docs/models-overview) for the current list of supported Claude models.

### Google Gemini

```bash
export GEMINI_API_KEY="your-key-here"
export AIC_PROVIDER=gemini
export AIC_MODEL=gemini-2.5-flash-lite  # default in code
```

**Available Models:** See [Gemini Models Documentation](https://ai.google.dev/gemini-api/docs/models) for the current list of supported models.

**Performance Tip:** For fastest commit generation, use `gemini-2.5-flash-lite` with 250-300 tokens.

### ZAI

```bash
export ZAI_API_KEY="your-key-here"
export AIC_PROVIDER=zai
export AIC_MODEL=glm-5.1  # or glm-5, glm-4.6, etc.
```

**Available Models:** See the [Z.AI model documentation](https://docs.z.ai/guides/llm/glm-5) and [pricing documentation](https://docs.z.ai/guides/overview/pricing) for current model IDs and rates.

Notes:

- For commit-message generation, use `AIC_PROVIDER=zai` or config; the top-level `--provider` flag does not currently accept `zai`
- The `pr` subcommand does accept `--provider zai`
- With `AIC_DEBUG=true` or `DEBUG=true`, ZAI logs request details, token usage, and an estimated request cost when pricing data is available

## Examples

### Basic Workflow

```bash
# Make some changes
echo "console.log('Hello World');" > hello.js

# Stage the changes
git add hello.js

# Generate AI commit message
aic-commit --description "Add hello world example"
```

Output:

```
✅ Repository validated
✅ Configuration loaded
✅ API configuration validated
✅ Changes analyzed
✅ openai provider initialized
✅ Commit message generated
✅ Commit created successfully

Generated commit message:
feat: add hello world console output

Files to be committed: hello.js
```

### Dry Run with JSON Output

```bash
aic-commit --dry-run --json
```

Output:

```json
{
  "message": "feat: add user authentication middleware",
  "provider": "openai",
  "model": "gpt-4",
  "files": ["src/auth.js", "src/middleware.js"],
  "dryRun": true
}
```

### Excluding Files

```bash
# Exclude test files and documentation
aic-commit --exclude "*.test.js" "*.spec.ts" "docs/**" "README.md"

# Using config file
echo '{"excludePatterns": ["*.test.*", "docs/**"]}' > .aiccommitrc.json
aic-commit
```

### Custom Provider and Model

```bash
# Use Claude with specific model
aic-commit --provider anthropic --model claude-3-opus-20240229

# Use Gemini
aic-commit --provider gemini --model gemini-1.5-pro

# Use Gemini with higher token limit (recommended for Gemini)
aic-commit --provider gemini --max-tokens 300

# Use latest Gemini 2.5 models with adequate tokens
aic-commit --provider gemini --model gemini-2.5-pro --max-tokens 400

# Use ZAI via environment variables or config
AIC_PROVIDER=zai AIC_MODEL=glm-5.1 aic-commit --dry-run
```

### Multiple Choice Options

Generate multiple commit message options and choose the best one:

```bash
# Generate 3 options to choose from
aic-commit --choices 3

# Combine with other options
aic-commit --choices 3 --provider anthropic --description "Auth system"

# View all options without committing
aic-commit --choices 3 --dry-run
```

**Interactive Selection Example:**

```
✅ Changes analyzed
✅ Commit message options generated

Choose your commit message:
1. feat(auth): add user authentication system
2. feat(security): implement login and signup flows
3. feat(backend): create user management endpoints

Select option (1-3): 2

✅ Commit created successfully
```

**JSON Output with Multiple Choices:**

```bash
aic-commit --choices 3 --dry-run --json
```

### Detailed Commit Messages

Generate comprehensive multi-line commit messages with bullet-point explanations:

```bash
# Generate detailed commit with explanations
aic-commit --detailed --max-tokens 400

# Combine detailed with multiple choices
aic-commit --detailed --choices 3 --max-tokens 600

# Preview detailed format
aic-commit --detailed --dry-run --max-tokens 400
```

**Example Output:**

```
feat(auth): implement user authentication system

- add login and signup forms with validation
- integrate JWT token management for sessions
- create password reset functionality via email
- implement role-based access control middleware
- add user profile management endpoints
```

**Detailed with Multiple Choices:**

```
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

**Token Requirements for Detailed Commits:**

- **Simple detailed**: 300-500 tokens
- **Detailed + choices**: 500-800 tokens
- **Complex projects**: 600-1000 tokens

### Troubleshooting Token Limits

If you encounter "MAX_TOKENS" errors, especially with Gemini:

```bash
# Increase token limit for better response completion
aic-commit --max-tokens 300

# For complex changes, use even higher limits
aic-commit --max-tokens 500

# For detailed commits, use higher token limits
aic-commit --detailed --max-tokens 600

# Provider-specific recommendations:
# OpenAI: 150-200 tokens (efficient)
# Anthropic: 150-250 tokens (balanced)
# Gemini: 300-400 tokens (needs more tokens to complete responses)
# Detailed commits: 400-800 tokens (depending on complexity)
```

## PR Description and Creation

Generate AI-powered pull request descriptions by comparing your current branch against a base branch, or create a GitHub PR directly with an AI-generated title and body.

### Basic Usage

```bash
# Generate PR description (compares to dev by default)
aic-commit pr

# Create a GitHub PR with AI-generated title and body
aic-commit pr --create

# Create a PR without opening the browser
aic-commit pr --create --no-open

# Compare to a different base branch
aic-commit pr --base main

# Add context for better descriptions
aic-commit pr -d "This adds OAuth2 support for third-party integrations"

# Print only (don't copy to clipboard)
aic-commit pr --no-clipboard

# JSON output for scripting
aic-commit pr --json

# Use ZAI for PR generation
aic-commit pr --provider zai --model glm-5.1
```

### PR Subcommand Options

| Option                        | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `-b, --base <branch>`         | Base branch to compare against (default: `dev`) |
| `-d, --description <text>`    | Additional context for the AI                   |
| `-c, --create`                | Create a PR with GitHub CLI (`gh`)              |
| `--no-open`                   | Do not open PR in the browser (`--create` only) |
| `--no-clipboard`              | Do not copy to clipboard (description mode only) |
| `-x, --exclude <patterns...>` | File patterns to exclude (glob patterns)        |
| `--config <path>`             | Path to custom configuration file               |
| `--model <model>`             | AI model to use (overrides config)              |
| `--provider <provider>`       | AI provider: openai, anthropic, gemini, zai     |
| `--max-tokens <number>`       | Maximum tokens for AI response (1-8000)         |
| `-v, --verbose`               | Show detailed progress information              |
| `--debug`                     | Show debug information                          |
| `-q, --quiet`                 | Suppress progress output                        |
| `--json`                      | Output results in JSON format                   |

### Creating PRs with GitHub CLI

When you pass `--create`, the tool:

1. Verifies that `gh` is installed and authenticated
2. Checks whether a PR already exists for the current branch
3. Pushes the branch to `origin` if it has no upstream or is ahead of remote
4. Generates a structured PR title and body with the configured AI provider
5. Runs `gh pr create`

By default, the created PR opens in your browser. Use `--no-open` to skip that behavior.

Requirements for `--create`:

- `gh` must be installed
- `gh auth login` must already be completed
- The current branch must be pushable to `origin`
- There must be commits between the current branch and the selected base branch

### PR Templates

The tool automatically detects and uses your repository's PR template if one exists:

**Checked locations (in order):**
1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/pull_request_template.md`
3. `PULL_REQUEST_TEMPLATE.md`
4. `pull_request_template.md`
5. `.github/PULL_REQUEST_TEMPLATE/default.md`

If no template is found, a sensible default template is used with Summary, Changes, Testing, and Checklist sections.

### Example Output

Description-only output:

```
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

- **Use context**: The `-d` flag helps the AI understand the purpose of your changes beyond what the code diff shows
- **Token limits**: PR descriptions benefit from higher token limits. Set `AIC_MAX_TOKENS=800` or higher for comprehensive descriptions
- **GitHub CLI flow**: `--create` creates the PR directly, so clipboard copying is skipped in that mode
- **Branch pushing**: `--create` will push the current branch to `origin` if needed before creating the PR
- **Custom templates**: Create a `.github/PULL_REQUEST_TEMPLATE.md` file to ensure consistent PR formats across your team

## Troubleshooting

### Commit Signing Issues

If your commits show as "Unverified" on GitHub, this is likely due to commit signing configuration. The tool respects your git signing settings, but you may need to configure SSH signing properly.

#### SSH Commit Signing Setup

If you're using SSH keys for commit signing (recommended), ensure you have:

1. **SSH signing enabled in git:**
```bash
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey "ssh-ed25519 YOUR_SSH_PUBLIC_KEY"
```

2. **Configure allowed signers file:**
```bash
# Create the allowed signers file
mkdir -p ~/.config/git
echo "your-email@example.com ssh-ed25519 YOUR_SSH_PUBLIC_KEY" > ~/.config/git/allowed_signers

# Tell git where to find it
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

3. **Add your SSH key to GitHub:**
   - Go to GitHub Settings → SSH and GPG keys
   - Add your SSH public key as a "Signing Key" (not just authentication)

#### GPG Commit Signing Setup

If you prefer GPG signing:

1. **Generate a GPG key:**
```bash
gpg --full-generate-key
```

2. **Configure git to use GPG:**
```bash
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY_ID
```

3. **Add your GPG key to GitHub:**
   - Export: `gpg --armor --export YOUR_GPG_KEY_ID`
   - Add to GitHub Settings → SSH and GPG keys

#### Verification

Test that signing works:
```bash
# Make a test commit
echo "test" > test.txt && git add test.txt && git commit -m "test: verify signing"

# Check if it's signed
git verify-commit HEAD
```

If you see "Good signature", your commits will show as "Verified" on GitHub.

## API Reference

### Command Line Interface

The main CLI command is `aic-commit` (or `ai-conventional-commit`).

### Exit Codes

- `0`: Success
- `1`: Error (invalid configuration, API error, git error, etc.)

### Error Handling

Common errors and solutions:

| Error                     | Solution                                 |
| ------------------------- | ---------------------------------------- |
| "Not a git repository"    | Run from within a git repository         |
| "No staged changes found" | Stage files with `git add`               |
| "API key not found"       | Set the appropriate environment variable |
| "Invalid API key"         | Check your API key format and validity   |
| "Quota exceeded"          | Check your API billing/usage limits      |
| "Model not found"         | Use a supported model name               |
| "Unverified commits"      | Configure commit signing (see [Troubleshooting](#troubleshooting)) |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun test`
5. Build the project: `bun run build`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/jhubbardsf/ai-conventional-commit.git
cd ai-conventional-commit

# Install dependencies
bun install

# Run linting and formatting
bun run lint
bun run format

# Run tests
bun test

# Build the project
bun run build

# Test locally
./dist/cli.js --help
```

### Code Quality

This project uses ESLint and Prettier for code quality and consistent formatting:

```bash
# Check for linting issues
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Format code with Prettier
bun run format

# Check if code is properly formatted
bun run format:check
```

The build process automatically runs linting and formatting checks before building to ensure code quality.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.
