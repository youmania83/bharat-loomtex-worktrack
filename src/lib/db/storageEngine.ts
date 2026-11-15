import { put, get } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export interface StoredState {
  profiles: any[];
  employees: any[];
  projects: any[];
  tasks: any[];
  comments: any[];
  timeLogs: any[];
  activityLogs: any[];
  notifications: any[];
  workSessions: any[];
  version: number;
  updatedAt: number;
}

const BLOB_FILENAME = 'bharat_loomtex_data.json';
const LOCAL_DATA_DIR = path.join(process.cwd(), '.data');
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, BLOB_FILENAME);

let lastSyncTime = 0;
let cachedState: StoredState | null = null;
const CACHE_TTL_MS = 500; // 500ms cache for rapid sub-requests within a page load

/**
 * Loads the shared state from Vercel Blob (or local file fallback).
 */
export async function loadPersistentState(): Promise<StoredState | null> {
  const now = Date.now();
  if (cachedState && now - lastSyncTime < CACHE_TTL_MS) {
    return cachedState;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // 1. Production / Vercel with Blob Token
  if (token) {
    try {
      const res = await get(BLOB_FILENAME, { access: 'private', token, useCache: false });
      if (res && res.statusCode === 200 && res.stream) {
        const text = await new Response(res.stream).text();
        const parsed = JSON.parse(text) as StoredState;
        cachedState = parsed;
        lastSyncTime = now;
        return parsed;
      }
    } catch (err: any) {
      // 404 is expected if blob doesn't exist yet
      if (err?.name !== 'BlobNotFoundError' && !err?.message?.includes('could not find')) {
        console.warn('[StorageEngine] Error reading from Vercel Blob:', err);
      }
    }
  }

  // 2. Local File Fallback (Development & Tests)
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content) as StoredState;
      cachedState = parsed;
      lastSyncTime = now;
      return parsed;
    }
  } catch (err) {
    console.warn('[StorageEngine] Error reading local data file:', err);
  }

  return null;
}

/**
 * Saves the shared state to Vercel Blob (and local file fallback).
 */
export async function savePersistentState(state: StoredState): Promise<void> {
  state.updatedAt = Date.now();
  state.version = (state.version || 0) + 1;
  cachedState = state;
  lastSyncTime = Date.now();

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const jsonString = JSON.stringify(state, null, 2);

  // 1. Save to Vercel Blob if available
  if (token) {
    try {
      await put(BLOB_FILENAME, jsonString, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
    } catch (err) {
      console.error('[StorageEngine] Failed to save state to Vercel Blob:', err);
    }
  }

  // 2. Also write to local file for fast offline restart
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, jsonString, 'utf-8');
  } catch (err) {
    // Non-fatal if filesystem is read-only in some serverless environments
  }
}
