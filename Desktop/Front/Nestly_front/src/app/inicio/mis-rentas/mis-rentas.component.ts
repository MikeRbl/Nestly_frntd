import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

// Define la URL base de tu API directamente aquí
const API_BASE_URL = 'http://localhost:8000/api'; // Cambia esto por tu URL real

@Component({
  selector: 'app-mis-rentas',
  templateUrl: './mis-rentas.component.html',
  styleUrls: ['./mis-rentas.component.css'],
  providers: [DatePipe]
})
export class MisRentasComponent implements OnInit {
  isLoading = false;
  rentas: any[] = [];
  rentasActivas: any[] = [];
  rentasHistorial: any[] = [];
  rentaSeleccionada: any = null;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    console.log('Token:', this.authService.getToken());
  console.log('Usuario actual:', this.authService.obtenerUsuarioActualId());
    this.cargarRentas();
  }

 cargarRentas(): void {
  this.isLoading = true;
  this.errorMessage = '';
  
  const currentUser = this.authService.obtenerUsuarioActualId();
  if (!currentUser || !currentUser.id) {
    this.errorMessage = 'Usuario no identificado';
    this.isLoading = false;
    return;
  }

  const token = this.authService.getToken();
  if (!token) {
    this.errorMessage = 'No hay token de autenticación';
    this.isLoading = false;
    return;
  }

  console.log('Token:', token); // Debug
  console.log('User ID:', currentUser.id); // Debug

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  });

  this.http.get<any[]>(`${API_BASE_URL}/users/${currentUser.id}/rentas`, { headers }).subscribe({
    next: (res) => {
      console.log('Respuesta:', res); // Debug
      this.rentas = res;
      this.clasificarRentas();
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error completo:', err); // Debug completo
      console.error('Error details:', err.error); // Detalles del error
      this.isLoading = false;
      this.errorMessage = 'Error al cargar rentas';
      Swal.fire('Error', this.errorMessage, 'error');
    }
  });
}

  clasificarRentas(): void {
    const hoy = new Date();
    
    this.rentasActivas = this.rentas.filter(renta => {
      const fechaFin = new Date(renta.fecha_fin);
      return fechaFin >= hoy && renta.estado === 'activa';
    }).map(renta => ({ 
      ...renta, 
      estado: 'Activa',
      propiedad: renta.propiedad || {},
      propietario: renta.propietario || renta.propiedad?.user || {}
    }));

    this.rentasHistorial = this.rentas.filter(renta => {
      const fechaFin = new Date(renta.fecha_fin);
      return fechaFin < hoy || renta.estado !== 'activa';
    }).map(renta => ({ 
      ...renta, 
      estado: renta.estado === 'completada' ? 'Completada' : 'Cancelada',
      propiedad: renta.propiedad || {},
      propietario: renta.propietario || renta.propiedad?.user || {}
    }));
  }

  verDetalles(renta: any): void {
  const token = this.authService.getToken();
  if (!token) return;

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.get<any>(`${API_BASE_URL}/rentas/${renta.id}`, { headers }).subscribe({
    next: (detalle) => {
      this.rentaSeleccionada = {
        ...detalle,
        estado: detalle.estado === 'activa' ? 'Activa' : 
               detalle.estado === 'completada' ? 'Completada' : 'Cancelada',
        propiedad: detalle.propiedad || {},
        propietario: detalle.propietario || detalle.propiedad?.user || {}
      };
    },
    error: (err) => {
      console.error('Error al cargar detalles:', err);
      this.rentaSeleccionada = {
        ...renta,
        propiedad: renta.propiedad || {},
        propietario: renta.propietario || renta.propiedad?.user || {}
      };
    }
  });
}

  cancelarRenta(id: number): void {
  const token = this.authService.getToken();
  if (!token) return;

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  Swal.fire({
    title: '¿Cancelar renta?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, mantener'
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.delete(`${API_BASE_URL}/rentas/${id}`, { headers }).subscribe({
        next: () => {
          Swal.fire('Cancelada', 'Tu renta ha sido cancelada', 'success');
          this.cargarRentas();
        },
        error: (err) => {
          console.error('Error al cancelar:', err);
          Swal.fire('Error', 'No se pudo cancelar la renta', 'error');
        }
      });
    }
  });
}

 getPropertyImage(renta: any): string {
  if (renta.propiedad?.fotos?.length) {
    return `http://localhost:8000/storage/${renta.propiedad.fotos[0]}`;
  }
  return 'assets/img/imagen-por-defecto.jpg';
}

  
  

  diasRestantes(fechaFin: string): number {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  cerrarModal(): void {
    this.rentaSeleccionada = null;
  }
}