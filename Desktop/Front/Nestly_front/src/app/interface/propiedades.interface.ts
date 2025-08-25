import { TipoPropiedad } from './tipopropiedad.interface';
import { User } from './usuario.interface';

export interface Propiedad {
  rentas: Propiedad | null;
  id_propiedad: number;
  id_propietario: number;
  tipo_propiedad_id: number;
  titulo: string;
  descripcion: string;
  direccion: string;
  pais: string;
  estado_ubicacion: string;
  estado_propiedad: string;
  ciudad: string;
  colonia?: string | null;
  precio: number;
  habitaciones: number;
  banos: number;
  metros_cuadrados: number;
  amueblado: boolean;
  anualizado: boolean;
  mascotas: 'si' | 'no';
  deposito?: number | null;
  email: string;
  telefono: string;
  fotos?: string[]; 
  imagen_principal?: string;
  fotos_archivos?: File[]; 
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  propietario?: User; 
  tipo_propiedad?: TipoPropiedad; 

  resenas_count?: number;
  resenas_avg_puntuacion?: string | null;
}