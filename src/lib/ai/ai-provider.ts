import { headers } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIFile {
  data: string; // base64 string
  mimeType: string;
}

export interface AIProvider {
  generateText(prompt: string, file?: AIFile): Promise<string>;
  generateJSON<T>(prompt: string, file?: AIFile): Promise<T>;
}

// 1. Google Gemini Provider
class GeminiProvider implements AIProvider {
  constructor(private apiKey: string) {}

  async generateText(prompt: string, file?: AIFile): Promise<string> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    let contentInput: any = prompt;
    if (file) {
      contentInput = [
        {
          inlineData: {
            data: file.data,
            mimeType: file.mimeType,
          },
        },
        prompt,
      ];
    }
    
    const result = await model.generateContent(contentInput);
    return result.response.text();
  }

  async generateJSON<T>(prompt: string, file?: AIFile): Promise<T> {
    const text = await this.generateText(prompt, file);
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonString) as T;
  }
}

// 2. OpenAI ChatGPT Provider
class OpenAIProvider implements AIProvider {
  constructor(private apiKey: string, private model: string) {}

  async generateText(prompt: string, file?: AIFile): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateJSON<T>(prompt: string, file?: AIFile): Promise<T> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text) as T;
  }
}

// 3. Anthropic Claude Provider
class ClaudeProvider implements AIProvider {
  constructor(private apiKey: string, private model: string) {}

  async generateText(prompt: string, file?: AIFile): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async generateJSON<T>(prompt: string, file?: AIFile): Promise<T> {
    const text = await this.generateText(prompt, file);
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonString) as T;
  }
}

// 4. Groq Provider
class GroqProvider implements AIProvider {
  constructor(private apiKey: string, private model: string) {}

  async generateText(prompt: string, file?: AIFile): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateJSON<T>(prompt: string, file?: AIFile): Promise<T> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text) as T;
  }
}

// Factory Function (Reads headers asynchronously, falling back to process.env)
export async function getAIProvider(): Promise<AIProvider> {
  let provider = '';
  let apiKey = '';

  try {
    const headersList = await headers();
    provider = headersList.get('x-ai-provider') || '';
    apiKey = headersList.get('x-ai-api-key') || '';
  } catch {
    // headers() throws if called outside of request scope
  }

  // Fall back to environment configuration if header values are empty
  provider = (provider || process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

  if (!apiKey) {
    if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY || '';
    } else if (provider === 'anthropic' || provider === 'claude') {
      apiKey = process.env.ANTHROPIC_API_KEY || '';
    } else if (provider === 'groq') {
      apiKey = process.env.GROQ_API_KEY || '';
    } else {
      apiKey = process.env.GEMINI_API_KEY || '';
    }
  }

  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();

  if (!apiKey) {
    throw new Error(`API Key is not configured for provider: ${provider}`);
  }

  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey, process.env.OPENAI_MODEL || 'gpt-4o-mini');
    case 'anthropic':
    case 'claude':
      return new ClaudeProvider(apiKey, process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest');
    case 'groq':
      return new GroqProvider(apiKey, process.env.GROQ_MODEL || 'llama-3-3-70b-versatile');
    case 'gemini':
    default:
      return new GeminiProvider(apiKey);
  }
}
