import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { RoleRequestService } from '../../services/roleRequest.service';
import { NotyfService } from '../../services/notyf.service';

// Interfaz para el usuario
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
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  userData: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  maxFileSize: number = 5 * 1024 * 1024;
  validExtensions: string[] = ['image/jpeg', 'image/png', 'image/gif'];
  
  // Propiedades para las cards
  propiedades: any[] = [];
  propiedadesMostradas: any[] = [];
  loadingPropiedades: boolean = false;
  solicitudEnviada = false;

  constructor(
    private Shttp: HttpLavavelService,
    private roleRequestService: RoleRequestService,
    private authService: AuthService,
    private notyf: NotyfService,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.loadUserData().then(() => {
    this.loadPropiedadesUsuario(); // Solo se ejecuta después de tener userData
  });
  if (localStorage.getItem('roleRequestSent') === 'true') {
      this.solicitudEnviada = true;
    }
}
enviarSolicitud(): void {
    this.roleRequestService.enviarSolicitud().subscribe({
      next: () => {
        this.notyf.success('¡Solicitud enviada! Un administrador la revisará pronto.');
        localStorage.setItem('roleRequestSent', 'true');
        this.solicitudEnviada = true; // Deshabilita el botón
      },
      error: (err) => {
        if (err.status === 400 || err.status === 409) {
          this.notyf.error('Ya tienes una solicitud pendiente.');
          localStorage.setItem('roleRequestSent', 'true'); // Sincroniza el estado
          this.solicitudEnviada = true;
        } else {
          this.notyf.error(err.error?.message || 'Error al enviar la solicitud');
        }
      }
    });
  }
  removeSelectedImage(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'La imagen es demasiado grande (máximo 5MB)';
      this.selectedFile = null;
      this.selectedImage = null;
      return;
    }

    if (!this.validExtensions.includes(file.type)) {
      this.errorMessage = 'Formato no válido. Use JPEG, PNG o GIF';
      this.selectedFile = null;
      this.selectedImage = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('avatar', this.selectedFile);

    this.Shttp.Service_Post('user/avatar', formData).subscribe({
      next: (response: any) => {
        console.log('Foto de perfil actualizada:', response);
        if (this.userData && response.avatar_url) {
          this.userData.profile_picture = `${response.avatar_url}?${new Date().getTime()}`;
          window.location.reload();
        } else if (this.userData) {
          this.loadUserData();
        }
        this.resetUpload();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al actualizar foto de perfil:', err);
        this.errorMessage = err.error?.message || 'Error al actualizar la foto de perfil';
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
    if (fileInput) fileInput.value = '';
  }

  loadUserData(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.isLoading = true;
    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        this.userData = response.user;
        this.isLoading = false;
        resolve(); // Resuelve la Promise cuando se completa
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar datos del usuario:', err);
        reject(err);
      }
    });
  });
}
loadPropiedadesUsuario(): void {
  // 1. Obtén el ID del usuario desde userData o donde lo tengas almacenado
  const userId = this.userData?.id; // Asegúrate de que userData tenga el ID
  
  if (!userId) {
    console.error('No se pudo obtener el ID del usuario');
    return;
  }

  this.loadingPropiedades = true;
  
  // 2. Usa la ruta correcta (api/users/{user}/propiedades)
  this.Shttp.Service_Get(`users/${userId}/propiedades?limit=100`).subscribe({
    next: (response: any) => {
      this.propiedades = response.data || [];
      this.seleccionarPropiedadesAleatorias();
      this.loadingPropiedades = false;
    },
    error: (err) => {
      console.error('Error completo:', err);
      this.propiedades = [];
      this.propiedadesMostradas = [];
      this.loadingPropiedades = false;
      this.errorMessage = 'Error al cargar propiedades. Verifica la consola para más detalles.';
    }
  });
}

  seleccionarPropiedadesAleatorias(): void {
    if (this.propiedades.length <= 3) {
      this.propiedadesMostradas = [...this.propiedades];
    } else {
      const copiaPropiedades = [...this.propiedades];
      this.propiedadesMostradas = [];
      
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * copiaPropiedades.length);
        this.propiedadesMostradas.push(copiaPropiedades[randomIndex]);
        copiaPropiedades.splice(randomIndex, 1);
      }
    }
  }

  getFullImageUrl(path: string): string {
    return `http://127.0.0.1:8000/storage/${path}`;
  }

  verDetallesPropiedad(id: number): void {
    
  }

  publicarNuevaPropiedad(): void {
    this.router.navigate(['/principal/publicarCasa']);
  }

  logout() {
    localStorage.removeItem('token'); 
    this.router.navigate(['/dashboard']);
  }
}