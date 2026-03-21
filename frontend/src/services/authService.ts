import type { AuthResponse, User } from '../types';

const AUTH_KEY = 'coolmate_auth_v1';

interface MockAccount {
  email: string;
  password: string;
  user: User;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: 'user@gmail.com',
    password: '123456',
    user: {
      id: 'u_client_001',
      name: 'Nguyễn Ngọc Thịnh',
      email: 'user@gmail.com',
      phone: '0382253049',
      avatar: 'NT',
      gender: 'male',
    },
  },
  {
    email: 'admin@gmail.com',
    password: '123456',
    user: {
      id: 'u_admin_001',
      name: 'Admin Coolmate',
      email: 'admin@gmail.com',
      role: 'admin',
      avatar: 'AD',
    },
  },
];

const persist = (data: AuthResponse | null) => {
  if (data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

const ADMIN_AUTH_KEY = 'coolmate_admin_auth_v1';

const persistAdmin = (data: AuthResponse | null) => {
  if (data) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(data));
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
};

export const authService = {
  getSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!email || !password) {
      throw new Error('Vui lòng nhập email và mật khẩu');
    }

    const account = MOCK_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
    );

    if (!account) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const response: AuthResponse = {
      token: 'mock-token-' + Date.now(),
      user: account.user,
    };
    persist(response);
    return response;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!name || !email || !password) {
      throw new Error('Vui lòng nhập đầy đủ thông tin');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const existing = MOCK_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      throw new Error('Email đã được sử dụng');
    }

    const newUser: User = {
      id: 'u_' + Date.now(),
      name,
      email,
    };

    const response: AuthResponse = {
      token: 'mock-token-' + Date.now(),
      user: newUser,
    };
    persist(response);
    return response;
  },

  async forgot(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (!email) throw new Error('Vui lòng nhập email');
  },

  async reset(newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (!newPassword) throw new Error('Vui lòng nhập mật khẩu mới');
  },

  logout() {
    persist(null);
  },

  getAdminSession(): AuthResponse | null {
    try {
      const raw = sessionStorage.getItem(ADMIN_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!email || !password) {
      throw new Error('Vui lòng nhập email và mật khẩu');
    }

    const account = MOCK_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password && acc.user.role === 'admin'
    );

    if (!account) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const response: AuthResponse = {
      token: 'admin-token-' + Date.now(),
      user: account.user,
    };
    persistAdmin(response);
    return response;
  },

  adminLogout() {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  },

  isAdminAuthenticated(): boolean {
    const session = this.getAdminSession();
    return Boolean(session?.token);
  },
};
