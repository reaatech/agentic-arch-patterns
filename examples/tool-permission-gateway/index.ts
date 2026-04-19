/**
 * Tool Permission Gateway Pattern Example
 * 
 * Demonstrates capability-based access control for tools.
 */

interface Permission {
  tool: string;
  allowed: boolean;
  reason?: string;
}

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

interface PermissionContext {
  userId: string;
  roles: string[];
  capabilities: string[];
}

class ToolPermissionGateway {
  private toolPermissions: Map<string, (ctx: PermissionContext) => Permission> = new Map();

  registerTool(name: string, checker: (ctx: PermissionContext) => Permission): void {
    this.toolPermissions.set(name, checker);
  }

  async authorize(toolCall: ToolCall, context: PermissionContext): Promise<Permission> {
    const checker = this.toolPermissions.get(toolCall.name);
    if (!checker) {
      return { tool: toolCall.name, allowed: false, reason: 'Tool not registered' };
    }
    return checker(context);
  }
}

/* v8 ignore next 48 */
// Example tool permission checkers
const gateway = new ToolPermissionGateway();

gateway.registerTool('execute_sql', (ctx) => {
  if (ctx.roles.includes('admin')) {
    return { tool: 'execute_sql', allowed: true };
  }
  return { tool: 'execute_sql', allowed: false, reason: 'Requires admin role' };
});

gateway.registerTool('read_data', (ctx) => {
  if (ctx.capabilities.includes('data_reader')) {
    return { tool: 'read_data', allowed: true };
  }
  return { tool: 'read_data', allowed: false, reason: 'Missing data_reader capability' };
});

gateway.registerTool('send_email', (ctx) => {
  if (ctx.capabilities.includes('email_sender')) {
    return { tool: 'send_email', allowed: true };
  }
  return { tool: 'send_email', allowed: false, reason: 'Missing email_sender capability' };
});

async function main() {
  const adminContext: PermissionContext = {
    userId: 'user-1',
    roles: ['admin', 'user'],
    capabilities: ['data_reader', 'email_sender']
  };

  const userContext: PermissionContext = {
    userId: 'user-2',
    roles: ['user'],
    capabilities: ['data_reader']
  };

  const testCases = [
    { tool: { name: 'execute_sql', arguments: {} }, context: adminContext },
    { tool: { name: 'execute_sql', arguments: {} }, context: userContext },
    { tool: { name: 'read_data', arguments: {} }, context: userContext },
    { tool: { name: 'send_email', arguments: {} }, context: userContext }
  ];

  for (const { tool, context } of testCases) {
    const permission = await gateway.authorize(tool, context);
    console.log(`Tool: ${tool.name}, User: ${context.userId}, Allowed: ${permission.allowed}${permission.reason ? ' (' + permission.reason + ')' : ''}`);
  }
}

export { ToolPermissionGateway, ToolCall, Permission, PermissionContext };
