import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
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
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['inquilino']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para contraseñas
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get f() {
    return this.registroForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    
    if (this.registroForm.invalid) {
      return;
    }

    this.loading = true;

    const formData = {
      first_name: this.registroForm.value.nombre,
      last_name_paternal: this.registroForm.value.apellidoPaterno,
      last_name_maternal: this.registroForm.value.apellidoMaterno,
      phone: this.registroForm.value.telefono,
      email: this.registroForm.value.email,
      password: this.registroForm.value.password,
      password_confirmation: this.registroForm.value.confirmPassword,
      role: this.registroForm.value.role
    };

    this.httpService.Service_Post('register', formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error en registro:', error);
        this.errorMessage = error.error?.message || 
                          error.error?.errors?.email?.[0] || 
                          'Error al registrar el usuario';
      }
    });
  }
}