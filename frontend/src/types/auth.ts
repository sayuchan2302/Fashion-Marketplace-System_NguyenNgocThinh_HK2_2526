export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}
