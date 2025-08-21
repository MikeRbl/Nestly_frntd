import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

// --- Servicios ---
import { HttpLavavelService } from '../../http.service';
import { ResenaService } from '../../services/resena.service';
import { AuthService } from '../../auth.service';
import { NotyfService } from '../../services/notyf.service';
import { PropiedadesService } from '../../services/propiedad.service';

// --- Interfaces ---
import { Propiedad } from '../../interface/propiedades.interface';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-alquilar-casa',
  templateUrl: './alquilar-casa.component.html',
  styleUrls: ['./alquilar-casa.component.css']
})
export class AlquilarCasaComponent implements OnInit {
  property: Propiedad | null = null;
  isLoading = true;
  errorMessage = '';
  propertyId: string | null = null;
  allImages: string[] = [];
  mainImage = 'assets/default-property.jpg';
  resenas: any[] = [];
  isLoadingResenas = true;
  usuarioActual: any = null;
  favoritoIds = new Set<number>();
  isUserLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpLavavelService,
    private router: Router,
    private resenaService: ResenaService,
    private authService: AuthService,
    private notyf: NotyfService,
    private propiedadesService: PropiedadesService,
    private reporteService: ReporteService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActualId();
    this.propertyId = this.route.snapshot.paramMap.get('id');
    this.isUserLoggedIn = this.authService.isLoggedIn();
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
      this.loadResenas(Number(this.propertyId));
    } else {
      this.errorMessage = 'ID de propiedad no proporcionado';
      this.isLoading = false;
    }
  }

   abrirModalReporte(): void {
    if (!this.isUserLoggedIn) {
        this.notyf.error('Debes iniciar sesión para reportar una propiedad.');
        return;
    }

    Swal.fire({
      title: 'Reportar esta propiedad',
      html: `
        <select id="motivo-reporte" class="swal2-select" placeholder="Selecciona un motivo">
          <option value="" disabled selected>Selecciona un motivo</option>
          <option value="Información Falsa">Información Falsa o Engañosa</option>
          <option value="Estafa Potencial">Estafa Potencial</option>
          <option value="Contenido Inapropiado">Contenido o Fotos Inapropiadas</option>
          <option value="No responde">El propietario no responde</option>
          <option value="Otro">Otro</option>
        </select>
        <textarea id="descripcion-reporte" class="swal2-textarea" placeholder="Describe el problema detalladamente (opcional)"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Reporte',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      preConfirm: () => {
        const motivo = (document.getElementById('motivo-reporte') as HTMLSelectElement).value;
        const descripcion = (document.getElementById('descripcion-reporte') as HTMLTextAreaElement).value;
        if (!motivo) {
          Swal.showValidationMessage('Por favor, selecciona un motivo para el reporte.');
          return false;
        }
        return { motivo, descripcion };
      }
    }).then((result) => {
      if (result.isConfirmed && this.property) {
        const reporteData = {
          reportable_id: this.property.id_propiedad,
          reportable_type: 'App\\Models\\Propiedad',
          motivo: result.value.motivo,
          descripcion: result.value.descripcion
        };

        this.reporteService.crearReporte(reporteData).subscribe({
          next: () => {
            this.notyf.success('Reporte enviado. Gracias por tu ayuda.');
          },
          error: (err) => {
            console.error('Error al crear el reporte:', err);
            this.notyf.error(err.error.message || 'No se pudo enviar tu reporte.');
          }
        });
      }
    });
  }
  abrirModalReportePropietario(): void {
  // Verifica que el usuario esté logueado y que no sea el mismo propietario
  if (!this.isUserLoggedIn || this.usuarioActual?.id === this.property?.propietario?.id) {
    this.notyf.error('No puedes reportar a este usuario.');
    return;
  }

  Swal.fire({
    title: `Reportar a ${this.property?.propietario?.first_name}`,
    html: `
      <select id="motivo-reporte-usuario" class="swal2-select" placeholder="Selecciona un motivo">
        <option value="" disabled selected>Selecciona un motivo</option>
        <option value="Comportamiento Ofensivo">Comportamiento Ofensivo o Acoso</option>
        <option value="Spam">Spam o Publicidad no deseada</option>
        <option value="Perfil Falso">Perfil Falso o Suplantación de Identidad</option>
        <option value="Intento de Estafa">Intento de Estafa</option>
        <option value="Otro">Otro</option>
      </select>
      <textarea id="descripcion-reporte-usuario" class="swal2-textarea" placeholder="Describe el problema (opcional)"></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar Reporte',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    preConfirm: () => {
      const motivo = (document.getElementById('motivo-reporte-usuario') as HTMLSelectElement).value;
      if (!motivo) {
        Swal.showValidationMessage('Por favor, selecciona un motivo para el reporte.');
        return false;
      }
      const descripcion = (document.getElementById('descripcion-reporte-usuario') as HTMLTextAreaElement).value;
      return { motivo, descripcion };
    }
  }).then((result) => {
    if (result.isConfirmed && this.property?.propietario) {
      const reporteData = {
        reportable_id: this.property.propietario.id,
        reportable_type: 'App\\Models\\User', // El tipo de modelo para un usuario
        motivo: result.value.motivo,
        descripcion: result.value.descripcion
      };

      this.reporteService.crearReporte(reporteData).subscribe({
        next: () => {
          this.notyf.success('Reporte enviado. Gracias por tu ayuda.');
        },
        error: (err) => {
          console.error('Error al crear el reporte:', err);
          this.notyf.error(err.error.message || 'No se pudo enviar tu reporte.');
        }
      });
    }
  });
}

  loadProperty(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.httpService.Service_Get(`propiedades/${id}`).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.property = this.processProperty(response.data);
          this.setupImages();
        } else {
          this.errorMessage = 'Propiedad no encontrada.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar la propiedad.';
        this.isLoading = false;
      }
    });
  }

  cargarIdsFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => {
        this.favoritoIds = new Set(response.data);
      },
      error: (err) => console.error('Error al cargar IDs de favoritos:', err)
    });
  }

  toggleFavorito(propiedad: Propiedad, event?: MouseEvent): void {
    event?.stopPropagation();
    if (!this.isUserLoggedIn) {
      Swal.fire({
        title: '¡Inicia sesión para guardar!',
        text: 'Necesitas una cuenta para añadir esta propiedad a tus favoritos.',
        icon: 'info',
        showDenyButton: true,
        confirmButtonText: 'Iniciar Sesión',
        denyButtonText: 'Crear Cuenta',
      }).then((result) => {
        if (result.isConfirmed) this.router.navigate(['/login']);
        else if (result.isDenied) this.router.navigate(['/register']);
      });
      return;
    }

    const propiedadId = propiedad.id_propiedad;
    const esFavorito = this.favoritoIds.has(propiedadId);

    if (esFavorito) {
      this.propiedadesService.quitarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.delete(propiedadId);
          this.notyf.success('Eliminado de favoritos');
        },
        error: () => this.notyf.error('Error al quitar favorito.')
      });
    } else {
      this.propiedadesService.agregarFavorito(propiedadId).subscribe({
        next: () => {
          this.favoritoIds.add(propiedadId);
          this.notyf.success('Agregado a favoritos');
        },
        error: () => this.notyf.error('Error al agregar favorito.')
      });
    }
  }

  loadResenas(propiedadId: number): void {
    this.isLoadingResenas = true;
    this.resenaService.getResenas(propiedadId).subscribe({
      next: (response) => {
        this.resenas = response.data.map((resena: any) => ({
          ...resena,
          likedByCurrentUser: resena.likedByCurrentUser ?? false
        }));
        this.isLoadingResenas = false;
      },
      error: (err) => {
        console.error('Error al cargar resenas:', err);
        this.notyf.error('No se pudieron cargar las reseñas.');
        this.isLoadingResenas = false;
      }
    });
  }

  onCrearResena(formData: { puntuacion: number, comentario: string }): void {
    if (!this.property) return;
    this.resenaService.createResena(this.property.id_propiedad, formData).subscribe({
      next: (resenaCreada) => {
        this.resenas.unshift(resenaCreada);
        this.notyf.success('Tu reseña ha sido publicada.');
      },
      error: (err) => {
        this.notyf.error(err.error.message || 'No se pudo crear la reseña');
      }
    });
  }

  onEliminarResena(resenaId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, ¡eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resenaService.deleteResena(resenaId).subscribe({
          next: () => {
            this.resenas = this.resenas.filter(r => r.id !== resenaId);
            this.notyf.success('La reseña ha sido eliminada.');
          },
          error: (err) => {
            this.notyf.error('No se pudo eliminar la reseña.');
          }
        });
      }
    });
  }

  onToggleVoto(resenaId: number): void {
    this.resenaService.toggleVoto(resenaId).subscribe({
      next: (response) => {
        const resena = this.resenas.find(r => r.id === resenaId);
        if (resena) {
          resena.votos_count = response.votos_count;
          resena.likedByCurrentUser = !resena.likedByCurrentUser;
        }
      },
      error: () => {
        this.notyf.error('No se pudo procesar tu voto.');
      }
    });
  }

  onEditarResena(resenaId: number): void {
    const resenaAEditar = this.resenas.find(r => r.id === resenaId);
    if (!resenaAEditar) return;

    Swal.fire({
      title: 'Editar tu reseña',
      html: `
        <div class="flex justify-center my-4">
          ${[1, 2, 3, 4, 5].map(star => `
            <svg class="w-8 h-8 cursor-pointer star" data-rating="${star}" fill="${star <= resenaAEditar.puntuacion ? 'currentColor' : 'none'}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path class="text-yellow-400" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          `).join('')}
        </div>
        <textarea id="comentario-resena" class="swal2-textarea" placeholder="Escribe tu reseña aquí...">${resenaAEditar.comentario}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const stars = (Swal.getHtmlContainer() as HTMLElement).querySelectorAll('.star');
        let currentRating = resenaAEditar.puntuacion;

        stars.forEach(star => {
          star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-rating') || '0');
            updateStars(currentRating);
          });
        });

        function updateStars(rating: number) {
          stars.forEach(s => {
            const starRating = parseInt(s.getAttribute('data-rating') || '0');
            s.setAttribute('fill', starRating <= rating ? 'currentColor' : 'none');
          });
        }
      },
      preConfirm: () => {
        const stars = (Swal.getHtmlContainer() as HTMLElement).querySelectorAll('.star');
        const puntuacion = Array.from(stars).filter(s => s.getAttribute('fill') === 'currentColor').length;
        const comentario = (document.getElementById('comentario-resena') as HTMLTextAreaElement).value;
        
        if (puntuacion === 0) {
          Swal.showValidationMessage('Por favor, selecciona una puntuación.');
          return false;
        }
        return { puntuacion, comentario };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = result.value;
        this.resenaService.updateResena(resenaId, updatedData).subscribe({
          next: (resenaActualizada) => {
            const index = this.resenas.findIndex(r => r.id === resenaId);
            if (index !== -1) {
              this.resenas[index] = resenaActualizada;
            }
            this.notyf.success('Reseña actualizada correctamente.');
          },
          error: (err) => {
            this.notyf.error(err.error.message || 'No se pudo actualizar la reseña.');
          }
        });
      }
    });
  }

  get reviewCount(): number {
    return this.resenas.length;
  }

  rentarAhora() {
    if (this.property && this.property.id_propiedad) {
      this.router.navigate(['/principal/pagos', this.property.id_propiedad]);
    } else {
      this.notyf.error('No se pudo encontrar la información de la propiedad para rentar.');
    }
  }
  
  get averageRating(): number {
    if (this.reviewCount === 0) return 0;
    const totalPuntuacion = this.resenas.reduce((sum, resena) => sum + resena.puntuacion, 0);
    return Math.round((totalPuntuacion / this.reviewCount) * 10) / 10;
  }

  private processProperty(propertyData: any): Propiedad {
    return propertyData as Propiedad;
  }

  private setupImages(): void {
    if (!this.property || !this.property.fotos) return;
    const baseUrl = 'http://127.0.0.1:8000';
    const buildUrl = (path: string) => path.startsWith('http') ? path : `${baseUrl}/storage/${path}`;
    
    let images: string[] = [];
    if (this.property.imagen_principal) {
      images.push(buildUrl(this.property.imagen_principal));
    }
    if (Array.isArray(this.property.fotos)) {
      images = images.concat(this.property.fotos.map(buildUrl));
    }
    
    this.allImages = [...new Set(images)];
    this.mainImage = this.allImages[0] || 'assets/default-property.jpg';
  }

  changeMainImage(img: string): void {
    this.mainImage = img;
  }

  getTotalPrice(): number {
    return this.property ? this.property.precio * 1.1 : 0;
  }

  getFullImageUrl(path?: string, defaultImg: string = 'assets/default-profile.png'): string {
    if (!path || path.trim() === '') return defaultImg;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }

  retryLoad(): void {
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
    }
  }

  goBack() {
    window.history.back();
  }
}