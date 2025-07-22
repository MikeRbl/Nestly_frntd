import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';

interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  profile_picture?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editarPerfil.component.html',
  styleUrls: ['./editarPerfil.component.scss']
})
export class EditarPerfilComponent implements OnInit {
  userData: User | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  password: string = '';
  passwordConfirmation: string = '';
  formChanges: any = {};

  // Propiedades para gestión de imágenes
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  maxFileSize: number = 5 * 1024 * 1024;
  validExtensions: string[] = ['image/jpeg', 'image/png', 'image/gif'];

  constructor(private Shttp: HttpLavavelService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        if (response && response.user) {
          this.userData = response.user;
          const imageUrl = response.user.avatar_url || response.user.profile_picture;
          
          if (this.userData && imageUrl) {
            this.userData.profile_picture = `${imageUrl}?${new Date().getTime()}`;
          } else if (this.userData) {
            this.userData.profile_picture = undefined;
          }
        } else {
          this.errorMessage = 'Respuesta inesperada al cargar los datos del usuario.';
          this.userData = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los datos del usuario:', err);
        this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        this.userData = null;
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.removeSelectedImage();
      return;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'La imagen es demasiado grande (máximo 5MB).';
      this.selectedFile = null;
      this.selectedImage = null;
      this.uploadProgress = 0;
      return;
    }

    if (!this.validExtensions.includes(file.type)) {
      this.errorMessage = 'Formato de imagen no válido. Use JPEG, PNG o GIF.';
      this.selectedFile = null;
      this.selectedImage = null;
      this.uploadProgress = 0;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.uploadProgress = 0;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'No se ha seleccionado ninguna imagen para subir.';
      return;
    }

    this.isLoading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('avatar', this.selectedFile);

    this.Shttp.Service_Post('user/avatar', formData).subscribe({
      next: (response: any) => {
        console.log('Foto de perfil actualizada con éxito:', response);
        if (this.userData && response.avatar_url) {
          this.userData.profile_picture = `${response.avatar_url}?${new Date().getTime()}`;
          window.location.reload(); 
        } else if (this.userData) {
          this.loadUserData();
        }
        this.resetUpload();
        this.isLoading = false;
        this.successMessage = 'Imagen de perfil actualizada con éxito.';
      },
      error: (err) => {
        console.error('Error al actualizar foto de perfil:', err);
        this.errorMessage = err.error?.message || 'Error al actualizar la foto de perfil. Inténtalo de nuevo.';
        this.isLoading = false;
        this.resetUpload();
      }
    });
  }

  private resetUpload(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    this.uploadProgress = 0;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removeSelectedImage(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.errorMessage = '';
    this.uploadProgress = 0;
  }

  onFieldChange(field: string, value: any) {
    this.formChanges[field] = value;
    this.successMessage = '';
    this.errorMessage = '';
  }

  async onSubmit(): Promise<void> {
    if (!this.userData) {
      this.errorMessage = 'No se pudieron cargar los datos del usuario.';
      return;
    }

    if (Object.keys(this.formChanges).length === 0 && !this.password) {
      this.errorMessage = 'No hay cambios para guardar.';
      return;
    }

    if (this.password && this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password && this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const updateData: any = { ...this.formChanges };
      
      if (this.password) {
        updateData.password = this.password;
        updateData.password_confirmation = this.passwordConfirmation;
      }

      const response = await this.Shttp.Service_Put('user', updateData).toPromise();

      this.successMessage = 'Perfil actualizado correctamente.';
      if (this.userData) {
        this.userData = { ...this.userData, ...this.formChanges };
      }
      this.formChanges = {};
      this.password = '';
      this.passwordConfirmation = '';

      setTimeout(() => this.successMessage = '', 5000);

    } catch (error: any) {
      console.error('Error al actualizar:', error);
      
      if (error.status === 422) {
        this.errorMessage = this.formatErrors(error.error.errors);
      } else if (error.status === 403) {
        this.errorMessage = 'No tienes permisos para realizar esta acción.';
      } else if (error.status === 401) {
        this.errorMessage = 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.';
        setTimeout(() => this.logout(), 3000);
      } else {
        this.errorMessage = error.error?.message || 'Error al actualizar el perfil. Inténtalo de nuevo.';
      }
    } finally {
      this.isSaving = false;
    }
  }

  private formatErrors(errors: any): string {
    if (typeof errors === 'object' && errors !== null) {
      return Object.values(errors).flat().join('; ');
    }
    return 'Error de validación desconocido.';
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }
}