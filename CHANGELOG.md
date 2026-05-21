# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-21

### Added

- Initial release of `aic-commit`
- Support for OpenAI GPT models (GPT-4, GPT-3.5-turbo)
- Support for Anthropic Claude models (Claude-3 variants)
- Support for Google Gemini models
- Support for ZAI provider with cost estimation and usage logging
- Pull request description generation from branch diffs
- `--create` flag for opening GitHub pull requests via the `gh` CLI
- CLI interface with comprehensive options
- Configuration via environment variables and config files
- File exclusion patterns with glob support
- Dry-run mode for testing generated messages
- JSON output format for scripting
- Verbose and debug logging modes
- Conventional commit format validation
- Git repository integration
- Comprehensive test suite
- Full TypeScript support
- Built with Bun for optimal performance

### Features

- **AI-Powered**: Generate intelligent commit messages using state-of-the-art AI models
- **Conventional Commits**: Automatic adherence to conventional commit format
- **Multi-Provider**: Support for OpenAI, Anthropic, and Google Gemini
- **Configurable**: Flexible configuration via files, environment variables, and CLI options
- **Smart Filtering**: Exclude files using glob patterns
- **Developer-Friendly**: Comprehensive logging, error handling, and debugging options
