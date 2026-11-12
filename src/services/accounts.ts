const ACCOUNTS_KEY = 'scioptimal-accounts';
const DATA_PREFIX = 'scioptimal-user-data:';

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SavedUserData {
  userProfile: unknown;
  workoutHistory: unknown[];
  nutritionLog: unknown[];
  progressHistory: unknown[];
  sleepLog: unknown[];
  healthData: unknown;
  isHealthDataConnected: boolean;
  lastHealthSync: string | null;
  optimizationInsights: unknown[];
  adaptivePlan: unknown;
  aiAnalysis: unknown;
  todaysWorkout: unknown;
  goal?: unknown;
  lockedPlan?: unknown;
  program?: unknown;
  customFoods?: unknown[];
  activeSession?: unknown;
  checkIns?: unknown[];
}

export function emptySavedUserData(): SavedUserData {
  return {
    userProfile: null,
    workoutHistory: [],
    nutritionLog: [],
    progressHistory: [],
    sleepLog: [],
    healthData: null,
    isHealthDataConnected: false,
    lastHealthSync: null,
    optimizationInsights: [],
    adaptivePlan: null,
    aiAnalysis: null,
    todaysWorkout: null,
    goal: null,
    lockedPlan: null,
    program: null,
    customFoods: [],
    activeSession: null,
    checkIns: [],
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function registerAccount(name: string, email: string, password: string): Promise<StoredAccount> {
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName) throw new Error('Name is required');
  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    throw new Error('Enter a valid email address');
  }
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const accounts = readAccounts();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('An account with that email already exists');
  }

  const account: StoredAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  accounts.push(account);
  writeAccounts(accounts);
  saveUserData(account.id, emptySavedUserData());
  return account;
}

export async function authenticateAccount(email: string, password: string): Promise<StoredAccount> {
  const normalizedEmail = normalizeEmail(email);
  const account = readAccounts().find((item) => item.email === normalizedEmail);
  if (!account) throw new Error('No account found for that email');

  const passwordHash = await hashPassword(password);
  if (passwordHash !== account.passwordHash) throw new Error('Incorrect password');
  return account;
}

export function saveUserData(userId: string, data: SavedUserData) {
  localStorage.setItem(`${DATA_PREFIX}${userId}`, JSON.stringify(data));
}

export function localDataForEmail(email: string): SavedUserData | null {
  const account = readAccounts().find((item) => item.email === normalizeEmail(email));
  if (!account) return null;
  const data = loadUserData(account.id);
  if (!data.userProfile && !data.goal) return null;
  return data;
}

export function loadUserData(userId: string): SavedUserData {
  try {
    const raw = localStorage.getItem(`${DATA_PREFIX}${userId}`);
    if (!raw) return emptySavedUserData();
    return { ...emptySavedUserData(), ...JSON.parse(raw) };
  } catch {
    return emptySavedUserData();
  }
}
