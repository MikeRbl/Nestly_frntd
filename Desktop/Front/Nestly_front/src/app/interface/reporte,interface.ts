export interface Reporte {
  id: number;
  reportador_id: number;
  reportable_id: number;
  reportable_type: string;
  motivo: string;
  descripcion?: string;
  estado: string;
  created_at: string;
  updated_at: string;
}