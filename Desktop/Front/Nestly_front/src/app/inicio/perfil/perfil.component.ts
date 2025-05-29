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

  constructor(private Shttp: HttpLavavelService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    
    const formData = new FormData();
    formData.append('profile_picture', this.selectedFile);

    this.Shttp.Service_Post('update-profile-picture', formData).subscribe({
      next: (response: any) => {
        console.log('Foto de perfil actualizada:', response);
        if (this.userData) {
          this.userData.profile_picture = response.profile_picture;
        }
        this.isLoading = false;
        // Resetear la selección
        this.selectedImage = null;
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Error al actualizar foto de perfil:', err);
        this.errorMessage = 'Error al actualizar la foto de perfil';
        this.isLoading = false;
      }
    });
  }

  loadUserData(): void {
    this.isLoading = true;
    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        console.log('Respuesta completa:', response);
        this.userData = response.user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.errorMessage = 'Error al cargar los datos del usuario';
        this.isLoading = false;
      }
    });
  }

  logout() {
    localStorage.removeItem('token'); 
    window.location.href = '/login'; 
  }
}