import { Component, OnInit } from "@angular/core";
import { HttpLavavelService } from "../../http.service"; // Asegúrate de que esta ruta sea correcta para tu servicio HTTP

// Interfaz para la estructura de datos del usuario
interface User {
    id: number;
    first_name: string;
    last_name_paternal: string;
    last_name_maternal: string;
    email: string;
    phone: string;
    role: string;
    profile_picture?: string; // Campo para la URL completa del avatar (usado en frontend)
    avatar_url?: string; // Posiblemente otra propiedad del backend para la URL del avatar
    created_at: string;
    updated_at: string;
}

@Component({
    selector: "app-editar-perfil", // Asegúrate de que el selector es 'app-editar-perfil'
    templateUrl: "./editarPerfil.component.html",
    styleUrls: ["./editarPerfil.component.scss"], // Importa el archivo SCSS renombrado
})
export class EditarPerfilComponent implements OnInit {
    userData: User | null = null; // Almacena los datos del perfil del usuario
    isLoading: boolean = true; // Controla el indicador de estado de carga general (también para imagen/formulario)
    isSaving: boolean = false; // Controla el estado de guardado del formulario (para el botón de enviar)
    errorMessage: string = ''; // Almacena mensajes de error a mostrar
    successMessage: string = ''; // Almacena mensajes de éxito a mostrar
    password: string = ''; // Campo para la nueva contraseña
    passwordConfirmation: string = ''; // Campo para confirmar la nueva contraseña
    formChanges: any = {}; // Objeto para rastrear los cambios en los campos del formulario

    // PROPIEDADES PARA LA GESTIÓN DE IMAGENES
    selectedImage: string | ArrayBuffer | null = null; // Para previsualizar la imagen seleccionada (Base64 o URL temporal)
    selectedFile: File | null = null; // El objeto de archivo real a subir
    uploadProgress: number = 0; // Seguimiento del progreso de subida del archivo (0-100)
    maxFileSize: number = 5 * 1024 * 1024; // Tamaño máximo permitido del archivo (5 MB)
    validExtensions: string[] = ['image/jpeg', 'image/png', 'image/gif']; // Tipos de archivo de imagen válidos

    // Inyecta HttpLavavelService en el constructor del componente
    constructor(private Shttp: HttpLavavelService) {}

    /**
     * Hook del ciclo de vida que se ejecuta después de que Angular inicializa las vistas del componente.
     * Se usa aquí para cargar los datos del usuario cuando el componente se crea por primera vez.
     */
    ngOnInit(): void {
        this.loadUserData(); // Carga los datos del usuario al iniciar
    }

    /**
     * Limpia la previsualización de la imagen seleccionada y restablece el input de archivo.
     * Útil si el usuario decide no subir una imagen seleccionada o después de una subida.
     */
    removeSelectedImage(): void {
        this.selectedImage = null; // Borra la previsualización de la imagen
        this.selectedFile = null; // Borra el archivo seleccionado para subir
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // Restablece el valor del campo de input de archivo
        }
        this.errorMessage = ''; // Limpiar cualquier error específico de imagen
        this.uploadProgress = 0; // Resetear progreso
    }

    /**
     * Maneja el evento cuando se selecciona un archivo del input de archivo.
     * Realiza validación (tamaño, tipo) y configura una previsualización para la imagen.
     * @param event El objeto de evento DOM del cambio en el input de archivo.
     */
    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0]; // Obtiene el primer archivo seleccionado

        if (!file) {
            this.removeSelectedImage(); // Limpiar selección si no hay archivo o se canceló
            return;
        }

        // Validar tamaño del archivo
        if (file.size > this.maxFileSize) {
            this.errorMessage = 'La imagen es demasiado grande (máximo 5MB).';
            this.selectedFile = null;
            this.selectedImage = null;
            this.uploadProgress = 0; // Reiniciar progreso por si acaso
            return;
        }

        // Validar formato del archivo
        if (!this.validExtensions.includes(file.type)) {
            this.errorMessage = 'Formato de imagen no válido. Use JPEG, PNG o GIF.';
            this.selectedFile = null;
            this.selectedImage = null;
            this.uploadProgress = 0; // Reiniciar progreso por si acaso
            return;
        }

        this.selectedFile = file; // Almacena el archivo válido
        this.errorMessage = ''; // Limpiar cualquier mensaje de error previo
        this.uploadProgress = 0; // Reiniciar progreso al seleccionar nuevo archivo

        // Leer el archivo como una URL de datos para previsualización inmediata
        const reader = new FileReader();
        reader.onload = () => {
            this.selectedImage = reader.result; // Almacena la cadena base64 para la previsualización
        };
        reader.readAsDataURL(file); // Comienza a leer el archivo
    }

    /**
     * Inicia la subida de la foto de perfil seleccionada al backend.
     * Muestra indicadores de carga y progreso, y maneja las respuestas de éxito/error.
     */
    uploadProfilePicture(): void {
        if (!this.selectedFile) {
            this.errorMessage = 'No se ha seleccionado ninguna imagen para subir.';
            return; // Salir si no hay archivo seleccionado
        }

        this.isLoading = true; // Activar estado de carga general
        this.uploadProgress = 0; // Reiniciar progreso de subida
        this.errorMessage = ''; // Limpiar mensajes de error previos
        this.successMessage = ''; // Limpiar mensajes de éxito previos (si los hubiera del formulario)

        const formData = new FormData(); // Crear un objeto FormData para enviar el archivo
        formData.append('avatar', this.selectedFile); // El nombre del campo ('avatar') debe coincidir con lo que espera tu backend (Laravel)

        // Realizar la solicitud POST para actualizar la foto de perfil
        this.Shttp.Service_Post('user/avatar', formData).subscribe({
            next: (response: any) => {
                console.log('Foto de perfil actualizada con éxito:', response);
                // Si el backend devuelve la nueva URL, actualizarla.
                if (this.userData && response.avatar_url) {
                    this.userData.profile_picture = `${response.avatar_url}?${new Date().getTime()}`;
                    // Recargar la página para asegurar que todas las instancias de la imagen se actualicen (si es necesario)
                    window.location.reload(); 
                } else if (this.userData) {
                    console.warn('avatar_url no encontrada en la respuesta de subida. Recargando datos del usuario para actualizar la imagen...');
                    this.loadUserData(); // Si la URL no está en la respuesta, volver a obtener los datos del usuario para conseguirla
                }
                this.resetUpload(); // Reiniciar estado de subida después del éxito
                this.isLoading = false; // Desactivar estado de carga
                this.successMessage = 'Imagen de perfil actualizada con éxito.'; // Mensaje de éxito para la imagen
            },
            error: (err) => {
                console.error('Error al actualizar foto de perfil:', err);
                this.errorMessage = err.error?.message || 'Error al actualizar la foto de perfil. Inténtalo de nuevo.';
                this.isLoading = false; // Desactivar estado de carga
                this.resetUpload(); // Asegurar el reinicio del estado de subida incluso en caso de error
            }
        });
    }

    /**
     * Restablece todas las variables de estado relacionadas con la subida de imágenes (previsualización, archivo, progreso, errores).
     */
    private resetUpload(): void {
        this.selectedImage = null;
        this.selectedFile = null;
        this.uploadProgress = 0;
        // Limpiar visualmente el campo de input de archivo
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /**
     * Carga los datos actuales del usuario desde el backend.
     * Muestra el estado de carga y maneja posibles errores.
     */
    loadUserData(): void {
        this.isLoading = true; // Activar estado de carga general
        this.errorMessage = ''; // Limpiar mensajes de error previos
        this.successMessage = ''; // Limpiar mensajes de éxito previos

        this.Shttp.Service_Get('user').subscribe({
            next: (response: any) => {
                if (response && response.user) {
                    this.userData = response.user; // Asignar los datos de usuario obtenidos

                    // Determinar la URL correcta de la imagen de la respuesta del backend (avatar_url o profile_picture)
                    const imageUrl = response.user.avatar_url || response.user.profile_picture;

                    if (this.userData && imageUrl) {
                        // Añadir un parámetro de timestamp a la URL de la imagen para asegurar que siempre sea fresca
                        this.userData.profile_picture = `${imageUrl}?${new Date().getTime()}`;
                    } else if (this.userData) {
                        // Si el backend no proporciona una URL de imagen válida, asegurar que profile_picture sea undefined
                        // para que la imagen de marcador de posición predeterminada se muestre en la plantilla.
                        this.userData.profile_picture = undefined;
                    }
                } else {
                    this.errorMessage = 'Respuesta inesperada al cargar los datos del usuario.';
                    this.userData = null; // Limpiar datos de usuario si la respuesta está mal formada
                }
                this.isLoading = false; // Desactivar estado de carga
            },
            error: (err) => {
                console.error('Error al cargar los datos del usuario:', err);
                this.errorMessage = err.error?.message || 'Error al cargar los datos del usuario. Por favor, inténtalo de nuevo más tarde.';
                this.isLoading = false; // Desactivar estado de carga
                this.userData = null; // Limpiar datos de usuario en caso de error
            }
        });
    }

    /**
     * Maneja los cambios en los campos del formulario para rastrear solo las modificaciones.
     * @param field El nombre del campo que ha cambiado.
     * @param value El nuevo valor del campo.
     */
    onFieldChange(field: string, value: any) {
        this.formChanges[field] = value;
        // Limpiar mensajes de éxito/error al empezar a editar de nuevo
        this.successMessage = '';
        this.errorMessage = '';
    }

    /**
     * Envía el formulario de actualización del perfil al backend.
     * Realiza validaciones, activa el estado de guardado y maneja las respuestas.
     */
    onSubmit(): void {
        // Validar si hay cambios o si el usuario existe
        if (!this.userData) {
            this.errorMessage = 'No se pudieron cargar los datos del usuario.';
            return;
        }

        // Si no hay cambios en los campos y tampoco hay una nueva contraseña
        if (Object.keys(this.formChanges).length === 0 && !this.password) {
            this.errorMessage = 'No hay cambios para guardar.';
            return;
        }

        // Validar que las contraseñas coincidan si se ha introducido una nueva
        if (this.password && this.password !== this.passwordConfirmation) {
            this.errorMessage = 'Las contraseñas no coinciden.';
            return;
        }
        
        this.isSaving = true; // Activar estado de guardado del formulario
        this.errorMessage = ''; // Limpiar mensajes de error y éxito previos
        this.successMessage = '';

        // Preparar los datos a enviar: combinar cambios con las contraseñas si existen
        const updateData: any = { ...this.formChanges };
        if (this.password) {
            updateData.password = this.password;
            updateData.password_confirmation = this.passwordConfirmation;
        }

        // Realizar la solicitud PUT para actualizar el perfil del usuario
        this.Shttp.Service_Put(`users/${this.userData.id}`, updateData).subscribe({
            next: (response) => {
                this.isSaving = false; // Desactivar estado de guardado
                this.successMessage = 'Perfil actualizado correctamente.';
                // Actualizar los datos del usuario localmente con los cambios enviados
                if (this.userData) {
                    this.userData = { ...this.userData, ...this.formChanges };
                }
                this.formChanges = {}; // Reiniciar los cambios rastreados
                this.password = ''; // Limpiar campos de contraseña
                this.passwordConfirmation = '';
            },
            error: (err) => {
                console.error('Error al actualizar el perfil:', err);
                this.errorMessage = err.error?.message ||
                                   (err.error?.errors ? this.formatErrors(err.error.errors) : 'Error al actualizar el perfil.');
                this.isSaving = false; // Desactivar estado de guardado
            }
        });
    }

    /**
     * Formatea un objeto de errores de validación de Laravel en una cadena legible.
     * @param errors Objeto de errores (ej. { email: ["El email es inválido"], password: ["La contraseña es muy corta"] }).
     * @returns Una cadena con los mensajes de error concatenados.
     */
    private formatErrors(errors: any): string {
        if (typeof errors === 'object' && errors !== null) {
            return Object.values(errors).flat().join('; '); // Une todos los mensajes de error
        }
        return 'Error de validación desconocido.';
    }

    /**
     * Maneja el proceso de cierre de sesión del usuario.
     * Elimina el token de autenticación del almacenamiento local y redirige a la página de inicio de sesión.
     */
    logout(): void {
        localStorage.removeItem('token'); // Eliminar el token de autenticación
        window.location.href = '/login'; // Redirigir al usuario a la página de inicio de sesión
    }
}
