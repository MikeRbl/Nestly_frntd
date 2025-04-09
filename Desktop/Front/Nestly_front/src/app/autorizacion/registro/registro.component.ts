import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpLavavelService } from '../../http.service';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registroForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private httpService: HttpLavavelService
  ) {
    this.registroForm = this.fb.group({
      name: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required],
      telefono: ['', Validators.required],
      rol: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.registroForm.valid) {
      this.loading = true;
      this.errorMessage = null;
      
      const formData = {
        name: this.registroForm.value.name,
        apellido_paterno: this.registroForm.value.apellido_paterno,
        apellido_materno: this.registroForm.value.apellido_materno,
        email: this.registroForm.value.email,
        password: this.registroForm.value.password,
        password_confirmation: this.registroForm.value.password_confirmation,
        telefono: this.registroForm.value.telefono,
        rol: this.registroForm.value.rol
      };

      try {
        const response = await this.httpService.publicPost('register', formData);
        console.log('Registro exitoso', response);
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      } catch (error) {
        console.error('Error en el registro', error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    } else {
      this.registroForm.markAllAsTouched();
    }
  }

  private handleError(error: any) {
    if (error.error && error.error.errors) {
      const errorMessages = [];
      for (const key in error.error.errors) {
        if (error.error.errors[key]) {
          errorMessages.push(...error.error.errors[key]);
        }
      }
      this.errorMessage = errorMessages.join(', ');
    } else {
      this.errorMessage = error.error?.message || 'Ocurrió un error durante el registro';
    }
  }
}