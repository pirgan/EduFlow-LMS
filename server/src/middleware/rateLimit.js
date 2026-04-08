import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// express-rate-limit v7+ requires the ipKeyGenerator helper for IPv6-safe IP fallback.
// We prefer the authenticated user's id so authenticated users share a single bucket
// regardless of IP; unauthenticated requests fall back to the IP-based key.
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: { message: 'Too many AI requests, please wait a minute.' },
});
