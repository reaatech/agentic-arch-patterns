/**
 * Saga Pattern Example
 * 
 * Demonstrates distributed transaction coordination with compensating actions.
 */

interface SagaStep<T> {
  name: string;
  execute: (context: T) => Promise<unknown>;
  compensate: (context: T, result: unknown) => Promise<void>;
}

class Saga<T> {
  private steps: SagaStep<T>[] = [];
  private executedSteps: Array<{ step: SagaStep<T>; result: unknown }> = [];

  addStep(step: SagaStep<T>): void {
    this.steps.push(step);
  }

  async execute(initialContext: T): Promise<T> {
    const context = structuredClone(initialContext);

    try {
      for (const step of this.steps) {
        console.log(`Executing step: ${step.name}`);
        const result = await step.execute(context);
        this.executedSteps.push({ step, result });
      }
      console.log('Saga completed successfully');
      return context;
    } catch (error) {
      console.log(`Saga failed at step, initiating compensation: ${error}`);
      await this.compensate(context);
      throw error;
    }
  }

  private async compensate(context: T): Promise<void> {
    // Compensate in reverse order
    for (const { step, result } of this.executedSteps.reverse()) {
      console.log(`Compensating step: ${step.name}`);
      try {
        await step.compensate(context, result);
      } catch (error) {
        console.error(`Compensation failed for ${step.name}: ${error}`);
      }
    }
  }
}

/* v8 ignore next 69 */
// Example: E-commerce order saga
interface OrderContext {
  orderId: string;
  inventoryReserved: boolean;
  paymentProcessed: boolean;
  orderShipped: boolean;
}

const orderSaga = new Saga<OrderContext>();

orderSaga.addStep({
  name: 'Reserve Inventory',
  execute: async (ctx) => {
    console.log('Reserving inventory for order:', ctx.orderId);
    ctx.inventoryReserved = true;
  },
  compensate: async (ctx) => {
    if (ctx.inventoryReserved) {
      console.log('Releasing inventory for order:', ctx.orderId);
      ctx.inventoryReserved = false;
    }
  }
});

orderSaga.addStep({
  name: 'Process Payment',
  execute: async (ctx) => {
    console.log('Processing payment for order:', ctx.orderId);
    ctx.paymentProcessed = true;
  },
  compensate: async (ctx) => {
    if (ctx.paymentProcessed) {
      console.log('Refunding payment for order:', ctx.orderId);
      ctx.paymentProcessed = false;
    }
  }
});

orderSaga.addStep({
  name: 'Ship Order',
  execute: async (ctx) => {
    console.log('Shipping order:', ctx.orderId);
    ctx.orderShipped = true;
  },
  compensate: async (ctx) => {
    if (ctx.orderShipped) {
      console.log('Canceling shipment for order:', ctx.orderId);
      ctx.orderShipped = false;
    }
  }
});

async function main() {
  const context: OrderContext = {
    orderId: 'order-123',
    inventoryReserved: false,
    paymentProcessed: false,
    orderShipped: false
  };

  try {
    const result = await orderSaga.execute(context);
    console.log('Order completed:', result);
  } catch (error) {
    console.log('Order failed:', error);
  }
}

export { Saga, SagaStep };
