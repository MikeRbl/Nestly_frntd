import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-publicar',
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent implements OnInit, OnDestroy, AfterViewInit {
  formulario!: FormGroup; // Usamos '!' para indicar que se inicializará en el constructor
  fotos: File[] = [];
  previewUrls: (string | ArrayBuffer | null)[] = [];
  formSubmitted = false;
  isLoading = false;

  tiposDePropiedad: any[] = [];

  map!: L.Map;
  marker!: L.Marker;

  // Definimos el icono personalizado para que parezca un círculo
  private circleDivIcon = L.divIcon({
    className: 'custom-circle-icon', // Clase CSS para el estilo
    iconSize: [20, 20], // Tamaño del div
    iconAnchor: [10, 10] // Centro del div
  });

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
      estado_ubicacion: ['', [Validators.required, Validators.maxLength(100)]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      colonia: [''], // Colonia no es obligatoria
      latitud: ['', [Validators.required]], // Mantenemos requerido, pero se llena automáticamente
      longitud: ['', [Validators.required]], // Mantenemos requerido, pero se llena automáticamente
      precio: ['', [Validators.required, Validators.min(0)]],
      habitaciones: ['', [Validators.required, Validators.min(0)]],
      banos: ['', [Validators.required, Validators.min(0)]],
      metros_cuadrados: ['', [Validators.required, Validators.min(0)]],
      deposito: [''],
      amueblado: [false, [Validators.required]],
      anualizado: [false, [Validators.required]],
      mascotas: ['', [Validators.required]], // '0' o '1'
      tipo_propiedad_id: ['', [Validators.required]],
      fotos: [[], [Validators.required]], // Se validará manualmente en onFileChange
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
    });
  }

  ngOnInit(): void {
    this.httpService.getTiposDePropiedad().subscribe({
      next: (tipos) => {
        this.tiposDePropiedad = tipos;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de propiedad', err);
        Swal.fire('Error', 'No se pudieron cargar las categorías de propiedad. Inténtalo de nuevo más tarde.', 'error');
      }
    });

    // Suscripción combinada para todos los campos de dirección
    combineLatest([
      this.formulario.get('direccion')!.valueChanges,
      this.formulario.get('pais')!.valueChanges,
      this.formulario.get('estado_ubicacion')!.valueChanges,
      this.formulario.get('ciudad')!.valueChanges,
      this.formulario.get('colonia')!.valueChanges
    ]).pipe(
      // Espera 700ms antes de emitir, para evitar llamadas excesivas a la API
      debounceTime(700),
      // Solo emite si la combinación de valores ha cambiado
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(() => {
      this.triggerGeocodeAddress();
    });
  }

  ngAfterViewInit(): void {
    // Asegurarse de que el DOM esté completamente cargado antes de inicializar el mapa
    // y que el elemento 'map' esté presente.
    if (document.getElementById('map')) {
      this.initMap();
    } else {
      console.warn('El elemento #map no está disponible en el DOM. Reintentando en 100ms...');
      // Si el mapa no está listo, intentarlo de nuevo después de un breve retraso
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy() {
    this.clearPreviewUrls();
    if (this.map) {
      this.map.remove(); // Limpiar el mapa al destruir el componente
    }
  }

  /**
   * Inicializa el mapa de Leaflet en el div con id "map".
   */
  initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    const initialCoords: L.LatLngExpression = [20.9133, -100.7412]; // Coordenadas de San Miguel de Allende

    this.map = L.map('map').setView(initialCoords, 12); // Zoom inicial más amplio

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Creamos un L.Marker con nuestro divIcon personalizado y lo hacemos arrastrable
    this.marker = L.marker(initialCoords, {
      icon: this.circleDivIcon,
      draggable: true
    }).addTo(this.map);

    // Evento de click en el mapa para mover el marcador
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarkerAndGeocode(e.latlng);
    });

    // Evento de arrastrar el marcador para actualizar coordenadas y dirección
    this.marker.on('dragend', (e: any) => {
      const latLng = e.target.getLatLng();
      this.placeMarkerAndGeocode(latLng);
    });

    // Actualizar el formulario con las coordenadas iniciales del mapa
    this.formulario.patchValue({
      latitud: initialCoords[0],
      longitud: initialCoords[1]
    });
  }

  /**
   * Coloca el marcador en la ubicación dada y realiza la geocodificación inversa.
   * @param latLng Las coordenadas LatLng para el marcador.
   */
  placeMarkerAndGeocode(latLng: L.LatLng): void {
    this.marker.setLatLng(latLng);
    this.map.setView(latLng, this.map.getZoom()); // Mantener el zoom actual al arrastrar/clicar
    this.formulario.patchValue({
      latitud: latLng.lat,
      longitud: latLng.lng
    }, { emitEvent: false }); // No emitir evento para evitar bucle con geocodeAddress
    this.geocodeLatLng(latLng);
  }

  /**
   * Realiza la geocodificación inversa utilizando la API de Nominatim de OpenStreetMap.
   * Convierte coordenadas (lat/lng) a una dirección legible.
   * @param latlng Las coordenadas LatLng para geocodificar.
   */
  geocodeLatLng(latlng: L.LatLng): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.address) {
          const address = data.address;

          // Intentar construir una dirección completa más limpia
          let fullAddressParts: string[] = [];
          if (address.road) fullAddressParts.push(address.road + (address.house_number ? ' ' + address.house_number : ''));
          if (address.postcode) fullAddressParts.push(address.postcode); // Código postal
          if (address.suburb) fullAddressParts.push(address.suburb);
          if (address.city) fullAddressParts.push(address.city);
          else if (address.town) fullAddressParts.push(address.town);
          else if (address.village) fullAddressParts.push(address.village);
          if (address.state) fullAddressParts.push(address.state);
          if (address.country) fullAddressParts.push(address.country);

          const formattedAddress = fullAddressParts.join(', ');

          this.formulario.patchValue({
            // Usamos el 'name' o 'display_name' de Nominatim para la dirección general, o nuestra propia construcción
            direccion: data.name || data.display_name || formattedAddress || '',
            pais: address.country || '',
            estado_ubicacion: address.state || address.state_district || '',
            ciudad: address.city || address.town || address.village || '',
            colonia: address.suburb || address.neighbourhood || ''
          }, { emitEvent: false }); // No emitir evento para evitar bucles de geocodificación
        } else {
          Swal.fire('Información', 'No se encontraron resultados de dirección detallados para la ubicación seleccionada.', 'info');
          // Limpiar campos de dirección si no se encuentra nada
          this.formulario.patchValue({
            direccion: '', pais: '', estado_ubicacion: '', ciudad: '', colonia: ''
          }, { emitEvent: false });
        }
      })
      .catch(error => {
        Swal.fire('Error', `Error al realizar la geocodificación inversa: ${error.message}. Por favor, inténtalo de nuevo.`, 'error');
        console.error('Error al geocodificar (reverse):', error);
        // Limpiar campos de dirección en caso de error
        this.formulario.patchValue({
          direccion: '', pais: '', estado_ubicacion: '', ciudad: '', colonia: ''
        }, { emitEvent: false });
      });
  }

  /**
   * Combina los campos de dirección del formulario y llama a geocodeAddress.
   * Se dispara al cambiar los campos de dirección.
   */
  triggerGeocodeAddress(): void {
    const direccion = this.formulario.get('direccion')?.value || '';
    const pais = this.formulario.get('pais')?.value || '';
    const estado = this.formulario.get('estado_ubicacion')?.value || '';
    const ciudad = this.formulario.get('ciudad')?.value || '';
    const colonia = this.formulario.get('colonia')?.value || '';

    const fullAddressQuery = [direccion, colonia, ciudad, estado, pais]
      .filter(part => part && part.trim() !== '')
      .join(', ');

    // Solo intentar geocodificar si hay una cadena de dirección significativa
    if (fullAddressQuery.length > 5) { // Un mínimo de caracteres para evitar llamadas vacías
      this.geocodeAddress(fullAddressQuery);
    }
  }

  /**
   * Realiza la geocodificación directa: convierte una dirección de texto a coordenadas.
   * Utiliza Nominatim de OpenStreetMap.
   * @param address La dirección de texto a geocodificar.
   */
  geocodeAddress(address: string): void {
    if (!address) {
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          if (this.map && this.marker) {
            // Ajustar el zoom de forma más "generosa" según la especificidad de la dirección
            let newZoom = 8; // Zoom predeterminado si es solo país/estado
            if (this.formulario.get('ciudad')?.value && this.formulario.get('ciudad')?.value.trim() !== '') {
              newZoom = 11; // Si hay ciudad
            }
            if (this.formulario.get('colonia')?.value && this.formulario.get('colonia')?.value.trim() !== '') {
              newZoom = 13; // Si hay colonia
            }
            if (this.formulario.get('direccion')?.value && this.formulario.get('direccion')?.value.trim() !== '') {
              newZoom = 15; // Si hay dirección completa
            }

            this.map.setView([lat, lon], newZoom);
            this.marker.setLatLng([lat, lon]);
            this.formulario.patchValue({
              latitud: lat,
              longitud: lon
            }, { emitEvent: false }); // No emitir evento para evitar bucle de geocodificación
          }
        } else {
          console.warn('Dirección no encontrada por Nominatim:', address);
          Swal.fire('Información', 'No se pudo encontrar la dirección en el mapa. Por favor, sé más específico o ajusta manualmente el marcador.', 'info');
          // Limpiar lat/lng si no se encuentra la dirección
          this.formulario.patchValue({
            latitud: '',
            longitud: ''
          }, { emitEvent: false });
        }
      })
      .catch(error => {
        console.error('Error en geocodificación directa:', error);
        Swal.fire('Error', `Ocurrió un problema al buscar la dirección en el mapa: ${error.message}. Inténtalo de nuevo.`, 'error');
        // Limpiar lat/lng en caso de error
        this.formulario.patchValue({
          latitud: '',
          longitud: ''
        }, { emitEvent: false });
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
      if (url && typeof url === 'string') URL.revokeObjectURL(url);
    });
    this.previewUrls = [];
    this.fotos = [];
  }

  publicarPropiedad(): void {
    this.formSubmitted = true;

    // Asegurarse de que el control de fotos se valide correctamente
    if (this.fotos.length === 0) {
      this.formulario.get('fotos')?.setErrors({ required: true });
    } else {
      this.formulario.get('fotos')?.setErrors(null);
    }

    // Asegurarse de que el control de mascotas se valide correctamente para los toggles
    if (this.f['mascotas'].value === null || this.f['mascotas'].value === undefined || this.f['mascotas'].value === '') {
      this.f['mascotas'].setErrors({ 'required': true });
    } else {
      this.f['mascotas'].setErrors(null);
    }

    if (this.formulario.invalid) {
      this.isLoading = false;
      Swal.fire('Error', 'Por favor completa todos los campos requeridos correctamente.', 'error');
      // Marcar todos los controles como 'touched' para mostrar los mensajes de error
      Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.formulario.value;

    Object.keys(formValue).forEach(key => {
      if (key !== 'fotos') {
        let value = formValue[key];

        // Convertir booleanos a '1' o '0' si es necesario para el backend
        if (typeof value === 'boolean') {
          value = value ? '1' : '0';
        }

        if (value !== null && value !== undefined && value !== '') { // Evitar enviar campos vacíos si no son requeridos
          formData.append(key, String(value));
        }
      }
    });

    this.fotos.forEach((file) => {
      formData.append(`fotos[]`, file, file.name);
    });

    this.httpService.Service_Post('propiedades', formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire('¡Éxito!', 'Propiedad publicada correctamente.', 'success').then(() => {
          this.router.navigate(['/principal/verPropiedades']);
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

  get f() {
    return this.formulario.controls;
  }

  get fotosInvalid() {
    return (this.formSubmitted || this.f['fotos'].touched) && this.f['fotos'].invalid;
  }

  get mascotasInvalid() {
    return this.f['mascotas'].invalid && (this.f['mascotas'].touched || this.formSubmitted);
  }
}