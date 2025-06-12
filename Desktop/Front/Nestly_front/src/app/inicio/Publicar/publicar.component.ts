import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service'; // Asegúrate que la ruta sea correcta
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publicar',
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent implements OnInit, OnDestroy {
  formulario: FormGroup;
  fotos: File[] = [];
  previewUrls: (string | ArrayBuffer | null)[] = [];
  formSubmitted = false;
  isLoading = false;
  
  // Array para guardar los tipos de propiedad que vienen de la API
  tiposDePropiedad: any[] = [];

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    // El FormGroup ahora refleja la estructura final de la base de datos
    this.formulario = this.fb.group({
      // Información Principal
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required]],
      
      // Ubicación
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      pais: ['', [Validators.required, Validators.maxLength(100)]],
      estado_ubicacion: ['', [Validators.required, Validators.maxLength(100)]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      colonia: [''],

      // Características y Especificaciones
      precio: ['', [Validators.required, Validators.min(0)]],
      habitaciones: ['', [Validators.required, Validators.min(0)]],
      banos: ['', [Validators.required, Validators.min(0)]],
      metros_cuadrados: ['', [Validators.required, Validators.min(0)]],
      deposito: [''],
      
      // Toggles de Sí/No
      amueblado: [false, [Validators.required]],
      anualizado: [false, [Validators.required]],
      mascotas: ['', [Validators.required]],
      
      // El campo relacional
      tipo_propiedad_id: ['', [Validators.required]],

      // Multimedia
      fotos: [[], [Validators.required]],
      
      // Contacto
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      // 'tamano' ha sido eliminado de esta sección
    });
  }

  ngOnInit(): void {
    // Se llama a la API para obtener los tipos de propiedad al cargar el componente
    this.httpService.getTiposDePropiedad().subscribe({
      next: (tipos) => {
        this.tiposDePropiedad = tipos;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de propiedad', err);
        Swal.fire('Error', 'No se pudieron cargar las categorías de propiedad. Inténtalo de nuevo más tarde.', 'error');
      }
    });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.clearPreviewUrls();
      this.fotos = Array.from(event.target.files);
      this.previewUrls = this.fotos.map(file => 
        this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)) as string
      );
      this.formulario.patchValue({ fotos: this.fotos });
      this.formulario.get('fotos')?.setErrors(null);
    } else {
      this.clearPreviewUrls();
      this.formulario.patchValue({ fotos: [] });
      this.formulario.get('fotos')?.setErrors({ required: true });
    }
  }

  removePhoto(index: number): void {
    if (this.previewUrls[index]) {
      URL.revokeObjectURL(this.previewUrls[index] as string);
    }
    this.fotos.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.formulario.patchValue({ fotos: this.fotos });

    if (this.fotos.length === 0) {
      this.formulario.get('fotos')?.setErrors({ required: true });
    } else {
      this.formulario.get('fotos')?.setErrors(null);
    }
  }

  private clearPreviewUrls(): void {
    this.previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url as string);
    });
    this.previewUrls = [];
    this.fotos = [];
  }

  publicarPropiedad(): void {
    this.formSubmitted = true;
    this.isLoading = true;

    if (this.formulario.invalid) {
      this.isLoading = false;
      Swal.fire('Error', 'Por favor completa todos los campos requeridos correctamente.', 'error');
      // Marca todos los campos como "tocados" para mostrar los mensajes de error
      Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const formData = new FormData();
    const formValue = this.formulario.value;

    // Itera sobre los valores del formulario y los agrega a formData
    Object.keys(formValue).forEach(key => {
      if (key !== 'fotos') {
        let value = formValue[key];
        
        if (typeof value === 'boolean') {
          value = value ? '1' : '0';
        }
        
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
    });

    // Agrega los archivos de las fotos
    this.fotos.forEach((file) => {
      formData.append(`fotos[]`, file, file.name);
    });

    // Envía los datos al backend
    this.httpService.Service_Post('propiedades', formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire('¡Éxito!', 'Propiedad publicada correctamente.', 'success').then(() => {
          this.router.navigate(['/dashboard']); // O la ruta a la que quieras redirigir
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error completo al publicar:', err);
        
        if (err.status === 422 && err.error.errors) {
          const errors = Object.values(err.error.errors).flat().join('<br>');
          Swal.fire({
            title: 'Error de Validación',
            html: `<div class="text-start p-3">${errors}</div>`,
            icon: 'error'
          });
        } else {
          Swal.fire('Error Inesperado', err.error?.message || 'Ocurrió un error al conectar con el servidor.', 'error');
        }
      }
    });
  }

  // Getter para un acceso más fácil a los controles del formulario en la plantilla HTML
  get f() {
    return this.formulario.controls;
  }

  get fotosInvalid() {
    return (this.formSubmitted || this.f['fotos'].touched) && this.f['fotos'].invalid;
  }

  get mascotasInvalid() {
    return this.f['mascotas'].invalid && (this.f['mascotas'].touched || this.formSubmitted);
  }

  ngOnDestroy() {
    this.clearPreviewUrls();
  }
}
