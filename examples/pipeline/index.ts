/**
 * Pipeline Pattern Example
 * 
 * Demonstrates sequential processing through specialized stages.
 */

interface PipelineContext {
  data: unknown;
  metadata: Record<string, unknown>;
  errors: Error[];
}

interface PipelineStage {
  name: string;
  process(context: PipelineContext): Promise<PipelineContext>;
}

class Pipeline {
  private stages: PipelineStage[] = [];

  addStage(stage: PipelineStage): void {
    this.stages.push(stage);
  }

  async execute(initialData: unknown): Promise<PipelineContext> {
    let context: PipelineContext = {
      data: initialData,
      metadata: {},
      errors: []
    };

    for (const stage of this.stages) {
      console.log(`Executing stage: ${stage.name}`);
      try {
        context = await stage.process(context);
      } catch (error) {
        context.errors.push(error as Error);
        break;
      }
    }

    return context;
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

// Example stages
const parseStage: PipelineStage = {
  name: 'parse',
  process: async (context) => ({
    ...context,
    data: { ...asObject(context.data), parsed: true },
    metadata: { ...context.metadata, parseTime: Date.now() }
  })
};

const validateStage: PipelineStage = {
  name: 'validate',
  process: async (context) => {
    if (!context.data) {
      throw new Error('No data to validate');
    }
    return {
      ...context,
      metadata: { ...context.metadata, valid: true }
    };
  }
};

const transformStage: PipelineStage = {
  name: 'transform',
  process: async (context) => ({
    ...context,
    data: { ...asObject(context.data), transformed: true },
    metadata: { ...context.metadata, transformTime: Date.now() }
  })
};

/* v8 ignore next 9 */
async function main() {
  const pipeline = new Pipeline();
  pipeline.addStage(parseStage);
  pipeline.addStage(validateStage);
  pipeline.addStage(transformStage);

  const result = await pipeline.execute({ input: 'test data' });
  console.log('Pipeline result:', result);
}

export { Pipeline };
export type { PipelineStage, PipelineContext };
