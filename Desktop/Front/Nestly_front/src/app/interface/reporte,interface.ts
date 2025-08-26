
export interface Reporte {
  id: number;
  reportador_id: number;
  reportable_id: number;
  reportable_type: string;
  motivo: string;
  descripcion?: string;
  estado: 'pendiente' | 'resuelto' | 'descartado';
  created_at: string;
  updated_at: string;
  reportador: {
    id: number;
    avatar_url?: string;
    first_name?: string;
    last_name_paternal: string;

  };
    reportable: any; 
}