import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as L from 'leaflet';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { AuthService } from '../../auth.service';
import { NotyfService } from '../../services/notyf.service';

@Component({
  selector: 'app-publicar',
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent implements OnInit, OnDestroy, AfterViewInit {
  formulario!: FormGroup;
  fotos: File[] = [];
  previewUrls: SafeUrl[] = [];
  formSubmitted = false;
  isLoading = false;
  tiposDePropiedad: any[] = [];
  map!: L.Map;
  marker!: L.Marker;
  userRole: string = '';

  private circleDivIcon = L.divIcon({
    className: 'custom-circle-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private notyfService: NotyfService
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.maxLength(255)]],
      pais: ['', [Validators.required, Validators.maxLength(100)]],
      estado_ubicacion: ['', [Validators.required, Validators.maxLength(100)]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      colonia: [''],
      latitud: ['', [Validators.required]],
      longitud: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.min(0)]],
      habitaciones: ['', [Validators.required, Validators.min(1)]],
      banos: ['', [Validators.required, Validators.min(1)]],
      metros_cuadrados: ['', [Validators.required, Validators.min(1)]],
      deposito: ['', [Validators.min(0)]],
      amueblado: [false, [Validators.required]],
      anualizado: [false, [Validators.required]],
      mascotas: ['', [Validators.required]],
      tipo_propiedad_id: ['', [Validators.required]],
      fotos: [null, [Validators.required]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
  }

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActualId();
    this.userRole = usuario?.role || '';

    if (usuario?.email) {
      this.formulario.patchValue({
        email: usuario.email
      });
    }

    this.httpService.getTiposDePropiedad().subscribe({
      next: (tipos) => {
        this.tiposDePropiedad = tipos;
      },
      error: (err) => {
        console.error('Error al cargar los tipos de propiedad', err);
        this.notyfService.error('No se pudieron cargar las categorías de propiedad.');
      }
    });

    combineLatest([
      this.formulario.get('direccion')!.valueChanges,
      this.formulario.get('pais')!.valueChanges,
      this.formulario.get('estado_ubicacion')!.valueChanges,
      this.formulario.get('ciudad')!.valueChanges,
      this.formulario.get('colonia')!.valueChanges
    ]).pipe(
      debounceTime(700),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(() => {
      this.triggerGeocodeAddress();
    });
  }

  ngAfterViewInit(): void {
    if (document.getElementById('map')) {
      this.initMap();
    } else {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy() {
    this.previewUrls.forEach(url => {
      const urlString = (url as any)['changingThisBreaksApplicationSecurity'];
      if (urlString) URL.revokeObjectURL(urlString);
    });
    if (this.map) {
      this.map.remove();
    }
  }

  initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    const initialCoords: L.LatLngExpression = [20.9133, -100.7412]; // San Miguel de Allende
    this.map = L.map('map').setView(initialCoords, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
    this.marker = L.marker(initialCoords, {
      icon: this.circleDivIcon,
      draggable: true
    }).addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.placeMarkerAndGeocode(e.latlng);
    });
    this.marker.on('dragend', (e: any) => {
      const latLng = e.target.getLatLng();
      this.placeMarkerAndGeocode(latLng);
    });
    this.formulario.patchValue({
      latitud: initialCoords[0],
      longitud: initialCoords[1]
    });
  }

  placeMarkerAndGeocode(latLng: L.LatLng): void {
    this.marker.setLatLng(latLng);
    this.map.setView(latLng, this.map.getZoom());
    this.formulario.patchValue({
      latitud: latLng.lat,
      longitud: latLng.lng
    }, { emitEvent: false });
    this.geocodeLatLng(latLng);
  }
  
  geocodeLatLng(latlng: L.LatLng): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data.address) {
          const address = data.address;
          this.formulario.patchValue({
            direccion: data.name || data.display_name || '',
            pais: address.country || '',
            estado_ubicacion: address.state || address.state_district || '',
            ciudad: address.city || address.town || address.village || '',
            colonia: address.suburb || address.neighbourhood || ''
          }, { emitEvent: false });
        } else {
          this.notyfService.warning('No se encontraron detalles para la ubicación.');
        }
      })
      .catch(error => {
        console.error('Error al geocodificar (reverse):', error);
        this.notyfService.error(`Error en geocodificación: ${error.message}.`);
      });
  }

  triggerGeocodeAddress(): void {
    const fullAddressQuery = [
      this.formulario.get('direccion')?.value,
      this.formulario.get('colonia')?.value,
      this.formulario.get('ciudad')?.value,
      this.formulario.get('estado_ubicacion')?.value,
      this.formulario.get('pais')?.value
    ].filter(part => part && part.trim() !== '').join(', ');

    if (fullAddressQuery.length > 5) {
      this.geocodeAddress(fullAddressQuery);
    }
  }

  geocodeAddress(address: string): void {
    if (!address) return;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (this.map && this.marker) {
            let newZoom = 15;
            this.map.setView([lat, lon], newZoom);
            this.marker.setLatLng([lat, lon]);
            this.formulario.patchValue({
              latitud: lat,
              longitud: lon
            }, { emitEvent: false });
          }
        } else {
          this.notyfService.warning('Dirección no encontrada. Intenta ser más específico.');
        }
      })
      .catch(error => {
        console.error('Error en geocodificación directa:', error);
        this.notyfService.error(`Error al buscar en mapa: ${error.message}.`);
      });
  }

  onFileChange(event: any): void {
  if (event.target.files && event.target.files.length > 0) {
    const files: File[] = Array.from(event.target.files);
    
    const processFile = (file: File): Promise<File> => {
      return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e: any) => {
          img.src = e.target.result;
        };
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 800;  // ancho máximo deseado
          const maxHeight = 600; // alto máximo deseado
          let width = img.width;
          let height = img.height;
          
          // Redimensionar manteniendo proporción
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
              resolve(compressedFile);
            } else {
              // fallback, si no hay blob, usar el original
              resolve(file);
            }
          }, 'image/jpeg', 0.7); // calidad 0.7 para compresión
        };
        reader.readAsDataURL(file);
      });
    };

    const compressedFilesPromises = files.map(file => processFile(file));
    Promise.all(compressedFilesPromises).then(compressedFiles => {
      compressedFiles.forEach(file => {
        if (!this.fotos.some(f => f.name === file.name && f.size === file.size)) {
          this.fotos.push(file);
          this.previewUrls.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)));
        }
      });
      this.formulario.patchValue({ fotos: this.fotos });
      this.formulario.get('fotos')?.updateValueAndValidity();
    });
  }
  event.target.value = '';
}


  removePhoto(index: number): void {
    const urlToRemove = this.previewUrls[index] as any;
    URL.revokeObjectURL(urlToRemove.changingThisBreaksApplicationSecurity);
    this.fotos.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.formulario.patchValue({ fotos: this.fotos });
    this.formulario.get('fotos')?.updateValueAndValidity();
  }

  publicarPropiedad(): void {
    if (this.userRole === 'inquilino') {
      this.notyfService.error('Los inquilinos no pueden publicar propiedades.');
      return;
    }

    this.formSubmitted = true;
    if (this.fotos.length < 5) {
      this.formulario.get('fotos')?.setErrors({ minPhotos: true });
    } else if (this.fotos.length > 15) {
      this.formulario.get('fotos')?.setErrors({ maxPhotos: true });
    } else {
      this.formulario.get('fotos')?.setErrors(null);
    }

    if (this.f['mascotas'].value === '') this.f['mascotas'].setErrors({ 'required': true });

    if (this.formulario.invalid) {
      this.notyfService.error('Por favor, completa todos los campos requeridos correctamente.');
      Object.values(this.formulario.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    this.formulario.get('email')?.enable();
    const formValue = this.formulario.value;
    this.formulario.get('email')?.disable();

    Object.keys(formValue).forEach(key => {
      if (key !== 'fotos' && formValue[key] !== null && formValue[key] !== '') {
        let value = formValue[key];
        if (typeof value === 'boolean') value = value ? '1' : '0';
        formData.append(key, String(value));
      }
    });
    this.fotos.forEach((file) => formData.append(`fotos[]`, file, file.name));

    this.httpService.Service_Post('propiedades', formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notyfService.success('¡Propiedad publicada correctamente!');
        this.router.navigate(['/principal/gestion-propiedades/mis-propiedades']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al publicar:', err);
        if (err.status === 422 && err.error.errors) {
          const errors = Object.values(err.error.errors).flat().join('<br>');
          this.notyfService.error(errors);
        } else {
          this.notyfService.error(err.error?.message || 'Ocurrió un error inesperado.');
        }
      }
    });
  }

  get f() {
    return this.formulario.controls;
  }
get fotosErrorMessage() {
  const fotosControl = this.formulario.get('fotos');
  if (!fotosControl) return '';
  if (fotosControl.hasError('required')) return 'Debes subir al menos 5 imágenes.';
  if (fotosControl.hasError('minPhotos')) return 'Debes subir al menos 5 imágenes.';
  if (fotosControl.hasError('maxPhotos')) return 'No puedes subir más de 15 imágenes.';
  return '';
}

  get fotosInvalid() {
    return (this.formSubmitted || this.f['fotos'].touched) && this.fotos.length === 0;
  }

  get mascotasInvalid() {
    return this.f['mascotas'].invalid && (this.f['mascotas'].touched || this.formSubmitted);
  }
}
