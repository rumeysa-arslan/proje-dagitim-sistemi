import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'super_gizli_ve_guclu_bir_anahtar_123456';
const encodedKey = new TextEncoder().encode(secretKey);

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  tenantId: string; 
}

export async function signToken(payload: UserPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(encodedKey);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}