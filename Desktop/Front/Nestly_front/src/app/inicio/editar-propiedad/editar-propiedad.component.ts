import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PropiedadesService } from '../../services/propiedad.service';

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

  // Estados para manejar las imágenes de forma avanzada
  // Guarda las imágenes que ya venían del servidor { path, url }
  existingImages: { path: string, url: string }[] = [];
  // Guarda los archivos nuevos que el usuario selecciona
  newImageFiles: File[] = [];
  // Guarda las previsualizaciones de los archivos nuevos
  newImagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private propiedadesService: PropiedadesService,
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
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
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
      // El control 'fotos' ya no es necesario para la lógica de archivos, pero lo dejamos para no romper el formGroup
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
      this.router.navigate(['/mis-propiedades']);
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
          mascotas: data.mascotas
        });

        // Llenamos la lista de imágenes existentes desde el servidor
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
        this.router.navigate(['/verPropiedades']);
      }
    });
  }

  get f() {
    return this.formulario.controls;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    // Añade los nuevos archivos a nuestra lista de archivos
    Array.from(input.files).forEach(file => {
      this.newImageFiles.push(file);

      // Crea las previsualizaciones para los nuevos archivos
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.newImagePreviews.push(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    });

    // Limpiamos el valor del input para permitir seleccionar el mismo archivo otra vez si se borra
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
    const formData = new FormData();

    // 1. Añade los datos del formulario (título, descripción, etc.)
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

    // 2. Añade las FOTOS NUEVAS al FormData
    this.newImageFiles.forEach(file => {
      formData.append('fotos[]', file);
    });

    // 3. Añade la LISTA DE FOTOS EXISTENTES QUE QUEREMOS CONSERVAR
    const keptImagePaths = this.existingImages.map(img => img.path);
    formData.append('existing_fotos', JSON.stringify(keptImagePaths));

    // 4. Llama al servicio para actualizar
    this.propiedadesService.actualizarPropiedad(this.propiedadId, formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire('¡Propiedad Actualizada!', 'Los cambios se han guardado exitosamente.', 'success');
        this.router.navigate(['/verPropiedades']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al actualizar la propiedad', error);
        const mensajeError = error.error?.message || 'Ocurrió un error inesperado al guardar los cambios.';
        Swal.fire('Error', mensajeError, 'error');
      }
    });
  }

  cancelarEdicion() {
this.router.navigate(['/principal/verPropiedades']);
}


}