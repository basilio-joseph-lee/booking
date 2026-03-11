export type AuthLogin = {
  email:    string;
  password: string;
}

export type AuthUser = {
  id:         number;
  name:       string;
  email:      string;
  role:       string;
  avatar_url: string;
  is_active:  boolean;
  created_at: string;
  updated_at: string;
}

export type AuthResponse = {
  message?: string;
  error?:   string;
  user?:    AuthUser;
}