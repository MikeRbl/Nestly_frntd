import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpLaravelService } from '../../services/http.service';

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
    private httpService: HttpLaravelService,
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
      validator: this.mustMatch('password', 'password_confirmation')
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
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
        this.loading = false; // Detener carga en caso de error
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  mostrarTerminos(event: MouseEvent): void {
    event.preventDefault();
    Swal.fire({
      title: 'Términos y Condiciones',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px; padding: 0 15px;">
          <h4>1. Información sobre el Proveedor</h4>
          <p>En cumplimiento con la NMX-COE-001-SCFI-2019, se informa que la plataforma Nestly es operada por:</p>
          <ul style="list-style-position: inside; padding-left: 10px;">
              <li><strong>Razón Social:</strong> Nestly S.A. de C.V.</li>
              <li><strong>Nombre Comercial:</strong> Nestly</li>
              <li><strong>RFC:</strong> ROMI990531H97</li>
              <li><strong>Domicilio:</strong> Frac. Nigromante, violetas #5</li>
          </ul>
          <h4>2. Definiciones Clave</h4>
          <p>Plataforma: El sitio web y las aplicaciones móviles de Nestly. Usuario/Consumidor: Cualquier persona que se registra y utiliza la Plataforma...</p>
          </div>`,
      width: '800px',
      confirmButtonText: 'Cerrar',
      footer: `
        <div style="display: flex; justify-content: center; gap: 1rem;">
          <a href="assets/pdf/Terminos.pdf" target="_blank" style="padding: 10px 20px; background-color: #4f46e5; color: white; border-radius: 5px; text-decoration: none; font-weight: 600;">Ver PDF</a>
          <a href="assets/pdf/Terminos.pdf" download="Terminos_y_Condiciones_Nestly.pdf" style="padding: 10px 20px; background-color: transparent; color: #4f46e5; border: 2px solid #4f46e5; border-radius: 5px; text-decoration: none; font-weight: 600;">Descargar</a>
        </div>
      `
    });
  }

  mostrarPrivacidad(event: MouseEvent): void {
    event.preventDefault();
    Swal.fire({
      title: 'Política de Privacidad',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px; padding: 0 15px;">
          <p>Nestly, con domicilio en calle Violetas #5 Frac. Nigromante, San Miguel de Allende, Guanajuato, es responsable de recabar sus datos personales, del uso que se le dé a los mismos y de su protección.</p>
          <p>Su información personal será utilizada para proveer los servicios y productos que ha solicitado, informarle sobre cambios en los mismos y evaluar la calidad del servicio que le brindamos...</p>
          </div>`,
      width: '800px',
      confirmButtonText: 'Cerrar',
      footer: `
        <div style="display: flex; justify-content: center; gap: 1rem;">
          <a href="assets/pdf/AvisoPrivacidad.pdf" target="_blank" style="padding: 10px 20px; background-color: #4f46e5; color: white; border-radius: 5px; text-decoration: none; font-weight: 600;">Ver PDF</a>
          <a href="assets/pdf/AvisoPrivacidad.pdf" download="Aviso_de_Privacidad_Nestly.pdf" style="padding: 10px 20px; background-color: transparent; color: #4f46e5; border: 2px solid #4f46e5; border-radius: 5px; text-decoration: none; font-weight: 600;">Descargar</a>
        </div>
      `
    });
  }
}