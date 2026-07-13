/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_BASE = (typeof window !== 'undefined' ? window.location.origin : '').replace(/\/$/, '');

export const db = {};

export function getAuthInstance() {
  return {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const payload = await res.json();
      message = payload?.message || message;
    } catch {
      // ignore JSON parse errors on non-JSON responses
    }
    throw new Error(message);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  return undefined as T;
}

function collectionUrl(collectionName: string) {
  return `${API_BASE}/api/collections/${encodeURIComponent(collectionName)}`;
}

/**
 * Simulates a secure Google Sign-In pop-up.
 * Prompts for email address with an elegant fallback for sandbox iFrame restrictions.
 */
export async function signInWithGoogle() {
  let email = 'google_user@crm.com';
  try {
    const input = window.prompt(
      'Simulated Google Auth Service\n\nPlease enter an email address to authenticate:',
      'google_user@crm.com',
    );
    if (input) {
      email = input.trim().toLowerCase();
    }
  } catch (e) {
    console.warn('Auth prompt blocked by sandboxed environment. Authenticating default profile.');
  }

  const namePart = email.split('@')[0];
  const displayName = namePart
    .split('.')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    email,
    displayName,
    uid: `mock-google-uid-${Math.random().toString(36).substring(2, 11)}`,
  };
}

/**
 * Simulates user logout from the session.
 */
export async function logOutFromFirebase() {
  return Promise.resolve();
}

/**
 * Lists all MongoDB-backed collections exposed by the API.
 */
export async function listMongoCollections(): Promise<string[]> {
  return request<string[]>(`${API_BASE}/api/collections`);
}

/**
 * Fetches all documents within a Mongo collection.
 */
export async function dbGetCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const data = await request<T[]>(collectionUrl(collectionName));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Mongo DB: Failed to fetch collection ${collectionName}:`, error);
    return [];
  }
}

/**
 * Saves or updates a document inside a Mongo collection.
 */
export async function dbSaveItem(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const payload = {
      ...data,
      id: data?.id ?? docId,
      ...(collectionName.includes('admin') || collectionName.includes('mapping') ? { email: data?.email ?? docId } : {}),
    };

    await request<void>(`${collectionUrl(collectionName)}/${encodeURIComponent(docId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error(`Mongo DB: Failed to save item ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Deletes a document from a Mongo collection.
 */
export async function dbDeleteItem(collectionName: string, docId: string): Promise<void> {
  try {
    await request<void>(`${collectionUrl(collectionName)}/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Mongo DB: Failed to delete item ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Bulk saves a collection of items into MongoDB.
 */
export async function dbSaveCollection<T extends { id?: string; email?: string }>(
  collectionName: string,
  items: T[],
): Promise<void> {
  try {
    await request<void>(`${collectionUrl(collectionName)}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  } catch (error) {
    console.error(`Mongo DB: Failed to bulk-save collection ${collectionName}:`, error);
    throw error;
  }
}
