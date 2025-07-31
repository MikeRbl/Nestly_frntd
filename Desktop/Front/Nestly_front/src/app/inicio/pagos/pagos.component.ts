import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLavavelService } from '../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  property: any | null = null;
  isLoading = true;
  isProcessing = false;
  error = '';

  // Propiedades para el desglose de costos
  precioRenta = 0;
  tarifaServicio = 0;
  iva = 0;
  totalPagar = 0;
  
  // Propiedades para el desglose mensual
  pagoMensual = 0;
  rentaMensual = 0;
  tarifaMensual = 0;
  ivaMensual = 0;

  pagoForm: FormGroup;
  mesesOpciones: number[] = Array.from({length: 12}, (_, i) => i + 1);
  aniosOpciones: number[] = Array.from({length: 5}, (_, i) => i + 1);
  minDateCheckin: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpLavavelService,
    private fb: FormBuilder
  ) {
    this.minDateCheckin = new Date().toISOString().split('T')[0];

    this.pagoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombreTarjeta: ['', [Validators.required, Validators.minLength(3)]],
      numeroTarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiracion: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      terminos: [false, Validators.requiredTrue],
      tipoDeRenta: ['meses', Validators.required],
      duracion: [1, [Validators.required, Validators.min(1)]],
      checkin: [{ value: '', disabled: true }, Validators.required],
      checkout: [{ value: '', disabled: true }, Validators.required],
      tipoPago: ['unico', Validators.required]
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
    
    // Suscripciones para actualizar dinámicamente
    this.pagoForm.get('duracion')?.valueChanges.subscribe(() => {
      if (this.pagoForm.get('duracion')?.valid) {
        this.pagoForm.get('checkin')?.enable({ emitEvent: false });
      } else {
        this.pagoForm.get('checkin')?.disable({ emitEvent: false });
      }
      this.actualizarCheckoutYCostos();
    });

    this.pagoForm.get('checkin')?.valueChanges.subscribe(() => {
      this.actualizarCheckoutYCostos();
    });

    this.pagoForm.get('tipoDeRenta')?.valueChanges.subscribe((tipo) => {
        this.pagoForm.get('duracion')?.setValue(1);
    });
  }

  loadProperty(id: string): void {
    this.isLoading = true;
    this.httpService.Service_Get(`propiedades/${id}`).subscribe({
      next: (res) => {
        this.property = res.data;
        if (!this.property.anualizado) {
          this.pagoForm.get('tipoDeRenta')?.setValue('meses');
          this.pagoForm.get('tipoDeRenta')?.disable();
        } else {
          this.pagoForm.get('tipoDeRenta')?.enable();
        }

        if (this.pagoForm.get('duracion')?.valid) {
            this.pagoForm.get('checkin')?.enable();
        }
        this.calcularCostos();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la propiedad.';
        this.isLoading = false;
      }
    });
  }

  actualizarCheckoutYCostos(): void {
    const checkinDate = this.pagoForm.get('checkin')?.value;
    const duracion = this.pagoForm.get('duracion')?.value;
    const tipoRenta = this.pagoForm.get('tipoDeRenta')?.value;

    if (checkinDate && duracion) {
      const fechaInicio = new Date(checkinDate + 'T00:00:00');
      const fechaFin = new Date(fechaInicio);
      
      if (tipoRenta === 'meses') {
        fechaFin.setMonth(fechaInicio.getMonth() + parseInt(duracion, 10));
      } else {
        fechaFin.setFullYear(fechaInicio.getFullYear() + parseInt(duracion, 10));
      }
      
      const checkoutString = fechaFin.toISOString().split('T')[0];
      this.pagoForm.get('checkout')?.setValue(checkoutString);
    }
    this.calcularCostos();
  }

  calcularCostos(): void {
    if (!this.property) return;

    // CÁLCULO MENSUAL
    this.rentaMensual = parseFloat(this.property.precio);
    this.tarifaMensual = this.rentaMensual * 0.10;
    const subtotalMensual = this.rentaMensual + this.tarifaMensual;
    this.ivaMensual = subtotalMensual * 0.16;
    this.pagoMensual = subtotalMensual + this.ivaMensual;

    // CÁLCULO TOTAL
    const duracion = this.pagoForm.get('duracion')?.value || 1;
    const tipoDeRenta = this.pagoForm.get('tipoDeRenta')?.value;
    let precioBaseTotal = this.rentaMensual;

    if (tipoDeRenta === 'anios') {
      precioBaseTotal = this.rentaMensual * 12;
    }
    
    this.precioRenta = precioBaseTotal * duracion;
    this.tarifaServicio = this.precioRenta * 0.10;
    const subtotalTotal = this.precioRenta + this.tarifaServicio;
    this.iva = subtotalTotal * 0.16;
    this.totalPagar = subtotalTotal + this.iva;
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
                    title: '¡Pago Exitoso!',
                    text: `Has alquilado "${this.property.titulo}". ¡Felicidades!`,
                    icon: 'success',
                    confirmButtonText: '¡Entendido!',
                }).then(() => {
                    this.router.navigate(['/principal/mis-propiedades']);
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
  
  pagarCon(metodo: 'paypal' | 'oxxo' | 'mercadopago'): void {
    let url = '';
    switch (metodo) {
      case 'paypal':
        url = 'https://www.paypal.com';
        break;
      case 'oxxo':
        url = 'https://www.oxxo.com/oxxo-pay';
        break;
      case 'mercadopago':
        url = 'https://www.mercadopago.com.mx';
        break;
    }
    Swal.fire({
      title: `Redirigiendo a ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`,
      text: 'Estás siendo redirigido para completar tu pago. (Funcionalidad de demostración)',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      willOpen: () => {
        setTimeout(() => window.open(url, '_blank'), 1000);
      }
    });
  }

  get f() { return this.pagoForm.controls; }

  mostrarTerminos(event: MouseEvent) {
    event.preventDefault();
    Swal.fire({
        title: 'Términos y Condiciones de Alquiler',
        html: `...`, // Tu HTML de términos y condiciones
        width: '800px',
        confirmButtonText: 'Cerrar',
    });
  }
  
  getFullImageUrl(path: string): string {
    if (!path) return 'assets/default-property.jpg';
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}