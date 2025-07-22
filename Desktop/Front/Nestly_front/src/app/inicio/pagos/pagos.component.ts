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
  iva = 0; // NUEVO: para almacenar el IVA
  totalPagar = 0;

  pagoForm: FormGroup;
  // NUEVO: Opciones para el selector de meses
  mesesOpciones: number[] = Array.from({length: 12}, (_, i) => i + 1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpLavavelService,
    private fb: FormBuilder
  ) {
    this.pagoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombreTarjeta: ['', [Validators.required, Validators.minLength(3)]],
      numeroTarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiracion: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      terminos: [false, Validators.requiredTrue],
      // NUEVO: Control para la cantidad de meses a pagar
      mesesAPagar: [1, [Validators.required, Validators.min(1), Validators.max(12)]]
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

    // NUEVO: Escuchamos los cambios en la cantidad de meses para recalcular el total
    this.pagoForm.get('mesesAPagar')?.valueChanges.subscribe(() => {
      this.calcularCostos();
    });
  }

  loadProperty(id: string): void {
    this.isLoading = true;
    this.httpService.Service_Get(`propiedades/${id}`).subscribe({
      next: (res) => {
        this.property = res.data;
        
        // NUEVO: Lógica para ajustar el formulario según el tipo de renta
        if (!this.property.anualizado) {
          // Si no es anual, fijamos los meses en 1 y deshabilitamos el campo
          this.pagoForm.get('mesesAPagar')?.setValue(1);
          this.pagoForm.get('mesesAPagar')?.disable();
        } else {
          // Si es anual, nos aseguramos de que esté habilitado
          this.pagoForm.get('mesesAPagar')?.enable();
        }

        this.calcularCostos(); // Calculamos el costo inicial
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

    const meses = this.pagoForm.get('mesesAPagar')?.value || 1;
    
    // El precio base de la renta se multiplica por los meses seleccionados
    this.precioRenta = parseFloat(this.property.precio) * meses;
    this.tarifaServicio = this.precioRenta * 0.10; // 10% de tarifa sobre el total de la renta

    const subtotal = this.precioRenta + this.tarifaServicio;
    this.iva = subtotal * 0.16; // 16% de IVA sobre el subtotal
    this.totalPagar = subtotal + this.iva;
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