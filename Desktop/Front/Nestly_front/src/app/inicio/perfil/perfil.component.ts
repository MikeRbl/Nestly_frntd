import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service'; // Asumo que HttpLaravelService es el nombre correcto

// Define la estructura de los datos del usuario.
interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  profile_picture?: string; // URL procesada para mostrar en el template (con timestamp).
  avatar_url?: string;      // URL original del avatar que puede venir del backend.
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-perfil',                
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']  
})
export class PerfilComponent implements OnInit {
  userData: User | null = null;                     // Almacena los datos del usuario actual.
  isLoading: boolean = true;                        // Controla el estado de carga (spinner/feedback).
  errorMessage: string = '';                      // Muestra mensajes de error al usuario.
  selectedImage: string | ArrayBuffer | null = null; // Vista previa de la imagen seleccionada (Base64).
  selectedFile: File | null = null;                 // Archivo de imagen seleccionado para subir.
  maxFileSize: number = 5 * 1024 * 1024; // Límite de tamaño de archivo: 5MB.
  validExtensions: string[] = ['image/jpeg', 'image/png', 'image/gif']; // Tipos de imagen permitidos.

  // Inyecta el servicio HTTP para comunicarse con el backend.
  constructor(private Shttp: HttpLavavelService) {}


  ngOnInit(): void {
    this.loadUserData(); // Carga los datos del usuario al iniciar.
  }

  // Maneja el cambio de archivo en el input de tipo 'file'.
  onFileChange(event: any): void {
    const file = event.target.files[0]; // Obtiene el archivo seleccionado.

    if (!file) return; // Si no hay archivo, no hace nada.

    // Validación del tamaño del archivo.
    if (file.size > this.maxFileSize) {
      this.errorMessage = 'La imagen es demasiado grande (máximo 5MB)';
      this.selectedFile = null;
      this.selectedImage = null; // Limpia la previsualización.
      return;
    }

    // Validación del tipo de archivo (extensión).
    if (!this.validExtensions.includes(file.type)) {
      this.errorMessage = 'Formato no válido. Use JPEG, PNG o GIF';
      this.selectedFile = null;
      this.selectedImage = null; // Limpia la previsualización.
      return;
    }

    this.selectedFile = file; // Almacena el archivo válido.
    this.errorMessage = '';   // Limpia mensajes de error previos.

    // Lee el archivo para generar una vista previa.
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result; // Asigna la imagen en Base64 para la vista previa.
    };
    reader.readAsDataURL(file); // Inicia la lectura del archivo.
  }

  // Sube la foto de perfil seleccionada al servidor.
  uploadProfilePicture(): void {
    if (!this.selectedFile) return; // Si no hay archivo seleccionado, no hace nada.

    this.isLoading = true;
    // this.uploadProgress = 0; // Reinicia progreso si se implementa barra.
    this.errorMessage = '';

    const formData = new FormData(); // Crea un objeto FormData para enviar el archivo.
    formData.append('profile_picture', this.selectedFile); // Añade el archivo.

    // Realiza la petición POST para actualizar la foto.
    this.Shttp.Service_Post('update-profile-picture', formData).subscribe({
      next: (response: any) => { // En caso de respuesta exitosa.
        console.log('Foto de perfil actualizada:', response);
        if (this.userData && response.profile_picture_url) {
          // Actualiza la URL de la foto en userData con timestamp para evitar caché.
          this.userData.profile_picture = `${response.profile_picture_url}?${new Date().getTime()}`;
        } else if (this.userData) {
          // Si el backend no devuelve la URL directa, recarga todos los datos del usuario.
          console.warn('profile_picture_url no encontrada, recargando datos del usuario...');
          this.loadUserData();
        }
        this.resetUpload();    // Limpia la selección de archivo.
        this.isLoading = false;
      },
      error: (err) => { // En caso de error en la subida.
        console.error('Error al actualizar foto de perfil:', err);
        this.errorMessage = err.error?.message || 'Error al actualizar la foto de perfil';
        this.isLoading = false;
        this.resetUpload(); // También resetea en caso de error.
      }
    });
  }

  // Resetea el estado de la selección de imagen.
  private resetUpload(): void {
    this.selectedImage = null;  // Limpia vista previa.
    this.selectedFile = null;   // Limpia archivo seleccionado.
    // this.uploadProgress = 0;
    // Limpia el valor del input de archivo para permitir seleccionar el mismo archivo de nuevo.
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Carga los datos del perfil del usuario desde el servidor.
  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => { // En caso de respuesta exitosa.
        if (response && response.user) {
          this.userData = response.user; // Asigna los datos del usuario.

          // Prioriza 'avatar_url', luego 'profile_picture' del backend para la imagen.
          const imageUrl = response.user.avatar_url || response.user.profile_picture;

          if (this.userData && imageUrl) {
            // Procesa la URL con timestamp para la visualización.
            this.userData.profile_picture = `${imageUrl.split('?')[0]}?${new Date().getTime()}`;
          } else if (this.userData) {
            // Si no hay imagen, la deja como undefined para usar el avatar por defecto.
            this.userData.profile_picture = undefined;
          }
        } else { // Si la respuesta no es la esperada.
          this.errorMessage = 'Respuesta inesperada al cargar datos del usuario.';
          this.userData = null;
        }
        this.isLoading = false;
      },
      error: (err) => { // En caso de error al cargar datos.
        console.error('Error al cargar datos del usuario:', err);
        this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario';
        this.isLoading = false;
        this.userData = null; // Limpia userData en caso de error.
      }
    });
  }

  // Cierra la sesión del usuario.
  logout() {
    // Considerar llamar a un endpoint de logout en el backend aquí.
    // this.Shttp.Service_Post('logout', {}).subscribe(...);
    localStorage.removeItem('token'); // Elimina el token de autenticación.
    window.location.href = '/login';  // Redirige a la página de login. (O usar Angular Router).
  }
}