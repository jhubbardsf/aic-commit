import OpenAI from 'openai';
import { OpenAIProvider } from './openai.js';

interface ZAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
}

const ZAI_PRICING_PER_MILLION: Record<
  string,
  { input: number; output: number; cachedInput?: number }
> = {
  'glm-5.1': { input: 1.4, output: 4.4, cachedInput: 0.26 },
  'glm-5': { input: 1.0, output: 3.2, cachedInput: 0.2 },
  'glm-5-turbo': { input: 1.2, output: 4.0, cachedInput: 0.24 },
  'glm-4.7': { input: 0.6, output: 2.2, cachedInput: 0.11 },
  'glm-4.7-flashx': { input: 0.07, output: 0.4, cachedInput: 0.01 },
  'glm-4.7-flash': { input: 0, output: 0, cachedInput: 0 },
  'glm-4.6': { input: 0.6, output: 2.2, cachedInput: 0.11 },
  'glm-4.5': { input: 0.6, output: 2.2, cachedInput: 0.11 },
  'glm-4.5-x': { input: 2.2, output: 8.9, cachedInput: 0.45 },
  'glm-4.5-air': { input: 0.2, output: 1.1, cachedInput: 0.03 },
  'glm-4.5-airx': { input: 1.1, output: 4.5, cachedInput: 0.22 },
  'glm-4.5-flash': { input: 0, output: 0, cachedInput: 0 },
  'glm-4-32b-0414-128k': { input: 0.1, output: 0.1 },
};

export class ZAIProvider extends OpenAIProvider {
  override name = 'zai';

  constructor(
    apiKey: string,
    model: string = 'glm-4.6',
    maxTokens: number = 150,
    temperature: number = 0.3
  ) {
    super(apiKey, model, maxTokens, temperature);
    // Override the client with ZAI's base URL
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://api.z.ai/api/paas/v4/',
    });
  }

  override async generateCommitMessage(
    diff: string,
    description?: string,
    choices?: number,
    detailed?: boolean
  ): Promise<string> {
    const isDebug =
      process.env.DEBUG === 'true' || process.env.AIC_DEBUG === 'true';

    if (isDebug) {
      console.error('\n[ZAI Debug] Request Details:');
      console.error(`  Provider: ${this.name}`);
      console.error(`  Base URL: https://api.z.ai/api/paas/v4/`);
      console.error(`  Model: ${this.model}`);
      console.error(`  Max Tokens: ${this.maxTokens}`);
      console.error(`  Temperature: ${this.temperature}`);
      console.error(
        `  API Key: ${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}`
      );
      console.error(`  Choices: ${choices || 1}`);
      console.error(`  Detailed: ${detailed || false}`);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.createSystemPrompt(choices, detailed),
          },
          {
            role: 'user',
            content: this.createUserPrompt(diff, description),
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      if (isDebug) {
        console.error('\n[ZAI Debug] Response received successfully');
        console.error(`  Choices returned: ${response.choices.length}`);
        console.error(`  Model used: ${response.model}`);
        logZAIUsageDebug(response.model ?? this.model, response.usage);
      }

      const message = response.choices[0]?.message?.content;
      if (!message) {
        throw new Error('ZAI returned empty response');
      }

      // Handle detailed commits or multiple choices
      if (detailed || (choices && choices > 1)) {
        return message.trim();
      }

      return this.postProcessMessage(message);
    } catch (error) {
      if (isDebug) {
        console.error('\n[ZAI Debug] Error Details:');
        console.error(`  Error type: ${error?.constructor?.name}`);
        console.error(`  Full error:`, error);
      }

      if (error instanceof Error) {
        // Handle specific ZAI/OpenAI errors
        if (error.message.includes('429')) {
          throw new Error(
            `ZAI API error (429): ${error.message}\n` +
              `Provider: ${this.name}, Model: ${this.model}, Base URL: https://api.z.ai/api/paas/v4/\n` +
              `This might indicate: insufficient balance, rate limiting, or wrong API endpoint.\n` +
              `Enable debug mode with: export AIC_DEBUG=true`
          );
        }
        if (error.message.includes('invalid_api_key')) {
          throw new Error(
            `Invalid ZAI API key. Please check your ZAI_API_KEY environment variable.`
          );
        }
        if (error.message.includes('model_not_found')) {
          throw new Error(
            `ZAI model '${this.model}' not found. Available models: glm-4.6, glm-4.5-air`
          );
        }
        throw new Error(`ZAI API error: ${error.message}`);
      }
      throw new Error('Unknown ZAI error');
    }
  }

  override async generate(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const isDebug =
      process.env.DEBUG === 'true' || process.env.AIC_DEBUG === 'true';

    if (isDebug) {
      console.error('\n[ZAI Debug] Generate Request:');
      console.error(`  Provider: ${this.name}`);
      console.error(`  Model: ${this.model}`);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const message = response.choices[0]?.message?.content;
      if (!message) {
        throw new Error('ZAI returned empty response');
      }

      if (isDebug) {
        console.error('\n[ZAI Debug] Response received successfully');
        console.error(`  Choices returned: ${response.choices.length}`);
        console.error(`  Model used: ${response.model}`);
        logZAIUsageDebug(response.model ?? this.model, response.usage);
      }

      return message.trim();
    } catch (error) {
      if (isDebug) {
        console.error('\n[ZAI Debug] Error:', error);
      }

      if (error instanceof Error) {
        throw new Error(`ZAI API error: ${error.message}`);
      }
      throw new Error('Unknown ZAI error');
    }
  }

  override validateConfig(): boolean {
    // ZAI API keys don't have a specific format requirement
    return !!(this.apiKey && this.apiKey.trim());
  }
}

function logZAIUsageDebug(model: string, usage?: ZAIUsage | null): void {
  if (!usage) {
    return;
  }

  const promptTokens = usage.prompt_tokens ?? 0;
  const completionTokens = usage.completion_tokens ?? 0;
  const cachedTokens = usage.prompt_tokens_details?.cached_tokens ?? 0;
  const estimatedCost = estimateZAICost(model, usage);

  console.error(`  Token Usage:`);
  console.error(`    Prompt tokens: ${promptTokens}`);
  console.error(`    Completion tokens: ${completionTokens}`);
  console.error(`    Total tokens: ${promptTokens + completionTokens}`);
  if (cachedTokens > 0) {
    console.error(`    Cached prompt tokens: ${cachedTokens}`);
  }

  if (estimatedCost === null) {
    console.error(
      `    Estimated cost: unavailable (no pricing data for ${model})`
    );
    return;
  }

  console.error(`    Estimated cost: $${formatEstimatedCost(estimatedCost)}`);
}

function estimateZAICost(
  model: string,
  usage?: ZAIUsage | null
): number | null {
  if (!usage) {
    return null;
  }

  const pricing = ZAI_PRICING_PER_MILLION[model.toLowerCase()];
  if (!pricing) {
    return null;
  }

  const promptTokens = usage.prompt_tokens ?? 0;
  const completionTokens = usage.completion_tokens ?? 0;
  const cachedTokens = Math.min(
    usage.prompt_tokens_details?.cached_tokens ?? 0,
    promptTokens
  );
  const uncachedPromptTokens = promptTokens - cachedTokens;
  const cachedInputRate = pricing.cachedInput ?? pricing.input;

  return (
    (uncachedPromptTokens / 1_000_000) * pricing.input +
    (cachedTokens / 1_000_000) * cachedInputRate +
    (completionTokens / 1_000_000) * pricing.output
  );
}

function formatEstimatedCost(cost: number): string {
  if (cost === 0) {
    return '0.000000';
  }

  if (cost < 0.01) {
    return cost.toFixed(6);
  }

  return cost.toFixed(4);
}
