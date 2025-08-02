import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PropiedadesService } from '../../services/propiedad.service';
import { NotyfService } from '../../services/notyf.service';

@Component({
  selector: 'app-editar-propiedad',
  templateUrl: './editar-propiedad.component.html',
  styleUrls: ['./editar-propiedad.component.css']
})
export class EditarPropiedadComponent implements OnInit {

  formulario: FormGroup;
  isLoading = false;
  formSubmitted = false;
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
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      tipo_propiedad_id: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0)]],
      habitaciones: [null, [Validators.required, Validators.min(0)]],
      banos: [null, [Validators.required, Validators.min(0)]],
      metros_cuadrados: [null, [Validators.required, Validators.min(0)]],
      deposito: [null],
      amueblado: [false, Validators.required],
      anualizado: [false, Validators.required],
      mascotas: ['', Validators.required],
      estado_propiedad: ['', Validators.required],
      fotos: [null]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propiedadId = +id;
      this.cargarTiposDePropiedad();
      this.cargarDatosPropiedad();
    } else {
      console.error('No se encontró ID de propiedad en la ruta');
      this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
    }
  }

  cargarTiposDePropiedad(): void {
    this.propiedadesService.getTiposDePropiedad().subscribe({
      next: (data) => { this.tiposDePropiedad = data; },
      error: (error) => {
        console.error('Error cargando tipos de propiedad', error);
        Swal.fire('Error', 'No se pudieron cargar los tipos de propiedad.', 'error');
      }
    });
  }

  cargarDatosPropiedad(): void {
    this.isLoading = true;
    this.propiedadesService.getPropiedad(this.propiedadId).subscribe({
      next: (response: any) => {
        const data = response.data;
        this.formulario.patchValue({
          titulo: data.titulo,
          descripcion: data.descripcion,
          direccion: data.direccion,
          pais: data.pais,
          estado_ubicacion: data.estado_ubicacion,
          ciudad: data.ciudad,
          colonia: data.colonia,
          email: data.email,
          telefono: data.telefono,
          tipo_propiedad_id: data.tipo_propiedad_id,
          precio: data.precio,
          habitaciones: data.habitaciones,
          banos: data.banos,
          metros_cuadrados: data.metros_cuadrados,
          deposito: data.deposito,
          amueblado: !!data.amueblado,
          anualizado: !!data.anualizado,
          mascotas: data.mascotas,
          estado_propiedad: data.estado_propiedad,
        });

        if (data.fotos && Array.isArray(data.fotos)) {
          const storageUrl = 'http://127.0.0.1:8000/storage/';
          this.existingImages = data.fotos.map((path: string) => ({
            path: path,
            url: `${storageUrl}${path}`
          }));
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error cargando la propiedad', error);
        Swal.fire('Error', `No se pudo cargar la información de la propiedad. ${error.error?.message || ''}`, 'error');
        this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
      }
    });
  }

  get f() {
    return this.formulario.controls;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.newImageFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.newImagePreviews.push(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  removeNewImage(index: number): void {
    this.newImageFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  actualizarPropiedad(): void {
    this.formSubmitted = true;
    if (this.formulario.invalid) {
      Swal.fire('Formulario Incompleto', 'Por favor, revisa y completa todos los campos requeridos.', 'error');
      return;
    }

    this.isLoading = true;
    this.formulario.get('email')?.enable();
    const formData = new FormData();

    Object.entries(this.formulario.value).forEach(([key, value]) => {
      if (key !== 'fotos') {
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else {
            formData.append(key, value as string);
          }
        }
      }
    });

    this.newImageFiles.forEach(file => {
      formData.append('fotos[]', file);
    });

    const keptImagePaths = this.existingImages.map(img => img.path);
    formData.append('existing_fotos', JSON.stringify(keptImagePaths));

    this.propiedadesService.actualizarPropiedad(this.propiedadId, formData).subscribe({
  next: (response) => {
    this.isLoading = false;
    this.notyf.success('Propiedad actualizada exitosamente ');
    this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
  },
  error: (error) => {
    this.isLoading = false;
    console.error('Error al actualizar la propiedad', error);
    const mensajeError = error.error?.message || 'Error inesperado al guardar los cambios.';
    this.notyf.error(mensajeError);
  }
});
   
  }

  cancelarEdicion() {
    this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
  }

}
