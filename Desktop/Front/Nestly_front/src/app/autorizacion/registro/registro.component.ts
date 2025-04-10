import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registroForm: FormGroup;
  submitted = false;
  errorMessage = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      name: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      rol: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get f() {
    return this.registroForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registroForm.invalid) {
      Swal.fire({
        icon: "error",
        title: "Upsi",
        text: "Completa todos los campos requeridos",
      });
      return;
  
    }
    
    this.loading = true;
    
    const formData = {  
      first_name: this.registroForm.value.name,
      last_name_paternal: this.registroForm.value.apellido_paterno,
      last_name_maternal: this.registroForm.value.apellido_materno,
      phone: this.registroForm.value.telefono,
      email: this.registroForm.value.email,
      password: this.registroForm.value.password,
      password_confirmation: this.registroForm.value.password_confirmation,
      role: this.registroForm.value.rol
    };

    Swal.fire({
      title: 'Registrando...',
      allowOutsideClick: false,
      timer: 2000,
      
      didOpen: () => {
        Swal.showLoading();
      }
    });
    this.httpService.Service_Post('register', formData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Serás redirigido para iniciar sesión",
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
          title: "Error en registro",
          text: error.error?.message || 
                error.error?.errors?.email?.[0] || 
                'Ocurrio un error al registra. Intenta de nuevo',
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
    
  }
}