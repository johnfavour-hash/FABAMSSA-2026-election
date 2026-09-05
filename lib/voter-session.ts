import { createHmac, timingSafeEqual } from 'node:crypto';

type SessionPayload = {
  voterId: string;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.VOTER_SESSION_SECRET;
  if (!secret) throw new Error('Voter session environment is not configured.');
  return secret;
}

function encode(value: string) {
  return Buffer.from(value).toString('base64url');
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

export function createVoterSession(voterId: string) {
  const payload: SessionPayload = {
    voterId,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function readVoterSession(token: string) {
  try {
    const [encodedPayload, encodedSignature] = token.split('.');
    if (!encodedPayload || !encodedSignature) return null;

    const expectedSignature = Buffer.from(sign(encodedPayload));
    const actualSignature = Buffer.from(encodedSignature);
    if (expectedSignature.length !== actualSignature.length || !timingSafeEqual(expectedSignature, actualSignature)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.voterId || payload.expiresAt <= Date.now()) return null;
    return payload.voterId;
  } catch {
    return null;
  }
}