import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PropiedadesService } from '../../../services/propiedad.service';
import { NotyfService } from '../../../services/notyf.service';

@Component({
  selector: 'app-editar-propiedad',
  templateUrl: './editar-propiedad.component.html',
  styleUrls: ['./editar-propiedad.component.css']
})
export class EditarPropiedadComponent implements OnInit {

  formulario: FormGroup;
  isLoading = true;
  tiposDePropiedad: any[] = [];
  propiedadId!: number;

  existingImages: { path: string, url: string }[] = [];
  newImageFiles: File[] = [];
  newImagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private propiedadesService: PropiedadesService,
    private notyf: NotyfService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      pais: ['', [Validators.required, Validators.maxLength(100)]],
      estado_ubicacion: ['', [Validators.required, Validators.maxLength(100)]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      colonia: [''],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      tipo_propiedad_id: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(1)]],
      habitaciones: [null, [Validators.required, Validators.min(1)]],
      banos: [null, [Validators.required, Validators.min(1)]],
      metros_cuadrados: [null, [Validators.required, Validators.min(1)]],
      deposito: [null],
      amueblado: [false, Validators.required],
      anualizado: [false, Validators.required],
      mascotas: ['', Validators.required],
      estado_propiedad: ['', Validators.required],
      // Se añade un validador personalizado para las fotos
      fotos: [null, [this.minimoImagenesValidator(5)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propiedadId = +id;
      this.cargarTiposDePropiedad();
      this.cargarDatosPropiedad();
    } else {
      this.notyf.error('No se encontró ID de propiedad en la ruta');
      this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
    }
  }

  // --- Getters y Validadores ---

  get f() { return this.formulario.controls; }

  minimoImagenesValidator(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const totalImagenes = this.existingImages.length + this.newImageFiles.length;
      if (totalImagenes < min) {
        return { 'minimoImagenes': { required: min, actual: totalImagenes } };
      }
      return null;
    };
  }

  // --- Carga de Datos ---
  cargarTiposDePropiedad(): void {
    this.propiedadesService.getTiposDePropiedad().subscribe({
      next: (data) => { this.tiposDePropiedad = data; },
      error: (error) => this.notyf.error('No se pudieron cargar los tipos de propiedad.')
    });
  }

  cargarDatosPropiedad(): void {
    this.isLoading = true;
    this.propiedadesService.getPropiedad(this.propiedadId).subscribe({
      next: (response: any) => {
        const data = response.data;
        this.formulario.patchValue(data);
        this.formulario.patchValue({
          amueblado: !!data.amueblado,
          anualizado: !!data.anualizado,
        });

        if (data.fotos && Array.isArray(data.fotos)) {
          const storageUrl = 'http://127.0.0.1:8000/storage/';
          this.existingImages = data.fotos.map((path: string) => ({
            path: path,
            url: `${storageUrl}${path}`
          }));
        }
        this.f['fotos'].updateValueAndValidity(); // Actualiza la validación de las fotos
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notyf.error(`No se pudo cargar la propiedad: ${error.error?.message || ''}`);
        this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
      }
    });
  }

  async convertImageToWebp(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.split('.')[0] + '.webp', { type: 'image/webp' });
              resolve(webpFile);
            } else {
              reject(new Error('Error al convertir la imagen a WebP.'));
            }
          }, 'image/webp', 0.8); // Calidad de compresión 0.8
        };
      };
    });
  }

  async onFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (const file of Array.from(input.files)) {
      try {
        const webpFile = await this.convertImageToWebp(file);
        this.newImageFiles.push(webpFile);

        const reader = new FileReader();
        reader.onload = () => this.newImagePreviews.push(reader.result as string);
        reader.readAsDataURL(webpFile);
      } catch (error) {
        console.error(error);
        this.notyf.error('No se pudo convertir una de las imágenes.');
      }
    }
    
    this.f['fotos'].updateValueAndValidity();
    input.value = '';
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
    this.f['fotos'].updateValueAndValidity();
  }

  removeNewImage(index: number): void {
    this.newImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
    this.f['fotos'].updateValueAndValidity();
  }

  // --- Acciones del Formulario ---

  actualizarPropiedad(): void {
    this.f['fotos'].markAsTouched();
    this.f['fotos'].updateValueAndValidity();

    if (this.formulario.invalid) {
      const errorFotos = this.f['fotos'].errors?.['minimoImagenes'];
      if (errorFotos) {
        Swal.fire('Faltan Imágenes', `Necesitas al menos ${errorFotos.required} imágenes en total. Actualmente tienes ${errorFotos.actual}.`, 'warning');
      } else {
        Swal.fire('Formulario Incompleto', 'Por favor, revisa y completa todos los campos requeridos.', 'error');
      }
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    Object.entries(this.formulario.value).forEach(([key, value]) => {
      if (key !== 'fotos' && value !== null && value !== undefined) {
        formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value as string);
      }
    });

    this.newImageFiles.forEach(file => formData.append('fotos[]', file));
    formData.append('existing_fotos', JSON.stringify(this.existingImages.map(img => img.path)));

    this.propiedadesService.actualizarPropiedad(this.propiedadId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.notyf.success('Propiedad actualizada exitosamente');
        this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
      },
      error: (error) => {
        this.isLoading = false;
        this.notyf.error(error.error?.message || 'Error inesperado al guardar los cambios.');
      }
    });
  }

  cancelarEdicion(): void {
    this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
  }
}
