import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';
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
  previewUrls: (string | null)[] = [];
  formSubmitted = false;
  isLoading = false;
  
  // Cambiado a los valores que espera el backend ('si', 'no')
  opcionesMascotas = [
    { value: 'si', label: 'Permitido' },
    { value: 'no', label: 'No permitido' },
    { value: 'consultar', label: 'Consultar' }
  ];

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      pais: ['', [Validators.required, Validators.maxLength(100)]],
      estado: ['', [Validators.required, Validators.maxLength(100)]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      colonia: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      habitaciones: ['', [Validators.required, Validators.min(0)]],
      banos: ['', [Validators.required, Validators.min(0)]],
      metros_cuadrados: ['', [Validators.required, Validators.min(0)]],
      amueblado: [false, [Validators.required]],
      disponibilidad: [false, [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      apartamento: [false],
      casaPlaya: [false],
      industrial: [false],
      anualizado: [false],
      deposito: [''],
      mascotas: ['', [Validators.required]], // Valor enviado será 'si', 'no' o 'consultar'
      tamano: [''],
      fotos: [[], [Validators.required]]
    });
  }

  ngOnInit(): void {}

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
      if (url) URL.revokeObjectURL(url);
    });
    this.previewUrls = [];
    this.fotos = [];
  }

  mostrarErrores(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control?.errors) {
        console.log(`Campo ${key} tiene errores:`, control.errors);
      }
    });
  }

  publicarPropiedad(): void {
    this.formSubmitted = true;
    this.isLoading = true;

    if (this.formulario.invalid) {
      this.mostrarErrores();
      this.isLoading = false;
      Swal.fire('Error', 'Por favor completa todos los campos requeridos correctamente', 'error');
      return;
    }

    const formData = new FormData();
    const formValue = this.formulario.value;

    // Procesar todos los campos excepto 'fotos'
    Object.keys(formValue).forEach(key => {
      if (key !== 'fotos') {
        let value = formValue[key];
        
        // Conversión específica para campos booleanos
        if (typeof value === 'boolean') {
          value = value ? '1' : '0';
        } else if (value === null || value === undefined) {
          return; // Saltar valores nulos
        }
        
        formData.append(key, String(value)); // Asegurar que todo sea string
      }
    });

    // Añadir fotos
    this.fotos.forEach((file, index) => {
      formData.append(`fotos[${index}]`, file, file.name);
    });

    // Debug: Mostrar datos en consola
    console.log('Datos a enviar:', {
      ...formValue,
      fotos: this.fotos.map(f => f.name)
    });

    this.httpService.Service_Post('propiedades', formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          Swal.fire('Éxito', 'Propiedad publicada exitosamente', 'success').then(() => {
            this.router.navigate(['/dashboard']);
          });
        } else {
          Swal.fire('Error', response.message || 'Error al publicar la propiedad', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error completo:', err);
        
        if (err.status === 401) {
          Swal.fire('Sesión expirada', 'Por favor inicia sesión nuevamente.', 'warning');
        } else if (err.status === 422 && err.error.errors) {
          const errors = Object.values(err.error.errors).flat().join('\n');
          Swal.fire({
            title: 'Error de validación',
            html: `<pre>${errors}</pre>`,
            icon: 'error'
          });
        } else {
          Swal.fire('Error', err.error?.message || err.message || 'Error de conexión', 'error');
        }
      }
    });
  }

  get f() {
    return this.formulario.controls;
  }

  get fotosInvalid() {
    return (this.formSubmitted || this.f['fotos'].touched) && this.f['fotos'].invalid;
  }

  get mascotasInvalid() {
    const control = this.formulario.get('mascotas');
    return control?.invalid && (control?.touched || this.formSubmitted);
  }

  ngOnDestroy() {
    this.clearPreviewUrls();
  }
}