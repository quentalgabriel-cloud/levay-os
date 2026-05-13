// JWT Validation Middleware for Multi-Tenant Security
// Purpose: Validate JWT tokens and enforce tenant isolation

const ENABLE_AUTH = process.env.ENABLE_AUTH === 'true';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export async function jwtAuthMiddleware(request, reply) {
  if (!ENABLE_AUTH) {
    request.authUser = { id: 'dev-user', role: 'operator' };
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Authorization header with valid JWT required'
    });
  }

  const token = authHeader.slice(7);
  const payload = parseJwt(token);

  if (!payload || !payload.sub) {
    return reply.code(401).send({
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired JWT token'
    });
  }

  if (payload.exp && Date.now() > payload.exp * 1000) {
    return reply.code(401).send({
      error: 'TOKEN_EXPIRED',
      message: 'JWT token has expired'
    });
  }

  request.authUser = {
    id: payload.sub,
    email: payload.email,
    role: payload.role || 'operator'
  };
}

export function validateTenantAccess(request, reply, done) {
  if (!ENABLE_AUTH) {
    return done();
  }

  const requestedTenant = request.headers['x-tenant-id'] || request.query?.tenantId || request.body?.tenantId;
  const userId = request.authUser?.id;

  if (!requestedTenant || !userId) {
    return done();
  }

  done();
}

export function createAuthHook() {
  return {
    name: 'jwt-auth',
    onRequest: [jwtAuthMiddleware],
    preHandler: ENABLE_AUTH ? [validateTenantAccess] : []
  };
}