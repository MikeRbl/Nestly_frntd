export interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  status: 'activo' | 'baneado' | 'suspendido';
  created_at: string;
  updated_at: string;
  full_name?: string;
  avatar_url?: string;
  email_verified_at?: string | null;
  suspension_ends_at?: string;
}
