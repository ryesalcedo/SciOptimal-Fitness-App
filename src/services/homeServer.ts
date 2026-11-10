import { SavedUserData } from './accounts';

const TOKEN_KEY = 'scioptimal-home-token';

export interface HomeUser {
  id: string;
  name: string;
  email: string;
}

export interface HomeSession {
  token: string;
  user: HomeUser;
  data: Partial<SavedUserData>;
}

export function homeToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setHomeToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function detectHomeServer(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) return false;
    const body = await response.json();
    return body.service === 'scioptimal-home';
  } catch {
    return false;
  }
}

async function request(path: string, method: string, body?: unknown, auth = false) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && homeToken()) headers.Authorization = `Bearer ${homeToken()}`;
  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The home server could not do that');
  return data;
}

export function homeRegister(name: string, email: string, password: string): Promise<HomeSession> {
  return request('/api/auth/register', 'POST', { name, email, password });
}

export function homeLogin(email: string, password: string): Promise<HomeSession> {
  return request('/api/auth/login', 'POST', { email, password });
}

export function homeSave(data: SavedUserData): Promise<void> {
  return request('/api/data', 'PUT', { data }, true);
}

export async function homeLogout(): Promise<void> {
  const token = homeToken();
  setHomeToken(null);
  if (!token) return;
  try {
    await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  } catch {
    // The local session is already cleared.
  }
}

export async function askCoach(message: string, image: string): Promise<{ reply: string; model: boolean }> {
  const data = await request('/api/coach', 'POST', {
    message,
    image: image.startsWith('data:image/') ? image : '',
  }, true);
  return { reply: String(data.reply || ''), model: Boolean(data.model) };
}
