import { cookies } from 'next/headers';
import { db } from '../db';
import { Profile } from '../types';

export const AUTH_COOKIE_NAME = 'rison_auth_user_id';
export const DEFAULT_ADMIN_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Server-side helper to get the currently authenticated user profile.
 * Falls back to default admin for smooth initial load if no cookie is set.
 */
export async function getCurrentUser(): Promise<Profile> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_COOKIE_NAME)?.value || DEFAULT_ADMIN_ID;

  const profile = await db.getProfile(userId);
  if (profile) return profile;

  // Fallback to Admin profile
  const adminProfile = await db.getProfile(DEFAULT_ADMIN_ID);
  if (adminProfile) return adminProfile;

  // Static fallback if DB is empty
  return {
    id: DEFAULT_ADMIN_ID,
    email: 'admin@bharatloomtex.com',
    full_name: 'Suneet Kumar',
    role: 'admin',
    department: 'Executive Management',
    designation: 'Owner & Managing Director',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
