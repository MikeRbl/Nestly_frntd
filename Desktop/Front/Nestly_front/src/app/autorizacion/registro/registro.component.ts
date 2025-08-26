import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'] 
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name_paternal: ['', Validators.required],
      last_name_maternal: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      terminos: [false, Validators.requiredTrue]
    }, {
      // Usamos un validador robusto para las contraseñas
      validator: this.mustMatch('password', 'password_confirmation')
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched(); // Muestra todos los errores
      let errorText = "Por favor, completa todos los campos requeridos correctamente.";
      if (this.f['terminos'].invalid) {
        errorText = "Debes aceptar los términos y condiciones para continuar.";
      }
      Swal.fire({
        icon: "error",
        title: "Formulario incompleto",
        text: errorText,
      });
      return;
    }

    this.loading = true;
    Swal.fire({
      title: 'Registrando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Como los nombres de control ya coinciden, podemos enviar el valor del formulario directamente
    this.httpService.Service_Post('register', this.registroForm.value).subscribe({
      next: (response) => {
        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Serás redirigido para iniciar sesión.",
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        console.error('Error en registro:', error);
        Swal.fire({
          icon: "error",
          title: "Error en el registro",
          text: error.error?.message ||
                error.error?.errors?.email?.[0] ||
                'Ocurrió un error. Inténtalo de nuevo.',
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Función para el validador de contraseñas
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mismatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mismatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  // Funciones para mostrar/ocultar contraseñas
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  // Métodos para los popups de Términos y Privacidad
  mostrarTerminos(event: MouseEvent): void {
    event.preventDefault();
    Swal.fire({
      title: 'Términos y Condiciones',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px; padding-right: 15px;">
          <h4>1. Definición del Servicio</h4>
          <p>Nestly es una plataforma en línea que permite a los propietarios ("Anfitriones") publicar propiedades ("Anuncios") para alquilar, y a los usuarios ("Huéspedes") buscar y reservar dichas propiedades...</p>
          <!-- Agrega el resto de tu texto aquí -->
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar'
    });
  }

  mostrarPrivacidad(event: MouseEvent): void {
    event.preventDefault();
    Swal.fire({
      title: 'Política de Privacidad',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px; padding-right: 15px;">
          <h4>1. Información que Recopilamos</h4>
          <p>Recopilamos tres categorías principales de información: Información que tú nos proporcionas (datos de cuenta, perfil, propiedades, pago), Información recopilada automáticamente (datos de uso, geolocalización, cookies) e Información de Terceros (reseñas, verificaciones)...</p>
          <!-- Agrega el resto de tu texto aquí -->
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar'
    });
  }
}
