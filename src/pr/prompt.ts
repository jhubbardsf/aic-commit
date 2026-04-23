/**
 * Creates the system prompt for PR description generation
 */
export function createPRSystemPrompt(
  template: string,
  branchName: string
): string {
  return `You are an expert developer assistant that generates detailed, well-structured pull request descriptions.

Your task is to analyze code changes and generate a comprehensive PR description that follows the provided template format.

BRANCH: ${branchName}

TEMPLATE TO FOLLOW:
${template}

RULES:
1. Fill in all sections of the template based on the code changes
2. Be specific and technical - mention actual file names, functions, and components changed
3. For the Summary section, write 1-2 sentences describing the overall purpose
4. For the Changes section, use bullet points listing specific modifications
5. For the Testing section, suggest appropriate testing approaches based on the changes
6. Keep HTML comments (<!-- -->) as placeholders only if you cannot determine the content
7. Remove any template instructions/placeholders that you fill in
8. Use markdown formatting appropriately
9. Be concise but thorough - PRs should be scannable but complete
10. If the template has checkboxes, leave them as unchecked (- [ ]) for the author to verify

OUTPUT FORMAT:
- Output ONLY the filled-in PR description
- Do NOT include any preamble like "Here's the PR description:"
- Start directly with the first section heading
`;
}

/**
 * Creates the user prompt containing the diff and optional context
 */
export function createPRUserPrompt(
  diff: string,
  description?: string
): string {
  let prompt = 'Please generate a PR description for the following changes:\n\n';

  if (description) {
    prompt += `ADDITIONAL CONTEXT FROM AUTHOR:\n${description}\n\n`;
  }

  prompt += `GIT DIFF:\n\`\`\`diff\n${diff}\n\`\`\``;

  return prompt;
}

/**
 * Post-processes the PR description to clean up any artifacts
 */
export function postProcessPRDescription(response: string): string {
  let cleaned = response.trim();

  // Remove any leading markdown code block markers if present
  if (cleaned.startsWith('```markdown')) {
    cleaned = cleaned.slice('```markdown'.length);
  } else if (cleaned.startsWith('```md')) {
    cleaned = cleaned.slice('```md'.length);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  // Remove trailing code block marker
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  // Remove common AI preambles
  const preambles = [
    /^Here(?:'s| is) (?:the |a )?(?:PR |pull request )?description[:\s]*/i,
    /^Based on (?:the )?(?:code )?changes[,\s]*/i,
    /^I've (?:generated|created|prepared)[:\s]*/i,
  ];

  for (const preamble of preambles) {
    cleaned = cleaned.replace(preamble, '');
  }

  return cleaned.trim();
}

/**
 * Creates the system prompt for structured PR generation (title + body)
 * Used when --create flag is passed to generate both title and body as JSON
 */
export function createStructuredPRSystemPrompt(
  template: string,
  branchName: string
): string {
  return `You are an expert developer assistant that generates detailed, well-structured pull request titles and descriptions.

Your task is to analyze code changes and generate BOTH a PR title and a comprehensive PR body.

BRANCH: ${branchName}

TEMPLATE FOR BODY:
${template}

RULES FOR TITLE:
1. Write a concise, descriptive title (max 72 characters)
2. Use imperative mood (e.g., "Add", "Fix", "Update", not "Added", "Fixes")
3. No period at the end
4. Summarize the main change in one line
5. Can optionally include a prefix like "feat:", "fix:", "chore:" if appropriate

RULES FOR BODY:
1. Fill in all sections of the template based on the code changes
2. Be specific and technical - mention actual file names, functions, and components changed
3. For the Summary section, write 1-2 sentences describing the overall purpose
4. For the Changes section, use bullet points listing specific modifications
5. For the Testing section, suggest appropriate testing approaches based on the changes
6. Remove any template instructions/placeholders that you fill in
7. Use markdown formatting appropriately

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object in this exact format:
{
  "title": "Your concise PR title here",
  "body": "## Summary\\n\\nYour PR body content here..."
}

Do NOT include any text before or after the JSON object.
Do NOT wrap the JSON in markdown code blocks.
`;
}

import type { PRContent } from '../types/index.js';

/**
 * Parses the structured PR response from the AI to extract title and body
 */
export function parseStructuredPRResponse(response: string): PRContent {
  let cleaned = response.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (!parsed.title || typeof parsed.title !== 'string') {
      throw new Error('Missing or invalid title in AI response');
    }
    if (!parsed.body || typeof parsed.body !== 'string') {
      throw new Error('Missing or invalid body in AI response');
    }

    return {
      title: parsed.title.trim(),
      body: parsed.body.trim(),
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
    throw error;
  }
}
