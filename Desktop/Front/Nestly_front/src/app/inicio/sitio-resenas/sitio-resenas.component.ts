import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

interface SiteReview {
  id?: string;
  rating: number; // Rating is always a number now
  comment: string;
  reviewerName?: string;
  date: Date;
  likes: number; // Likes is always a number now
  reported?: boolean;
}

@Component({
  selector: 'app-sitio-resenas',
  templateUrl: './sitio-resenas.component.html',
  styleUrls: ['./sitio-resenas.component.css']
})
export class SitioResenasComponent implements OnInit {
  siteReviewForm!: FormGroup;
  siteReviews = signal<SiteReview[]>([]);
  formSubmitted = false;
  isLoading = false;
  sortDesc = signal(true);

  // Computed property for sorted reviews
  sortedReviews = computed(() => {
    const reviews = this.siteReviews();
    return [...reviews].sort((a, b) => {
      return this.sortDesc() 
        ? new Date(b.date).getTime() - new Date(a.date).getTime() 
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadSampleReviews();
  }

  initializeForm(): void {
    this.siteReviewForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(200)]],
      reviewerName: ['']
    });
  }

  loadSampleReviews(): void {
    const sampleReviews: SiteReview[] = [
      { 
        id: '1',
        rating: 5, 
        comment: '¡Increíble plataforma! Encontré mi casa ideal en menos de una semana. La interfaz es muy intuitiva y el proceso fue sencillo.', 
        reviewerName: 'María González', 
        date: new Date('2024-07-20'),
        likes: 12 
      },
      { 
        id: '2',
        rating: 4, 
        comment: 'Me gusta mucho la variedad de propiedades disponibles. Sería genial si agregaran más filtros de búsqueda avanzada.', 
        reviewerName: 'Juan Pérez', 
        date: new Date('2024-07-18'),
        likes: 8 
      },
      { 
        id: '3',
        rating: 5, 
        comment: 'El equipo de soporte fue muy útil cuando tuve problemas técnicos. Resolvieron mi problema en menos de una hora.', 
        date: new Date('2024-07-15'),
        likes: 15 
      },
      { 
        id: '4',
        rating: 3, 
        comment: 'La plataforma es buena pero a veces las fotos de las propiedades no coinciden con la realidad. Deberían verificar mejor los anuncios.', 
        reviewerName: 'Ana Martínez', 
        date: new Date('2024-07-10'),
        likes: 3 
      },
      { 
        id: '5',
        rating: 5, 
        comment: '¡Excelente experiencia! Pude comparar varias propiedades fácilmente y tomar la mejor decisión para mi familia.', 
        reviewerName: 'Carlos Sánchez', 
        date: new Date('2024-07-05'),
        likes: 20 
      },
    ];
    
    this.siteReviews.set(sampleReviews);
  }

  get fSiteReview() {
    return this.siteReviewForm.controls;
  }

  submitSiteReview(): void {
    this.formSubmitted = true;

    // Mark all controls as touched to show validation messages
    Object.values(this.siteReviewForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.siteReviewForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos requeridos correctamente.',
        confirmButtonColor: '#90CAF9' 
      });
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      const newReview: SiteReview = {
        id: Math.random().toString(36).substring(2, 9),
        rating: 5, // Default rating for new reviews
        comment: this.siteReviewForm.value.comment,
        reviewerName: this.siteReviewForm.value.reviewerName?.trim() || undefined,
        date: new Date(),
        likes: 0 
      };

      this.siteReviews.update(reviews => [newReview, ...reviews]);
      
      this.siteReviewForm.reset();
      this.formSubmitted = false;
      this.isLoading = false;

      Swal.fire({
        icon: 'success',
        title: '¡Gracias!',
        text: 'Tu reseña ha sido publicada.',
        confirmButtonColor: '#90CAF9', 
        timer: 2000,
        timerProgressBar: true
      });

    }, 1500);
  }

  toggleSort(): void {
    this.sortDesc.update(desc => !desc);
  }

  likeReview(review: SiteReview): void {
    review.likes++;
    this.siteReviews.update(reviews => [...reviews]);
  }

  deleteReview(reviewToDelete: SiteReview): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626', // Red color for delete confirmation
      cancelButtonColor: '#757575', // Muted gray for cancel
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.siteReviews.update(reviews => reviews.filter(review => review.id !== reviewToDelete.id));
        Swal.fire({
          icon: 'success',
          title: '¡Eliminada!',
          text: 'Tu reseña ha sido eliminada.',
          confirmButtonColor: '#22C55E', // Green for success
          timer: 2000
        });
      }
    });
  }

  reportReview(review: SiteReview): void {
    Swal.fire({
      title: 'Reportar reseña',
      text: '¿Por qué quieres reportar esta reseña?',
      input: 'select',
      inputOptions: {
        spam: 'Spam o publicidad',
        inappropriate: 'Contenido inapropiado',
        fake: 'Información falsa',
        other: 'Otro motivo'
      },
      inputPlaceholder: 'Selecciona un motivo',
      showCancelButton: true,
      confirmButtonText: 'Reportar',
      confirmButtonColor: '#90CAF9', 
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        review.reported = true;
        this.siteReviews.update(reviews => [...reviews]);
        
        Swal.fire({
          icon: 'success',
          title: 'Reporte enviado',
          text: 'Gracias por ayudarnos a mantener la calidad de las reseñas.',
          confirmButtonColor: '#90CAF9', 
          timer: 2000
        });
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  }
}
