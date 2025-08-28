import { User } from "./usuario.interface";


// Define cómo se ve una solicitud de rol completa
export interface RoleRequest {
  id: number;
  user_id: number;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  created_at: string;
  user?: User; 
  expanded?: boolean; 
}

export interface RoleRequestUpdatePayload {
  status: 'aprobado' | 'rechazado';
}