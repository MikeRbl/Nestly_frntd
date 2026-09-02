import { environment } from '../../environments/environment';

/**
 * Devuelve la URL completa de una imagen.
 * Si `path` ya es una URL absoluta (p. ej. Cloudinary), la devuelve tal cual.
 * Si es una ruta relativa (desarrollo local), antepone el origen del backend.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return '';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');
  return `${apiOrigin}/storage/${path}`;
}

export { environment };