import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service'; // Asumo que HttpLaravelService es el nombre correcto

// Interfaz para el usuario
interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  profile_picture?: string; // Usaremos este campo en el frontend para la URL completa
  avatar_url?: string; // Potencialmente viene del backend con este nombre
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  userData: User | null = null; // Guarda los datos del usuario
  isLoading: boolean = true; // Controla el estado de carga
  errorMessage: string = ''; // Mensaje de error en caso de fallos
  selectedImage: string | ArrayBuffer | null = null; // Imagen cargada en formato base64 para previsualización
  selectedFile: File | null = null; // Archivo seleccionado para enviar
  uploadProgress: number = 0; // Progreso de carga (no usado visualmente aún)
  maxFileSize: number = 5 * 1024 * 1024; // Tamaño máximo del archivo (5MB)
  validExtensions: string[] = ['image/jpeg', 'image/png', 'image/gif']; // Tipos de archivo válidos

  constructor(private Shttp: HttpLavavelService) {} // Inyecta el servicio HTTP personalizado

  ngOnInit(): void {
    this.loadUserData(); // Carga los datos del usuario al iniciar
  }

  onFileChange(event: any): void {
    const file = event.target.files[0]; // Obtiene el archivo

    if (!file) return;

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      this.errorMessage = 'La imagen es demasiado grande (máximo 5MB)';
      this.selectedFile = null;
      this.selectedImage = null; // Limpiar previsualización
      return;
    }

    // Validar formato
    if (!this.validExtensions.includes(file.type)) {
      this.errorMessage = 'Formato no válido. Use JPEG, PNG o GIF';
      this.selectedFile = null;
      this.selectedImage = null; // Limpiar previsualización
      return;
    }

    this.selectedFile = file;
    this.errorMessage = ''; // Limpiar errores previos

    const reader = new FileReader(); // Crear lector de archivos
    reader.onload = () => {
      this.selectedImage = reader.result; // Guardar base64 para previsualizar
    };
    reader.readAsDataURL(file);
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.uploadProgress = 0;
    this.errorMessage = ''; // Limpiar mensajes de error previos

    const formData = new FormData(); // Crear formulario para enviar archivo
    formData.append('profile_picture', this.selectedFile);

    this.Shttp.Service_Post('update-profile-picture', formData).subscribe({
      next: (response: any) => {
        console.log('Foto de perfil actualizada:', response);
        if (this.userData && response.profile_picture_url) { // Verificar que profile_picture_url exista
          // CORRECCIÓN AQUÍ: Usar response.profile_picture_url
          this.userData.profile_picture = `${response.profile_picture_url}?${new Date().getTime()}`;
        } else if (this.userData) {
            // Si profile_picture_url no viene en la respuesta, recargar los datos del usuario
            // para obtener la URL actualizada del avatar desde el endpoint 'user'.
            console.warn('profile_picture_url no encontrada en la respuesta de subida, recargando datos del usuario...');
            this.loadUserData();
        }
        this.resetUpload();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al actualizar foto de perfil:', err);
        this.errorMessage = err.error?.message || 'Error al actualizar la foto de perfil';
        this.isLoading = false;
        this.resetUpload(); // Asegurarse de resetear también en caso de error
      }
    });
  }

  private resetUpload(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    this.uploadProgress = 0;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = ''; // Limpiar mensajes de error previos
    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        if (response && response.user) {
          this.userData = response.user;
          // CORRECCIÓN/MEJORA AQUÍ:
          // Asumimos que el backend devuelve 'avatar_url' con la URL completa.
          // Si no, y devuelve 'profile_picture' con la URL, usa eso.
          // Lo importante es que this.userData.profile_picture obtenga la URL correcta.
          const imageUrl = response.user.avatar_url || response.user.profile_picture; 

          if (this.userData && imageUrl) {
            this.userData.profile_picture = `${imageUrl}?${new Date().getTime()}`;
          } else if (this.userData) {
            // Si no hay URL de imagen, puedes dejar profile_picture como undefined o null
            // para que el template muestre un avatar por defecto.
            this.userData.profile_picture = undefined; 
          }
        } else {
          this.errorMessage = 'Respuesta inesperada al cargar datos del usuario.';
          this.userData = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del usuario:', err);
        this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario';
        this.isLoading = false;
        this.userData = null;
      }
    });
  }

  logout() {
    // Considera llamar a un endpoint de logout en el backend también si es necesario
    // this.Shttp.Service_Post('logout', {}).subscribe(...);
    localStorage.removeItem('token'); 
    window.location.href = '/login'; // O usa Angular Router para navegar
  }
}
