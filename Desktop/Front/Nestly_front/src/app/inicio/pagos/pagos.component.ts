import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLavavelService } from '../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'] // Corregido de styleUrl a styleUrls si usas un array
})
export class PagosComponent implements OnInit {
  property: any | null = null;
  isLoading = true;
  isProcessing = false;
  error = '';

  precioRenta = 0;
  tarifaServicio = 0;
  totalPagar = 0;

  pagoForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpLavavelService,
    private fb: FormBuilder
  ) {
    this.pagoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombreTarjeta: ['', [Validators.required, Validators.minLength(3)]], // Corregido: se había separado en 3 argumentos
      numeroTarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiracion: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/?([0-9]{2})$')]], // Añadido para que funcione
      cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]], // Corregido para aceptar 3 o 4 dígitos
    });
  }

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.loadProperty(propertyId);
    } else {
      this.error = 'ID de propiedad no proporcionado';
      this.isLoading = false;
    }
  }

  loadProperty(id: string): void {
    this.isLoading = true;
    // --- LA CORRECCIÓN ESTÁ AQUÍ ---
    // Cambiamos "properties" por "propiedades" para que coincida con tu API
    this.httpService.Service_Get(`propiedades/${id}`).subscribe({
      next: (res) => {
        // Asumimos que la API devuelve el objeto de la propiedad directamente en res.data
        this.property = res.data; 
        this.calcularCostos();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la propiedad. Verifica que la URL sea correcta.';
        this.isLoading = false;
      }
    });
  }

  calcularCostos(): void {
    if (!this.property) return;
    this.precioRenta = parseFloat(this.property.precio);
    this.tarifaServicio = this.precioRenta * 0.10;
    this.totalPagar = this.precioRenta + this.tarifaServicio;
  }

  procesarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;

    setTimeout(() => {
      const data = { estado_propiedad: 'Alquilada' };
      this.httpService.Service_Put(`propiedades/${this.property.id_propiedad}/estado`, data).subscribe({
        next: () => {
          this.isProcessing = false;
          Swal.fire({
            title: 'Pago exitoso',
            text: `Has Alquilado "${this.property.titulo}". !Felicidades!`,
            icon: 'success',
            confirmButtonText: '¡Entendido!',
          }).then(() => {
            this.router.navigate(['/verPropiedades']);
          });
        },
        error: (err) => {
          this.isProcessing = false;
          Swal.fire('Error', 'Hubo un problema al actualizar el estado de la propiedad.', 'error');
          console.error("Error al actualizar estado:", err);
        }
      });
    }, 2000);
  }

  get f() { return this.pagoForm.controls; }

  getFullImageUrl(path: string): string {
    if (!path) return 'assets/default-property.jpg';
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}