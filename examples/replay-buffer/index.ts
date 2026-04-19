/**
 * Replay Buffer Pattern Example
 * 
 * Demonstrates conversation history preservation with context window management.
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ReplayBufferOptions {
  maxMessages: number;
  maxTokens?: number;
}

class ReplayBuffer {
  private messages: Message[] = [];

  constructor(private options: ReplayBufferOptions) {}

  addMessage(message: Message): void {
    this.messages.push(message);
    this.trim();
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  getContext(): string {
    return this.messages.map(m => `${m.role}: ${m.content}`).join('\n');
  }

  private trim(): void {
    // Remove oldest messages if over limit
    while (this.messages.length > this.options.maxMessages) {
      this.messages.shift();
    }
  }

  clear(): void {
    this.messages = [];
  }
}

/* v8 ignore next 18 */
// Example usage
async function main() {
  const buffer = new ReplayBuffer({ maxMessages: 5 });

  // Add conversation turns
  buffer.addMessage({ role: 'system', content: 'You are a helpful assistant.', timestamp: Date.now() });
  buffer.addMessage({ role: 'user', content: 'Hello!', timestamp: Date.now() });
  buffer.addMessage({ role: 'assistant', content: 'Hi there! How can I help?', timestamp: Date.now() });
  buffer.addMessage({ role: 'user', content: 'What is TypeScript?', timestamp: Date.now() });
  buffer.addMessage({ role: 'assistant', content: 'TypeScript is a typed superset of JavaScript.', timestamp: Date.now() });

  // Add more than max to trigger trimming
  buffer.addMessage({ role: 'user', content: 'Tell me more', timestamp: Date.now() });

  console.log('Current context:');
  console.log(buffer.getContext());
  console.log(`\nMessage count: ${buffer.getMessages().length}`);
}

export { ReplayBuffer, Message, ReplayBufferOptions };
