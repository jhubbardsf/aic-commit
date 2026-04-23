import type { AIProvider, PRContent } from '../types/index.js';
import {
  createPRSystemPrompt,
  createPRUserPrompt,
  postProcessPRDescription,
  createStructuredPRSystemPrompt,
  parseStructuredPRResponse,
} from './prompt.js';

/**
 * Generates a PR description using the AI provider
 */
export async function generatePRDescription(
  provider: AIProvider,
  diff: string,
  template: string,
  branchName: string,
  description?: string
): Promise<string> {
  const systemPrompt = createPRSystemPrompt(template, branchName);
  const userPrompt = createPRUserPrompt(diff, description);

  // Use the provider's generic generate method with our PR-specific prompts
  const response = await provider.generate(systemPrompt, userPrompt);

  return postProcessPRDescription(response);
}

/**
 * Generates structured PR content (title + body) using the AI provider
 * Used when --create flag is passed to create the PR via gh CLI
 */
export async function generatePRContent(
  provider: AIProvider,
  diff: string,
  template: string,
  branchName: string,
  description?: string
): Promise<PRContent> {
  const systemPrompt = createStructuredPRSystemPrompt(template, branchName);
  const userPrompt = createPRUserPrompt(diff, description);

  const response = await provider.generate(systemPrompt, userPrompt);

  return parseStructuredPRResponse(response);
}
