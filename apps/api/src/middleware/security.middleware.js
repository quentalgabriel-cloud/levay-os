// Security Headers Middleware
// Adiciona headers de segurança HTTP para proteção contra ataques comuns

export function securityHeaders(request, reply) {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    reply.header('Cross-Origin-Opener-Policy', 'same-origin');
    reply.header('Cross-Origin-Resource-Policy', 'same-origin');
    reply.header('Cross-Origin-Embedder-Policy', 'require-corp');
  }
}

export function rateLimitMiddleware(request, reply) {
  const now = Date.now();
  const windowMs = process.env.RATE_WINDOW_MS || 60000;
  const maxRequests = process.env.RATE_MAX_REQUESTS || 100;

  const key = request.headers['x-forwarded-for'] || request.ip || 'unknown';
  const bucket = rateLimitBucket.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count++;

  if (bucket.count > maxRequests) {
    return reply.code(429).send({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000)
    });
  }

  rateLimitBucket.set(key, bucket);

  reply.header('X-RateLimit-Limit', maxRequests);
  reply.header('X-RateLimit-Remaining', Math.max(0, maxRequests - bucket.count));
  reply.header('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));
}

const rateLimitBucket = new Map();

export function createSecurityHooks() {
  return {
    name: 'security-headers',
    onRequest: [securityHeaders],
    preHandler: process.env.ENABLE_RATE_LIMIT === 'true' ? [rateLimitMiddleware] : []
  };
}