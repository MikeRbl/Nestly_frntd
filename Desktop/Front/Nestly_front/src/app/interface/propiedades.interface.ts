export interface Propiedad {
  id_propiedad: number;
  id_propietario: number;
  tipo_propiedad_id: number;
  titulo: string;
  descripcion: string;
  direccion: string;
  pais: string;
  estado_ubicacion: string;
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
}