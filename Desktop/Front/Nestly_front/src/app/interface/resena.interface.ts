import { User } from './usuario.interface';


export interface Resena {
  id: number;
  puntuacion: number;
  comentario: string;
  created_at: string; 
  updated_at: string;
  
  user: User;
  votos_count: number; 
  
 likedByCurrentUser?: boolean; 
}