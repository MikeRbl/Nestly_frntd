import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLavavelService } from '../../http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent implements OnInit{
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
  ){
    this.pagoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombreTarjeta: ['', Validators.required, Validators.minLength(3)],
      numeroTarjeta: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]],
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
    this.httpService.Service_Get(`properties/${id}`).subscribe({
      next: (res) => {
        this.property = res.data;
        this.calcularCostos();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'no se pudo cargar la propiedad';
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
    this.httpService.Service_Put(`propiedades/${this.property.id_propiedad}`, data).subscribe({
      next: () => {
        this.isProcessing = false;
        Swal.fire({
          title: 'Pago exitoso',
          text: `Has Alquilado "${this.property.titulo}". !Felicidades!`,
          icon: 'success',
          confirmButtonText: '!!YAY!!',
        }).then(() => {
          this.router.navigate(['/verPropiedades']);
        });
      },
      error: (err) => {
        this.isProcessing = false;
        Swal.fire( 'Error', 'Hubo un problema al procesar la propiedad.', 'error');
        console.error("error al actualizar estado:", err);
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
