/**
 * PII Redactor Pattern Example
 *
 * Demonstrates automatic sensitive data masking.
 * Uses libphonenumber-js for reliable phone number detection.
 */

import { findPhoneNumbersInText } from 'libphonenumber-js';

interface RedactionRule {
  name: string;
  pattern: RegExp;
  replacement: string;
}

interface RedactionResult {
  original: string;
  redacted: string;
  redactions: Array<{ type: string; count: number }>;
}

class PIIRedactor {
  private rules: RedactionRule[] = [
    { name: 'email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_REDACTED]' },
    { name: 'ssn', pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, replacement: '[SSN_REDACTED]' },
    { name: 'credit-card', pattern: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g, replacement: '[CARD_REDACTED]' },
    { name: 'ip-address', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP_REDACTED]' },
  ];

  redact(text: string): RedactionResult {
    let redacted = text;
    const redactions: Array<{ type: string; count: number }> = [];

    const phoneNumbers = findPhoneNumbersInText(text, 'US');
    if (phoneNumbers.length > 0) {
      redactions.push({ type: 'phone', count: phoneNumbers.length });
      for (const { startsAt, endsAt } of phoneNumbers) {
        const phone = text.slice(startsAt, endsAt);
        redacted = redacted.replace(phone, '[PHONE_REDACTED]');
      }
    }

    for (const rule of this.rules) {
      const matches = text.match(rule.pattern);
      if (matches && matches.length > 0) {
        redactions.push({ type: rule.name, count: matches.length });
        redacted = redacted.replace(rule.pattern, rule.replacement);
      }
    }

    return {
      original: text,
      redacted,
      redactions,
    };
  }
}

/* v8 ignore next 19 */
async function main() {
  const redactor = new PIIRedactor();

  const testTexts = [
    'Hello, my email is john.doe@example.com and my phone is (415) 555-2676.',
    'My SSN is 123-45-6789 and my card is 4111-1111-1111-1111.',
    'The server IP is 192.168.1.100.',
    'This is a clean text with no PII.',
  ];

  for (const text of testTexts) {
    const result = redactor.redact(text);
    console.log(`\nOriginal: "${text}"`);
    console.log(`Redacted: "${result.redacted}"`);
    if (result.redactions.length > 0) {
      console.log('Redactions:', result.redactions);
    }
  }
}

export { PIIRedactor, RedactionRule, RedactionResult };
