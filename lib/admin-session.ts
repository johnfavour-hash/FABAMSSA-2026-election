import { createHmac, timingSafeEqual } from 'node:crypto';

type AdminSessionPayload = {
  adminId: string;
  email: string;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.VOTER_SESSION_SECRET;
  if (!secret) throw new Error('Admin session environment is not configured.');
  return secret;
}

function encode(value: string) {
  return Buffer.from(value).toString('base64url');
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(`admin:${value}`).digest('base64url');
}

export function createAdminSession(adminId: string, email: string) {
  const payload: AdminSessionPayload = {
    adminId,
    email,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function readAdminSession(token: string) {
  try {
    const [encodedPayload, encodedSignature] = token.split('.');
    if (!encodedPayload || !encodedSignature) return null;
    const expectedSignature = Buffer.from(sign(encodedPayload));
    const actualSignature = Buffer.from(encodedSignature);
    if (expectedSignature.length !== actualSignature.length || !timingSafeEqual(expectedSignature, actualSignature)) return null;
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AdminSessionPayload;
    return payload.adminId && payload.email && payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}