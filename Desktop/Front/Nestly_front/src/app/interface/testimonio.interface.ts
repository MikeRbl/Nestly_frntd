import { User } from "./usuario.interface";


export interface Testimonio {
  id?: number;
  id_usuario?: number;
  comentario: string;
  puntuacion: number;
  created_at?: string;
  updated_at?: string;
  
  usuario: User; 
}