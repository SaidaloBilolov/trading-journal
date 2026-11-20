import { AppUser } from '../types/journal';

const USERS_STORAGE_KEY = 'trading_journal_users_v1';
const ACTIVE_USER_STORAGE_KEY = 'trading_journal_active_user_v1';

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'said',
    username: 'said',
    name: "Saida'lo (Said)",
    password: 'said2006Bb#',
    role: 'admin',
    avatar: 'SB',
    default_account_id: 'acc-tradify',
    created_at: new Date().toISOString(),
  },
  {
    id: 'shaxzod',
    username: 'shaxzod',
    name: 'Shaxzod',
    password: 'shaxzod2026',
    role: 'trader',
    avatar: 'SH',
    default_account_id: 'acc-shaxzod-prop',
    created_at: new Date().toISOString(),
  },
];

export const getStoredUsers = (): AppUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed: AppUser[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }

    // Saida'lo uchun maxfiy parolni yangilash
    let updated = false;
    parsed.forEach((u) => {
      if (u.username === 'said' && u.password !== 'said2006Bb#') {
        u.password = 'said2006Bb#';
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch (e) {
    console.error('Foydalanuvchilarni o‘qishda xatolik:', e);
    return DEFAULT_USERS;
  }
};

export const saveUsers = (users: AppUser[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Foydalanuvchilarni saqlashda xatolik:', e);
  }
};

export const getActiveUser = (): AppUser | null => {
  try {
    const raw = sessionStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AppUser;
    return user;
  } catch {
    return null;
  }
};

export const setActiveUserSession = (user: AppUser | null): void => {
  try {
    if (user) {
      sessionStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Sessiyani saqlashda xatolik:', e);
  }
};

export const loginUser = (
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: AppUser; message?: string } => {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, message: 'Iltimos, loginni kiriting' };
  }

  const users = getStoredUsers();
  const matchedUser = users.find(
    (u) => u.username.toLowerCase() === cleanUsername || u.id.toLowerCase() === cleanUsername
  );

  if (!matchedUser) {
    return { success: false, message: `"${usernameInput}" nomli foydalanuvchi topilmadi` };
  }

  // Faqat shu foydalanuvchining o'z shaxsiy maxfiy paroli tekshiriladi.
  // Saida'lo (Said) uchun faqat: 'said2006Bb#'
  // Shaxzod uchun: 'shaxzod2026'
  let isValid = false;
  if (cleanUsername === 'said') {
    isValid = cleanPassword === 'said2006Bb#';
  } else if (cleanUsername === 'shaxzod') {
    isValid = cleanPassword === 'shaxzod2026' || cleanPassword === matchedUser.password;
  } else {
    isValid = cleanPassword === matchedUser.password;
  }

  if (!isValid) {
    return { success: false, message: 'Parol noto‘g‘ri kiritildi' };
  }

  setActiveUserSession(matchedUser);
  return { success: true, user: matchedUser };
};

export const logoutUser = (): void => {
  setActiveUserSession(null);
};

export const registerNewUser = (
  name: string,
  username: string,
  password: string
): { success: boolean; user?: AppUser; message?: string } => {
  const cleanName = name.trim();
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanName || !cleanUsername || !cleanPassword) {
    return { success: false, message: 'Barcha maydonlarni to‘ldiring' };
  }

  const users = getStoredUsers();
  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return { success: false, message: 'Bunday loginli foydalanuvchi allaqachon mavjud' };
  }

  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');

  const newUser: AppUser = {
    id: cleanUsername,
    username: cleanUsername,
    name: cleanName,
    password: cleanPassword,
    role: 'trader',
    avatar: initials || 'TR',
    default_account_id: `acc-${cleanUsername}-prop`,
    created_at: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  setActiveUserSession(newUser);
  return { success: true, user: newUser };
};

export const updatePassword = (userId: string, newPass: string): boolean => {
  if (!newPass || newPass.trim().length < 3) return false;
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId || u.username === userId);
  if (idx === -1) return false;

  users[idx].password = newPass.trim();
  saveUsers(users);

  const active = getActiveUser();
  if (active && (active.id === userId || active.username === userId)) {
    active.password = newPass.trim();
    setActiveUserSession(active);
  }
  return true;
};
