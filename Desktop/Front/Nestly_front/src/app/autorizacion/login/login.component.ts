import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpLavavelService } from '../../http.service';
import { LocalstorageService } from '../../localstorage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  passwordFieldType: string = 'password';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpLavavelService,
    private router: Router,
    
    
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.passwordFieldType = this.showPassword ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.httpService.publicPost('login', this.loginForm.value)
      .subscribe({
        next: (response: any) => {
          if (response.access_token) {
            localStorage.setItem('accessToken', response.access_token);
            this.router.navigate(['/principal/dashboard']);
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message || 'Error en el inicio de sesión';
          this.loading = false;
        }
      });
  }

  private markFormAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
  
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}