import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

// --- Servicios ---
import { HttpLavavelService } from '../../http.service';
import { ResenaService } from '../../services/resena.service';
import { AuthService } from '../../auth.service';
import { NotyfService } from '../../services/notyf.service'; // Importamos el nuevo servicio Notyf

// --- Interfaces ---
import { Propiedad } from '../../interface/propiedades.interface';

@Component({
  selector: 'app-alquilar-casa',
  templateUrl: './alquilar-casa.component.html',
  styleUrls: ['./alquilar-casa.component.css']
})
export class AlquilarCasaComponent implements OnInit {
  // --- Propiedades para la vista de la propiedad ---
  property: Propiedad | null = null;
  isLoading = true;
  errorMessage = '';
  propertyId: string | null = null;
  allImages: string[] = []; 
  mainImage = 'assets/default-property.jpg';
  
  // --- Propiedades para las reseñas y el usuario ---
  resenas: any[] = []; 
  isLoadingResenas = true;
  usuarioActual: any = null;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpLavavelService,
    private router: Router,
    private resenaService: ResenaService,
    private authService: AuthService,
    private notyf: NotyfService // Inyectamos NotyfService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActualId(); 
    this.propertyId = this.route.snapshot.paramMap.get('id');
    
    if (this.propertyId) {
      this.loadProperty(this.propertyId);
      this.loadResenas(Number(this.propertyId));
    } else {
      this.errorMessage = 'ID de propiedad no proporcionado';
      this.isLoading = false;
    }
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

  // ================================================================
  // --- MÉTODOS PARA LA GESTIÓN DE RESEÑAS CON NOTYF ---
  // ================================================================

  loadResenas(propiedadId: number): void {
    this.isLoadingResenas = true;
    this.resenaService.getResenas(propiedadId).subscribe({
      next: (response) => {
        this.resenas = response.data.map((resena: any) => ({
        ...resena,
        likedByCurrentUser: resena.likedByCurrentUser ?? false  // <- Aquí se asegura que esté definido
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
    // Mantenemos Swal para la confirmación de acciones críticas
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

  if (!resenaAEditar) {
    this.notyf.error('No se pudo encontrar la reseña para editar.');
    return;
  }
  let selectedRating = resenaAEditar.puntuacion;
const comentarioLimpio = resenaAEditar.comentario && resenaAEditar.comentario !== 'null' ? resenaAEditar.comentario : '';

Swal.fire({
  title: 'Editar tu Reseña',
  html: `
    <div class="swal2-stars" style="display: flex; justify-content: center; gap: 5px; margin-bottom: 1rem;">
      ${[1, 2, 3, 4, 5].map(star => `
        <svg data-rating="${star}" class="w-8 h-8 cursor-pointer text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      `).join('')}
    </div>
    <textarea id="swal-comentario" class="swal2-textarea" placeholder="Escribe tu comentario aquí...">${comentarioLimpio}</textarea>
  `,
  showCancelButton: true,
confirmButtonText: 'Guardar Cambios',
  cancelButtonText: 'Cancelar',
  customClass: {
      confirmButton: 'bg-pink-400 hover:bg-pink-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors',
      cancelButton: 'bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors'
    },
  didOpen: () => {
    const stars = document.querySelectorAll('.swal2-stars svg');

    const updateStars = (rating: number) => {
      stars.forEach(star => {
        const starRating = Number(star.getAttribute('data-rating'));
        star.classList.toggle('text-yellow-400', starRating <= rating);
        star.classList.toggle('text-gray-300', starRating > rating);
      });
    };

    updateStars(selectedRating);

    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = Number(star.getAttribute('data-rating'));
        updateStars(selectedRating);
      });
      star.addEventListener('mouseover', () => {
        updateStars(Number(star.getAttribute('data-rating')));
      });
    });

    document.querySelector('.swal2-stars')?.addEventListener('mouseleave', () => {
      updateStars(selectedRating);
    });
  },
preConfirm: () => {
  const comentario = (document.getElementById('swal-comentario') as HTMLTextAreaElement).value.trim();

  if (!selectedRating || selectedRating === 0) {
    Swal.showValidationMessage('Por favor, selecciona una puntuación.');
    return false;
  }

  return this.resenaService.updateResena(resenaId, {
  puntuacion: selectedRating,
  comentario: comentario || undefined
}).toPromise();
}

}).then((result) => {
  if (result.isConfirmed) {
    const resenaActualizada = result.value;
    const index = this.resenas.findIndex(r => r.id === resenaActualizada.id);
    if (index !== -1) {
      this.resenas[index] = resenaActualizada;
    }
    this.notyf.success('Reseña actualizada correctamente.');
  }
});

}

  // ================================================================
  // --- GETTERS DINÁMICOS Y MÉTODOS HELPER ---
  // ================================================================

  get reviewCount(): number {
    return this.resenas.length;
  }
rentarAhora(){
  if (this.property){
    this.router.navigate(['/pago', this.property.id_propiedad]);
  }else {
    this.notyf.error('No se pudo encontrar la propiedad para rentar.');
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
