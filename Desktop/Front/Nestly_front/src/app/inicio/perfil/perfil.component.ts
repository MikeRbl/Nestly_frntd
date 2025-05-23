import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;  // Cambiado de 'profile_picture' a 'avatar' para coincidir con Laravel
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
  profileForm: FormGroup;

  constructor(
    private Shttp: HttpLavavelService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name_paternal: ['', Validators.required],
      last_name_maternal: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        this.userData = response.user;
        this.profileForm.patchValue(response.user); // Rellena el formulario
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorMessage = 'Error al cargar datos';
        this.isLoading = false;
      }
    });
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

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    const formData = new FormData();
    
    // Agregar campos del formulario
    Object.keys(this.profileForm.controls).forEach(key => {
      formData.append(key, this.profileForm.get(key)?.value);
    });

    // Agregar archivo si existe
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.Shttp.Service_Put('user', formData).subscribe({
      next: (response: any) => {
        Swal.fire('¡Éxito!', 'Perfil actualizado', 'success');
        this.userData = response.user; // Actualiza datos locales
        this.selectedFile = null; // Resetea el archivo seleccionado
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al actualizar', 'error');
      }
    });
  }

  getAvatarUrl(): string {
    return this.userData?.avatar 
      ? `${this.Shttp.apiUrl}/storage/avatars/${this.userData.avatar}` 
      : 'assets/default-avatar.png';
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}