import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Propiedad } from '../../interface/propiedades.interface';
import { AuthService } from '../../auth.service';
import { PropiedadesService } from '../../services/propiedad.service';
import { NotyfService } from '../../services/notyf.service';

export interface Testimonio {
  id?: number;
  id_usuario?: number;
  nombre: string;
  comentario: string;
  puntuacion: number;
  avatar: string;
  fecha?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public mostrarFormularioResena = false;
  public nuevaResena = {
    comentario: '',
    puntuacion: 0
  };

  hoverRating = 0;
  currentUser: any = null;
  
  // Variables para el carrusel de reseñas
  grupoResenasActual = 0;
  carruselOpacity = 1;
  private carruselIntervalId: any;

  public testimonios: Testimonio[] = [];
  private storageKey = 'dashboardResenas';

  // Obtener las reseñas visibles según el grupo actual
  get testimoniosVisibles(): Testimonio[] {
    const inicio = this.grupoResenasActual * 3;
    const fin = inicio + 3;
    return this.testimonios.slice(inicio, fin);
  }

  // Calcular el total de grupos de reseñas
  get totalGruposResenas(): number {
    return Math.ceil(this.testimonios.length / 3);
  }

  properties: Propiedad[] = [];
  featuredProperties: Propiedad[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  favoritoIds = new Set<number>();
  isUserLoggedIn = false;
  imageOpacity = 1;
  photoIndexes: Map<number, number> = new Map();
  photoIntervalId: any;

  constructor(
    private Shttp: HttpLavavelService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private propiedadesService: PropiedadesService,
    private notyf: NotyfService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadProperties();
    if (this.isUserLoggedIn) {
      this.cargarIdsFavoritos();
    }
    this.startPhotoCarousel();
    this.iniciarCarruselResenas();

    // Cargar reseñas de localStorage o inicializar con ejemplos
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.testimonios = JSON.parse(stored);
    } else {
      this.testimonios = [
        {
          id: 1,
          nombre: 'Ana Sofía Vargas',
          comentario: '"¡El proceso fue increíblemente fácil! Encontré la casa de mis sueños en San Miguel en menos de una semana."',
          puntuacion: 5,
          avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AV',
          fecha: '15/05/2024',
          id_usuario: 1
        },
        {
          id: 2,
          nombre: 'Ricardo Morales',
          comentario: '"Publicar mi casa fue sencillo. Recibí solicitudes reales y el sistema de gestión fue excelente."',
          puntuacion: 5,
          avatar: 'https://placehold.co/100x100/A0AEC0/2D3748?text=RM',
          fecha: '22/04/2024',
          id_usuario: 2
        },
        {
          id: 3,
          nombre: 'Valeria Montoya',
          comentario: '"Muy intuitivo el sitio, encontré inquilinos responsables rápidamente."',
          puntuacion: 4,
          avatar: 'https://placehold.co/100x100/FDE68A/CA8A04?text=VM',
          fecha: '10/06/2024',
          id_usuario: 3
        },
        {
          id: 4,
          nombre: 'Carlos Mendoza',
          comentario: '"Excelente servicio al cliente, me ayudaron en todo momento durante el proceso de renta."',
          puntuacion: 5,
          avatar: 'https://placehold.co/100x100/BEE3F8/3182CE?text=CM',
          fecha: '05/07/2024',
          id_usuario: 4
        },
        {
          id: 5,
          nombre: 'Laura González',
          comentario: '"Las propiedades están bien descritas y las fotos son reales, no hay sorpresas desagradables."',
          puntuacion: 4,
          avatar: 'https://placehold.co/100x100/EDF2F7/4A5568?text=LG',
          fecha: '18/06/2024',
          id_usuario: 5
        }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(this.testimonios));
    }
  }

  ngOnDestroy(): void {
    if (this.photoIntervalId) {
      clearInterval(this.photoIntervalId);
    }
    if (this.carruselIntervalId) {
      clearInterval(this.carruselIntervalId);
    }
  }

  // Métodos para el carrusel de reseñas
  iniciarCarruselResenas(): void {
    if (this.totalGruposResenas > 1) {
      this.carruselIntervalId = setInterval(() => {
        this.grupoResenasSiguiente();
      }, 8000); // Cambia cada 8 segundos
    }
  }

  async grupoResenasSiguiente(): Promise<void> {
    this.carruselOpacity = 0;
    await this.delay(300);
    this.grupoResenasActual = (this.grupoResenasActual + 1) % this.totalGruposResenas;
    this.carruselOpacity = 1;
  }

  async grupoResenasAnterior(): Promise<void> {
    this.carruselOpacity = 0;
    await this.delay(300);
    this.grupoResenasActual = (this.grupoResenasActual - 1 + this.totalGruposResenas) % this.totalGruposResenas;
    this.carruselOpacity = 1;
  }

  async cambiarGrupoResenas(index: number): Promise<void> {
    this.carruselOpacity = 0;
    await this.delay(300);
    this.grupoResenasActual = index;
    this.carruselOpacity = 1;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Funciones para mostrar el rango de reseñas en la plantilla
  getInicioGrupoResenas(): number {
    return this.grupoResenasActual * 3 + 1;
  }

  getFinGrupoResenas(): number {
    return Math.min((this.grupoResenasActual + 1) * 3, this.testimonios.length);
  }

  yaDejoResena(): boolean {
    if (!this.currentUser) return false;
    return this.testimonios.some(t => t.id_usuario === this.currentUser.id);
  }

  publicarResena(): void {
    if (!this.nuevaResena.comentario || this.nuevaResena.puntuacion === 0) {
      this.notyf.error('Por favor, escribe tu comentario y selecciona una calificación.');
      return;
    }

    if (!this.currentUser) {
      this.notyf.error('Debes iniciar sesión para dejar una reseña.');
      return;
    }

    const yaTieneResena = this.testimonios.some(t => t.id_usuario === this.currentUser.id);
    if (yaTieneResena) {
      this.notyf.error('Solo puedes dejar una reseña.');
      return;
    }
    
    const userName = `${this.currentUser.first_name} ${this.currentUser.last_name_paternal}`;
    const userId = this.currentUser.id;
    const nuevoId = Math.max(...this.testimonios.map(t => t.id || 0), 0) + 1;

    const testimonioPublicar: Testimonio = {
      id: nuevoId,
      id_usuario: userId,
      nombre: userName,
      comentario: this.nuevaResena.comentario,
      puntuacion: this.nuevaResena.puntuacion,
      avatar: `https://placehold.co/100x100?text=${userName.substring(0, 2).toUpperCase()}`,
      fecha: new Date().toLocaleDateString()
    };

    this.testimonios.unshift(testimonioPublicar);
    localStorage.setItem(this.storageKey, JSON.stringify(this.testimonios));

    // Si es la primera reseña, reiniciar el carrusel
    if (this.testimonios.length <= 3) {
      this.grupoResenasActual = 0;
    }

    this.resetFormularioResena();
    this.notyf.success('¡Gracias! Tu reseña ha sido publicada.');
  }

  eliminarResena(id: number, event: Event): void {
    event.stopPropagation();

    const testimonio = this.testimonios.find(t => t.id === id);
    if (!testimonio || !this.currentUser || testimonio.id_usuario !== this.currentUser.id) {
      this.notyf.error('Solo puedes eliminar tus propias reseñas.');
      return;
    }

    Swal.fire({
      title: '¿Eliminar reseña?',
      text: '¿Estás seguro de que quieres eliminar esta reseña?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.testimonios.findIndex(t => t.id === id);
        if (index !== -1) {
          this.testimonios.splice(index, 1);
          localStorage.setItem(this.storageKey, JSON.stringify(this.testimonios));
          
          // Ajustar el grupo actual si es necesario
          if (this.grupoResenasActual >= this.totalGruposResenas) {
            this.grupoResenasActual = Math.max(0, this.totalGruposResenas - 1);
          }
          
          this.notyf.success('Reseña eliminada correctamente');
        }
      }
    });
  }

  resetFormularioResena(): void {
    this.nuevaResena = { 
      comentario: '', 
      puntuacion: 0 
    };
    this.mostrarFormularioResena = false;
    this.hoverRating = 0;
  }

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.Shttp.Service_Get('propiedades').subscribe({
      next: (response: any) => {
        const data = response?.data?.data || response?.data || [];
        this.properties = this.processProperties(Array.isArray(data) ? data : [data]);
        this.featuredProperties = this.getRandomProperties(this.properties, 4);
        this.featuredProperties.forEach(p => this.photoIndexes.set(p.id_propiedad, 0));
        if (this.properties.length === 0) {
            this.errorMessage = 'No se encontraron propiedades disponibles';
            this.notyf.warning('No hay propiedades disponibles');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades:', err);
        this.errorMessage = 'Error al cargar las propiedades. Intenta nuevamente.';
        this.isLoading = false;
        this.notyf.error('Error al cargar propiedades');
      }
    });
  }

  processProperties(properties: any[]): Propiedad[] {
    return properties.map(prop => {
      let fotos: string[] = [];
      if (prop.fotos) {
        if (typeof prop.fotos === 'string') {
          try { fotos = JSON.parse(prop.fotos); if (!Array.isArray(fotos)) fotos = [prop.fotos]; } 
          catch { fotos = [prop.fotos]; }
        } else if (Array.isArray(prop.fotos)) {
          fotos = prop.fotos;
        }
      }
      return {
        ...prop,
        fotos: fotos,
        precio: Number(prop.precio) || 0,
        habitaciones: Number(prop.habitaciones) || 0,
        banos: Number(prop.banos) || 0,
        metros_cuadrados: Number(prop.metros_cuadrados) || 0,
        amueblado: !!prop.amueblado,
        anualizado: !!prop.anualizado,
        mascotas: prop.mascotas === 'si' || prop.mascotas === true,
        deposito: Number(prop.deposito) || 0
      };
    });
  }

  getRandomProperties(properties: Propiedad[], count: number): Propiedad[] {
    const available = properties.filter(prop => prop.estado_propiedad !== 'inactivo' && (prop.imagen_principal || (Array.isArray(prop.fotos) && prop.fotos.length > 0)));
    return [...available].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  getFirstPhoto(property: Propiedad): string {
    const baseUrl = 'http://localhost:8000';
    const buildUrl = (path: string | undefined): string => {
      if (!path) return 'assets/default-property.jpg';
      if (path.startsWith('http')) return path;
      return `${baseUrl}${path.startsWith('/storage') ? '' : '/storage/'}${path.replace(/^\/storage\//, '')}`;
    };
    if (property.imagen_principal) return buildUrl(property.imagen_principal);
    if (property.fotos && Array.isArray(property.fotos) && property.fotos.length > 0) return buildUrl(property.fotos[0]);
    return 'assets/default-property.jpg';
  }

  startPhotoCarousel() {
    this.photoIntervalId = setInterval(() => {
      this.imageOpacity = 0;
      setTimeout(() => {
        this.featuredProperties.forEach(prop => {
          const currentIndex = this.photoIndexes.get(prop.id_propiedad) || 0;
          const photosCount = prop.fotos?.length || 1;
          const nextIndex = (currentIndex + 1) % photosCount;
          this.photoIndexes.set(prop.id_propiedad, nextIndex);
        });
        this.imageOpacity = 1;
      }, 400); 
    }, 5000);
  }

  getCurrentPhoto(property: Propiedad): string {
    const index = this.photoIndexes.get(property.id_propiedad) || 0;
    if (property.fotos && property.fotos.length > 0) return this.buildUrl(property.fotos[index]);
    return this.getFirstPhoto(property);
  }

  buildUrl(path: string | undefined): string {
    const baseUrl = 'http://localhost:8000';
    if (!path) return 'assets/default-property.jpg';
    if (path.startsWith('http')) return path;
    return `${baseUrl}${path.startsWith('/storage') ? '' : '/storage/'}${path.replace(/^\/storage\//, '')}`;
  }

  prevPhoto(property: Propiedad, event: MouseEvent) {
    event.stopPropagation();
    const currentIndex = this.photoIndexes.get(property.id_propiedad) || 0;
    const photosCount = property.fotos?.length || 1;
    const prevIndex = (currentIndex - 1 + photosCount) % photosCount;
    this.photoIndexes.set(property.id_propiedad, prevIndex);
  }

  nextPhoto(property: Propiedad, event: MouseEvent) {
    event.stopPropagation();
    const currentIndex = this.photoIndexes.get(property.id_propiedad) || 0;
    const photosCount = property.fotos?.length || 1;
    const nextIndex = (currentIndex + 1) % photosCount;
    this.photoIndexes.set(property.id_propiedad, nextIndex);
  }

  handlePropertyClick(id: number): void {
    if (this.authService.isLoggedIn()) {
      this.navigateToProperty(id);
    } else {
      Swal.fire({
        title: '¡Inicia sesión o crea una cuenta!',
        text: 'Necesitas una cuenta para ver los detalles de la propiedad y contactar al propietario.',
        icon: 'info',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Iniciar Sesión',
        denyButtonText: 'Crear Cuenta',
        cancelButtonText: 'Más tarde',
        confirmButtonColor: '#3B82F6',
        denyButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
      }).then((result) => {
        if (result.isConfirmed) this.router.navigate(['/login']);
        else if (result.isDenied) this.router.navigate(['/register']);
      });
    }
  }

  cargarIdsFavoritos(): void {
    this.propiedadesService.getIdsFavoritos().subscribe({
      next: (response) => { 
        if (response && response.data) {
          this.favoritoIds = new Set(response.data); 
        }
      },
      error: (err) => console.error('Error al cargar IDs de favoritos:', err)
    });
  }

  toggleFavorito(propiedad: Propiedad, event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isUserLoggedIn) {
      this.handlePropertyClick(propiedad.id_propiedad);
      return;
    }
    const propiedadId = propiedad.id_propiedad;
    const esFavorito = this.favoritoIds.has(propiedadId);
    const action = esFavorito ? this.propiedadesService.quitarFavorito(propiedadId) : this.propiedadesService.agregarFavorito(propiedadId);
    
    action.subscribe({
      next: () => {
        if (esFavorito) this.favoritoIds.delete(propiedadId);
        else this.favoritoIds.add(propiedadId);
        this.notyf.success(esFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      },
      error: () => this.notyf.error('Ocurrió un error. Intenta de nuevo.')
    });
  }

  formatPrice(price: number | undefined, anualizado: boolean | undefined = false): string {
    return `$${(price || 0).toLocaleString('es-MX')}${anualizado ? '/año' : '/mes'}`;
  }

  navigateToProperty(id: number): void {
    if (!id) return;
    this.router.navigate(['propiedad', id], { relativeTo: this.activatedRoute.parent }).catch(() => {
        this.router.navigate(['/propiedad', id]);
    });
  }

  pausePhotoCarousel(): void {
    if (this.photoIntervalId) clearInterval(this.photoIntervalId);
  }

  handleNavigation(route: string): void {
    this.router.navigate([route]);
  }

  subscrito() {
    Swal.fire({
      title: "¡Gracias por suscribirte!",
      text: "Recibirás nuestras mejores ofertas",
      icon: "success",
      confirmButtonText: "Aceptar",
      timer: 3000,
      timerProgressBar: true
    });
  }
}