/**
 * Solo Leveling System - AI Service (Multi-Provider Compatible)
 * 
 * Handles all AI API interactions with proper error handling,
 * rate limiting, token counting, and fallback responses.
 * 
 * Supported Providers:
 * - OpenAI (GPT-4, GPT-3.5, etc.) - Paid
 * - Perplexity (Llama-based models) - Paid
 * - Ollama (Local LLMs) - FREE, self-hosted
 * - Any OpenAI-compatible API endpoint
 */

import { Injectable, Logger } from '@nestjs/common';
import { IOpenAIMessage, IOpenAIResponse } from './interfaces';

export type AIProvider = 'openai' | 'perplexity' | 'ollama' | 'custom';

export interface OpenAICompletionOptions {
  messages: IOpenAIMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  retries?: number;
}

export interface OpenAICompletionResult {
  success: boolean;
  content?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly baseUrl: string;
  private readonly provider: AIProvider;
  
  // Rate limiting
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly maxRequestsPerMinute = 50;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    // Check for custom base URL first (enables any OpenAI-compatible API)
    const customBaseUrl = process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL;
    
    if (customBaseUrl) {
      // Custom/Ollama endpoint
      this.baseUrl = customBaseUrl.replace(/\/$/, ''); // Remove trailing slash
      
      // Detect if it's Ollama based on URL or explicit setting
      const isOllama = customBaseUrl.includes('11434') || 
                       process.env.AI_PROVIDER?.toLowerCase() === 'ollama';
      
      this.provider = isOllama ? 'ollama' : 'custom';
      
      // Default models for different providers
      if (isOllama) {
        this.model = process.env.OPENAI_MODEL || 'llama3.1:8b';
      } else {
        this.model = process.env.OPENAI_MODEL || 'gpt-4o';
      }
      
      this.logger.log(`AI service using custom endpoint: ${this.baseUrl}`);
    } else if (this.apiKey.startsWith('pplx-')) {
      // Perplexity API
      this.provider = 'perplexity';
      this.baseUrl = 'https://api.perplexity.ai';
      this.model = process.env.OPENAI_MODEL || 'llama-3.1-sonar-large-128k-online';
    } else if (this.apiKey) {
      // OpenAI API (default when API key is present)
      this.provider = 'openai';
      this.baseUrl = 'https://api.openai.com/v1';
      this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    } else {
      // No API key - check if Ollama is available locally
      this.provider = 'ollama';
      this.baseUrl = 'http://localhost:11434/v1';
      this.model = process.env.OPENAI_MODEL || 'llama3.1:8b';
    }
    
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10);

    // Log configuration
    if (this.provider === 'ollama') {
      this.logger.log(`AI service initialized with Ollama (FREE local LLM)`);
      this.logger.log(`  → Base URL: ${this.baseUrl}`);
      this.logger.log(`  → Model: ${this.model}`);
      this.logger.log(`  → Make sure Ollama is running: ollama serve`);
    } else if (!this.apiKey) {
      // Custom provider without API key
      this.logger.warn('AI API key not configured - AI features may use fallback responses');
    } else {
      this.logger.log(`AI service initialized with ${this.provider} provider, model: ${this.model}`);
    }
  }

  /**
   * Check if AI service is configured and available
   */
  isAvailable(): boolean {
    // Ollama doesn't need an API key
    if (this.provider === 'ollama') {
      return true;
    }
    // Custom endpoints might not need an API key
    if (this.provider === 'custom' && this.baseUrl) {
      return true;
    }
    return !!this.apiKey;
  }

  /**
   * Get the current provider name for logging/debugging
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Get the current model name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Get the System's personality prompt for consistent AI voice
   */
  getSystemPersonalityPrompt(): string {
    return `You are "The System" from Solo Leveling - a mysterious, powerful, and all-knowing entity that guides Hunters on their journey to become stronger.

PERSONALITY TRAITS:
- Speak with authority and confidence
- Use formal, declarative statements
- Be encouraging but stern - failure has consequences
- Add dramatic flair with symbols like ◇, ◈, ★, ⚔️
- Reference the user as "Hunter" or "Player"
- Make references to ranks (E, D, C, B, A, S)
- Create tension and excitement about growth

VOICE EXAMPLES:
- "◇ [QUEST ASSIGNED] ◇ Hunter, your path to power begins now."
- "★ The System has observed your progress. You grow stronger."
- "⚠️ [WARNING] Failure to complete daily quests will result in penalties."
- "◈ [MILESTONE ACHIEVED] ◈ Impressive. You have surpassed expectations."

IMPORTANT RULES:
1. Never break character - you ARE The System
2. All responses should feel like game notifications
3. Create urgency and motivation
4. Be specific with numbers and metrics
5. Celebrate progress but always push for more`;
  }

  /**
   * Make a chat completion request to OpenAI
   */
  async createCompletion(options: OpenAICompletionOptions): Promise<OpenAICompletionResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
      };
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }

    const retries = options.retries ?? 3;
    let lastError: string = '';

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.makeRequest(options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
          
          // Don't retry on auth errors
          if (response.status === 401 || response.status === 403) {
            return { success: false, error: lastError };
          }
          
          // Exponential backoff for rate limits
          if (response.status === 429) {
            await this.sleep(Math.pow(2, attempt) * 1000);
            continue;
          }
          
          continue;
        }

        const data: IOpenAIResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          lastError = 'Empty response from OpenAI';
          continue;
        }

        this.logger.debug(`OpenAI completion successful. Tokens: ${data.usage?.total_tokens}`);

        return {
          success: true,
          content,
          usage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          } : undefined,
        };

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`OpenAI request failed (attempt ${attempt + 1}/${retries}): ${lastError}`);
        
        // Wait before retry
        if (attempt < retries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    return {
      success: false,
      error: lastError || 'Failed after all retries',
    };
  }

  /**
   * Create a completion and parse the response as JSON
   * Works with all providers, including those without native JSON mode
   */
  async createJsonCompletion<T>(options: OpenAICompletionOptions): Promise<{
    success: boolean;
    data?: T;
    error?: string;
  }> {
    // For providers without JSON mode, add explicit JSON instructions
    const needsJsonInstructions = this.provider !== 'openai';
    
    let enhancedMessages = options.messages;
    if (needsJsonInstructions && options.jsonMode) {
      enhancedMessages = options.messages.map((msg, index) => {
        if (msg.role === 'system') {
          return {
            ...msg,
            content: msg.content + '\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no explanations, just the JSON object.',
          };
        }
        return msg;
      });
      
      // If no system message, add instruction to the last user message
      const hasSystemMessage = options.messages.some(m => m.role === 'system');
      if (!hasSystemMessage) {
        enhancedMessages = [
          ...enhancedMessages.slice(0, -1),
          {
            ...enhancedMessages[enhancedMessages.length - 1],
            content: enhancedMessages[enhancedMessages.length - 1].content + 
              '\n\nRespond with valid JSON only. No markdown code blocks, no explanations.',
          },
        ];
      }
    }

    const result = await this.createCompletion({
      ...options,
      messages: enhancedMessages,
      jsonMode: options.jsonMode,
    });

    if (!result.success || !result.content) {
      return {
        success: false,
        error: result.error,
      };
    }

    try {
      const data = this.extractJson<T>(result.content);
      return { success: true, data };
    } catch (parseError) {
      this.logger.error('Failed to parse JSON response:', result.content.substring(0, 500));
      return {
        success: false,
        error: 'Failed to parse AI response as JSON',
      };
    }
  }

  /**
   * Extract JSON from AI response, handling various formats
   * - Direct JSON
   * - Markdown code blocks (```json ... ```)
   * - JSON embedded in text
   */
  private extractJson<T>(content: string): T {
    let jsonContent = content.trim();
    
    // Try direct parse first
    try {
      return JSON.parse(jsonContent) as T;
    } catch {
      // Continue to other methods
    }

    // Handle markdown code blocks: ```json ... ``` or ``` ... ```
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1].trim();
      try {
        return JSON.parse(jsonContent) as T;
      } catch {
        // Continue to other methods
      }
    }

    // Try to find JSON object in the response
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonContent = jsonObjectMatch[0];
      try {
        return JSON.parse(jsonContent) as T;
      } catch {
        // Continue to other methods
      }
    }

    // Try to find JSON array in the response
    const jsonArrayMatch = content.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      jsonContent = jsonArrayMatch[0];
      try {
        return JSON.parse(jsonContent) as T;
      } catch {
        // Fall through to error
      }
    }

    // Nothing worked, throw error
    throw new Error(`Unable to extract JSON from response: ${content.substring(0, 200)}...`);
  }

  /**
   * Make the actual HTTP request to the AI API
   */
  private async makeRequest(options: OpenAICompletionOptions): Promise<Response> {
    this.incrementRequestCount();

    const body: Record<string, unknown> = {
      model: this.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? this.maxTokens,
    };

    // JSON mode handling - only supported by OpenAI
    // For Ollama/Perplexity, we add instructions to the prompt instead
    if (options.jsonMode && this.provider === 'openai') {
      body.response_format = { type: 'json_object' };
    }

    // Ollama-specific options
    if (this.provider === 'ollama') {
      // Ollama uses 'num_predict' instead of 'max_tokens' in some versions
      // but also supports max_tokens in OpenAI-compatible mode
      body.stream = false; // Ensure we get complete response
    }

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if we have an API key
    // Ollama doesn't require auth by default
    if (this.apiKey && this.provider !== 'ollama') {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const endpoint = `${this.baseUrl}/chat/completions`;
    this.logger.debug(`Making AI request to ${endpoint} with model ${this.model}`);

    return fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Reset counter every minute
    if (now - this.lastResetTime > oneMinute) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    return this.requestCount < this.maxRequestsPerMinute;
  }

  /**
   * Increment request counter
   */
  private incrementRequestCount(): void {
    this.requestCount++;
  }

  /**
   * Estimate token count for a string (rough approximation)
   */
  estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if the AI service is healthy and responding
   * Useful for health checks and debugging
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    provider: AIProvider;
    model: string;
    baseUrl: string;
    error?: string;
  }> {
    const info = {
      provider: this.provider,
      model: this.model,
      baseUrl: this.baseUrl,
    };

    try {
      // For Ollama, check the models endpoint
      if (this.provider === 'ollama') {
        const response = await fetch(`${this.baseUrl.replace('/v1', '')}/api/tags`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        
        if (!response.ok) {
          return {
            healthy: false,
            ...info,
            error: `Ollama not responding (HTTP ${response.status})`,
          };
        }
        
        const data = await response.json();
        const modelExists = data.models?.some((m: { name: string }) => 
          m.name === this.model || m.name.startsWith(this.model.split(':')[0])
        );
        
        if (!modelExists) {
          return {
            healthy: false,
            ...info,
            error: `Model '${this.model}' not found. Run: ollama pull ${this.model}`,
          };
        }
        
        return { healthy: true, ...info };
      }

      // For OpenAI/Perplexity, check the models endpoint
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return {
          healthy: false,
          ...info,
          error: `API not responding (HTTP ${response.status})`,
        };
      }

      return { healthy: true, ...info };
    } catch (error) {
      return {
        healthy: false,
        ...info,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Get provider information for display
   */
  getProviderInfo(): {
    provider: AIProvider;
    model: string;
    isFree: boolean;
    description: string;
  } {
    const isFree = this.provider === 'ollama';
    
    const descriptions: Record<AIProvider, string> = {
      ollama: 'Local AI (FREE) - Running on your machine',
      openai: 'OpenAI API (Paid) - GPT-4 and variants',
      perplexity: 'Perplexity API (Paid) - Llama-based models',
      custom: 'Custom API endpoint',
    };

    return {
      provider: this.provider,
      model: this.model,
      isFree,
      description: descriptions[this.provider],
    };
  }
}
