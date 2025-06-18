import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core'; // Añade AfterViewInit
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import * as L from 'leaflet'; // <-- Importa Leaflet aquí

@Component({
  selector: 'app-publicar',
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent implements OnInit, OnDestroy, AfterViewInit { // Implementa AfterViewInit
  formulario: FormGroup;
  fotos: File[] = [];
  previewUrls: (string | ArrayBuffer | null)[] = [];
  formSubmitted = false;
  isLoading = false;
  
  tiposDePropiedad: any[] = [];

  // Variables para Leaflet Map
  map!: L.Map;
  marker!: L.Marker;

  // Configuración para que Leaflet encuentre sus iconos predeterminados en la carpeta 'assets'
  // Si tus iconos no se muestran, asegúrate de tener las imágenes 
  // "marker-icon-2x.png", "marker-icon.png", "marker-shadow.png" en src/assets/
  // Puedes descargarlas de la carpeta node_modules/leaflet/dist/images/
  private defaultIcon = L.icon({
    iconRetinaUrl: 'assets/marker-icon-2x.png',
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });
  
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
      // AGREGAR: latitud y longitud para guardar las coordenadas del mapa
      latitud: ['', [Validators.required]], 
      longitud: ['', [Validators.required]],

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

  // Se llama después de que la vista del componente ha sido completamente inicializada
  ngAfterViewInit(): void {
    this.initMap(); // Inicializa el mapa de Leaflet
  }

  /**
   * Inicializa el mapa de Leaflet en el div con id "map".
   */
  initMap(): void {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      // Centrar el mapa en una ubicación inicial (ej. Ciudad de México)
      const initialCoords: L.LatLngExpression = [19.4326, -99.1332]; 

      this.map = L.map(mapElement).setView(initialCoords, 12); // Nivel de zoom inicial

      // Agrega una capa de tiles de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);

      // Crea el marcador con el icono por defecto
      this.marker = L.marker(initialCoords, {
        draggable: true, // Permite arrastrar el marcador
        icon: this.defaultIcon // Asigna el icono personalizado
      }).addTo(this.map);

      // Evento al hacer clic en el mapa: mueve el marcador y geocodifica
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.placeMarkerAndGeocode(e.latlng);
      });

      // Evento al arrastrar el marcador: actualiza la posición y geocodifica
      this.marker.on('dragend', (e: any) => {
        const latLng = e.target.getLatLng();
        this.placeMarkerAndGeocode(latLng);
      });

      // Rellena los campos iniciales de latitud y longitud
      this.formulario.patchValue({
        latitud: initialCoords[0], // Latitud
        longitud: initialCoords[1] // Longitud
      });
    } else {
      console.error('El elemento del mapa con id "map" no se encontró. Asegúrate de que el HTML esté cargado.');
    }
  }

  /**
   * Coloca el marcador en la ubicación dada y realiza la geocodificación inversa.
   * @param latLng Las coordenadas LatLng para el marcador.
   */
  placeMarkerAndGeocode(latLng: L.LatLng): void {
    this.marker.setLatLng(latLng);
    this.formulario.patchValue({
      latitud: latLng.lat,
      longitud: latLng.lng
    });
    this.geocodeLatLng(latLng);
  }

  /**
   * Realiza la geocodificación inversa utilizando la API de Nominatim de OpenStreetMap.
   * @param latlng Las coordenadas LatLng para geocodificar.
   */
  geocodeLatLng(latlng: L.LatLng): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.address) {
          const address = data.address;
          let fullAddress = data.display_name;

          // Intenta reconstruir una dirección más concisa si display_name es muy largo
          const parts = [];
          if (address.road) parts.push(address.road + (address.house_number ? ' ' + address.house_number : ''));
          if (address.suburb) parts.push(address.suburb);
          if (address.city) parts.push(address.city);
          else if (address.town) parts.push(address.town);
          else if (address.village) parts.push(address.village);
          if (address.state) parts.push(address.state);
          if (address.country) parts.push(address.country);

          if (parts.length > 0 && parts.join(', ').length < fullAddress.length) {
              fullAddress = parts.join(', ');
          }

          this.formulario.patchValue({
            direccion: fullAddress || '',
            pais: address.country || '',
            estado_ubicacion: address.state || address.state_district || '', // state, o state_district
            ciudad: address.city || address.town || address.village || '', // city, town o village
            colonia: address.suburb || address.neighbourhood || '' // suburb o neighbourhood
          });

        } else {
          Swal.fire('Error', 'No se encontraron resultados de dirección para la ubicación seleccionada.', 'warning');
          // Puedes limpiar los campos de dirección si no se encuentra nada
          this.formulario.patchValue({
            direccion: '',
            pais: '',
            estado_ubicacion: '',
            ciudad: '',
            colonia: ''
          });
        }
      })
      .catch(error => {
        Swal.fire('Error', 'Error al realizar la geocodificación inversa: ' + error.message, 'error');
        console.error('Error al geocodificar:', error);
        // En caso de error, también puedes limpiar los campos
        this.formulario.patchValue({
          direccion: '',
          pais: '',
          estado_ubicacion: '',
          ciudad: '',
          colonia: ''
        });
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
          this.router.navigate(['/principal/publicarCasa']); 
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
    // Destruye el mapa para liberar recursos cuando el componente se destruye
    if (this.map) {
      this.map.remove();
    }
  }
}