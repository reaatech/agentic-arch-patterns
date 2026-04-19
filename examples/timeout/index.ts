/**
 * Timeout Pattern Example
 *
 * Demonstrates bounded waiting with timeout enforcement.
 */

class TimeoutError extends Error {
  constructor(operation: string, timeout: number) {
    super(`Operation '${operation}' timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

interface TimeoutOptions {
  timeout: number;
  operationName?: string;
}

async function withTimeout<T>(
  operation: () => Promise<T>,
  options: TimeoutOptions
): Promise<T> {
  const { timeout, operationName = 'anonymous' } = options;

  return Promise.race([
    operation(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(operationName, timeout)), timeout)
    )
  ]);
}

/* v8 ignore next 35 */
async function slowOperation(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return 'Completed';
}

async function fastOperation(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return 'Fast completed';
}

async function main() {
  console.log('Testing timeout pattern...\n');

  // This should succeed
  try {
    const result = await withTimeout(fastOperation, {
      timeout: 500,
      operationName: 'fastOperation'
    });
    console.log('✓ Fast operation:', result);
  } catch (error) {
    console.log('✗ Fast operation failed:', error);
  }

  // This should timeout
  try {
    const result = await withTimeout(slowOperation, {
      timeout: 500,
      operationName: 'slowOperation'
    });
    console.log('✓ Slow operation:', result);
  } catch (error) {
    console.log('✗ Slow operation:', error instanceof Error ? error.message : error);
  }
}

export { withTimeout, TimeoutOptions, TimeoutError };
