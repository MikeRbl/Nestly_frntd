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

  precioRenta = 0;
  tarifaServicio = 0;
  iva = 0;
  totalPagar = 0;

  pagoForm: FormGroup;
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
      terminos: [false, Validators.requiredTrue]
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

  mostrarTerminos(event: MouseEvent) {
    event.preventDefault(); // Evita que el checkbox se marque al hacer clic en el enlace
    Swal.fire({
      title: 'Términos y Condiciones de Alquiler',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px; padding-right: 15px;">
          <h4 style="font-weight: bold; margin-top: 10px;">1. Objeto del Contrato</h4>
          <p>El presente contrato tiene por objeto regular el alquiler temporal de la propiedad para uso exclusivo de vivienda vacacional o temporal.</p>
          
          <h4 style="font-weight: bold; margin-top: 10px;">2. Duración y Precio</h4>
          <p>La duración del alquiler será la estipulada en el resumen de la orden. El precio total incluye la renta base más las tarifas de servicio aplicables. El pago se realizará por adelantado.</p>

          <h4 style="font-weight: bold; margin-top: 10px;">3. Obligaciones del Inquilino</h4>
          <p>El inquilino se compromete a mantener la Propiedad en buen estado, respetar las normas de la comunidad y no subarrendar el inmueble a terceros.</p>

          <h4 style="font-weight: bold; margin-top: 10px;">4. Cancelación</h4>
          <p>Las políticas de cancelación están sujetas a los términos especificados en el anuncio de la propiedad.</p>

          <br>
          <p>Al aceptar estos términos, usted confirma que ha leído y está de acuerdo con todas las condiciones aquí expuestas.</p>
          
          <hr style="margin: 20px 0;">
          
          <a href="assets/pdf/terminos_y_condiciones.pdf" download="Terminos_y_Condiciones_Nestly.pdf" style="display: inline-block; padding: 8px 16px; background-color: #3b82f6; color: white; border-radius: 5px; text-decoration: none; font-weight: bold;">
            Descargar como PDF
          </a>
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3B82F6'
    });
  }

  loadProperty(id: string): void {
    this.isLoading = true;
    this.httpService.Service_Get(`propiedades/${id}`).subscribe({
      next: (res) => {
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
    const meses = 1; // Lógica de meses a implementar
    this.precioRenta = parseFloat(this.property.precio) * meses;
    this.tarifaServicio = this.precioRenta * 0.10;
    const subtotal = this.precioRenta + this.tarifaServicio;
    this.iva = subtotal * 0.16;
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