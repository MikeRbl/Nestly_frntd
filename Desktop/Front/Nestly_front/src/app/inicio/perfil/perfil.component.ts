import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service'; // Assuming HttpLaravelService is the correct name for your HTTP service

// Interface for the User data structure
interface User {
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  profile_picture?: string; // This field will hold the complete URL for the frontend avatar
  avatar_url?: string; // Potentially another field name from the backend for the avatar URL
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  userData: User | null = null; // Holds the user's profile data
  isLoading: boolean = true; // Controls the loading state indicator
  errorMessage: string = ''; // Stores error messages to display to the user
  selectedImage: string | ArrayBuffer | null = null; // For previewing the selected image (base64)
  selectedFile: File | null = null; // The actual file object to be uploaded
  uploadProgress: number = 0; // Tracks the progress of the file upload (0-100)
  maxFileSize: number = 5 * 1024 * 1024; // Maximum allowed file size for upload (5 MB)
  validExtensions: string[] = ['image/jpeg', 'image/png', 'image/gif']; // Allowed image file types

  // Inject HttpLavavelService into the component's constructor
  constructor(private Shttp: HttpLavavelService) {}

  /**
   * Lifecycle hook that runs after Angular initializes the component's views.
   * Used here to load user data when the component is first created.
   */
  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Clears the currently selected image preview and resets the file input.
   * Useful if the user decides not to upload a selected image.
   */
  removeSelectedImage(): void {
    this.selectedImage = null; // Clears the image preview
    this.selectedFile = null; // Clears the file selected for upload
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Resets the file input field, clearing its value
    }
  }

  /**
   * Handles the event when a file is selected from the file input.
   * Performs validation (size, type) and sets up a preview for the image.
   * @param event The DOM event object from the file input change.
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; // Get the first selected file

    if (!file) {
      this.removeSelectedImage(); // Clear selection if no file or selection canceled
      return;
    }

    // Validate file size against the maximum allowed size
    if (file.size > this.maxFileSize) {
      this.errorMessage = 'La imagen es demasiado grande (máximo 5MB).';
      this.selectedFile = null;
      this.selectedImage = null;
      return;
    }

    // Validate file type against allowed extensions
    if (!this.validExtensions.includes(file.type)) {
      this.errorMessage = 'Formato de imagen no válido. Use JPEG, PNG o GIF.';
      this.selectedFile = null;
      this.selectedImage = null;
      return;
    }

    this.selectedFile = file; // Store the valid file
    this.errorMessage = ''; // Clear any previous error messages

    // Read the file as a data URL for immediate preview
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result; // Store the base64 string for the image preview
    };
    reader.readAsDataURL(file); // Start reading the file
  }

  /**
   * Initiates the upload of the selected profile picture to the backend.
   * Displays loading and progress indicators, and handles success/error responses.
   */
  uploadProfilePicture(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'No se ha seleccionado ninguna imagen para subir.';
      return; // Exit if no file is selected
    }

<<<<<<< HEAD
    this.isLoading = true; // Activate loading state
    this.uploadProgress = 0; // Reset upload progress
    this.errorMessage = ''; // Clear previous error messages

    const formData = new FormData(); // Create a FormData object to send the file
    formData.append('profile_picture', this.selectedFile); // Append the file with the expected key

    // Make the POST request to update the profile picture
    this.Shttp.Service_Post('update-profile-picture', formData).subscribe({
      next: (response: any) => {
        console.log('Foto de perfil actualizada con éxito:', response);
        // If the backend returns the new URL, update it. Add a cache-busting timestamp.
        if (this.userData && response.profile_picture_url) {
          this.userData.profile_picture = `${response.profile_picture_url}?${new Date().getTime()}`;
          window.location.reload(); // Reload the page to ensure the new image is displayed
        } else {
          console.warn('profile_picture_url no encontrada en la respuesta de subida. Recargando datos del usuario para actualizar la imagen...');
          this.loadUserData(); // If URL not in response, re-fetch user data to get it
        }
        this.resetUpload(); // Reset upload state after success
        this.isLoading = false; // Deactivate loading state
      },
      error: (err) => {
        console.error('Error al actualizar foto de perfil:', err);
        // Extract error message from backend response or use a generic one
        this.errorMessage = err.error?.message || 'Error al actualizar la foto de perfil. Inténtalo de nuevo.';
        this.isLoading = false; // Deactivate loading state
        this.resetUpload(); // Reset upload state even on error
=======
  this.isLoading = true;
  this.uploadProgress = 0;
  this.errorMessage = ''; 

  const formData = new FormData();
  formData.append('avatar', this.selectedFile); // ojo, que aquí el backend espera 'avatar' no 'profile_picture'

  this.Shttp.Service_Post('user/avatar', formData).subscribe({
    next: (response: any) => {
      console.log('Foto de perfil actualizada:', response);
      if (this.userData && response.avatar_url) {
        this.userData.profile_picture = `${response.avatar_url}?${new Date().getTime()}`;
        window.location.reload();
      } else if (this.userData) {
        this.loadUserData();
>>>>>>> 15cfc6413a89886cd2bbd463b799e1c2230a7858
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


  /**
   * Resets all state variables related to image upload (preview, file, progress, errors).
   */
  private resetUpload(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    this.uploadProgress = 0;
    // Visually clear the file input field
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Fetches the current user's data from the backend.
   * Displays loading state and handles potential errors.
   */
  loadUserData(): void {
    this.isLoading = true; // Activate loading state
    this.errorMessage = ''; // Clear previous errors

    this.Shttp.Service_Get('user').subscribe({
      next: (response: any) => {
        if (response && response.user) {
          this.userData = response.user; // Assign fetched user data

          // Determine the correct image URL from backend response (either avatar_url or profile_picture)
          const imageUrl = response.user.avatar_url || response.user.profile_picture;

          if (this.userData && imageUrl) {
            // Add a cache-busting parameter to the image URL to ensure it's always fresh
            this.userData.profile_picture = `${imageUrl}?${new Date().getTime()}`;
          } else if (this.userData) {
            // If no valid image URL is provided by the backend, ensure profile_picture is undefined
            // so the default placeholder image is shown in the template.
            this.userData.profile_picture = undefined;
          }
        } else {
          this.errorMessage = 'Respuesta inesperada al cargar los datos del usuario.';
          this.userData = null; // Clear user data if response is malformed
        }
        this.isLoading = false; // Deactivate loading state
      },
      error: (err) => {
        console.error('Error al cargar los datos del usuario:', err);
        this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false; // Deactivate loading state
        this.userData = null; // Clear user data on error
      }
    });
  }

  /**
   * Handles the user logout process.
   * Removes the authentication token from local storage and redirects to the login page.
   * (Consider adding a backend logout call here if your authentication system requires it).
   */
  logout(): void {
    // Optional: Call a backend logout endpoint if your authentication system requires it
    // this.Shttp.Service_Post('logout', {}).subscribe({
    //   next: () => {
    //     localStorage.removeItem('token');
    //     window.location.href = '/login';
    //   },
    //   error: (err) => {
    //     console.error('Error al cerrar sesión en el backend:', err);
    //     // Still proceed with client-side logout even if backend fails
    //     localStorage.removeItem('token');
    //     window.location.href = '/login';
    //   }
    // });

    localStorage.removeItem('token'); // Remove the authentication token from local storage
    window.location.href = '/login'; // Redirect the user to the login page
    // In a full Angular app, you would typically use this.router.navigate(['/login']);
  }
}
