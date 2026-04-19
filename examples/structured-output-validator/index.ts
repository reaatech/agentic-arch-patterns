/**
 * Structured Output Validator Pattern Example
 * 
 * Demonstrates schema enforcement on LLM responses.
 */

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  validation?: (value: unknown) => boolean;
}

interface ValidationErrors {
  field: string;
  error: string;
}

class StructuredOutputValidator {
  constructor(private schema: SchemaField[]) {}

  validate(data: Record<string, unknown>): { valid: boolean; errors: ValidationErrors[] } {
    const errors: ValidationErrors[] = [];

    for (const field of this.schema) {
      const value = data[field.name];

      // Check required fields
      if (field.required && (value === undefined || value === null)) {
        errors.push({ field: field.name, error: 'Required field is missing' });
        continue;
      }

      // Skip validation if field is optional and not present
      if (value === undefined || value === null) continue;

      // Type checking
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== field.type) {
        errors.push({ field: field.name, error: `Expected ${field.type}, got ${actualType}` });
        continue;
      }

      // Custom validation
      if (field.validation && !field.validation(value)) {
        errors.push({ field: field.name, error: 'Custom validation failed' });
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// Example schema
const responseSchema: SchemaField[] = [
  { name: 'answer', type: 'string', required: true },
  { name: 'confidence', type: 'number', required: true, validation: (v) => typeof v === 'number' && v >= 0 && v <= 1 },
  { name: 'sources', type: 'array', required: false },
  { name: 'metadata', type: 'object', required: false }
];

/* v8 ignore next 22 */
async function main() {
  const validator = new StructuredOutputValidator(responseSchema);

  // Valid response
  const validResponse = {
    answer: 'TypeScript is a typed superset of JavaScript',
    confidence: 0.95,
    sources: ['source1', 'source2']
  };

  const result1 = validator.validate(validResponse);
  console.log('Valid response:', result1);

  // Invalid response
  const invalidResponse = {
    answer: 'TypeScript is great',
    confidence: 1.5 // Invalid: > 1
  };

  const result2 = validator.validate(invalidResponse);
  console.log('Invalid response:', result2);
}

export { StructuredOutputValidator, SchemaField, ValidationErrors };
