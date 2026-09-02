import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../../services/admin.service';
import { NotyfService } from '../../../../services/notyf.service';

@Component({
  selector: 'app-crear-usuario-admin',
  templateUrl: './crear-usuario-admin.component.html',
  styleUrls: ['./crear-usuario-admin.component.css']
})
export class CrearUsuarioAdminComponent implements OnInit {

  userForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notyfService: NotyfService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name_paternal: ['', [Validators.required, Validators.maxLength(255)]],
      last_name_maternal: ['', [Validators.maxLength(255)]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator 
    });
  }

  /**
   * Validador personalizado para asegurar que las contraseñas coincidan.
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordConfirmation = control.get('password_confirmation');

    if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
      passwordConfirmation.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      passwordConfirmation?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.notyfService.error('Por favor, completa todos los campos requeridos correctamente.');
      // Marcar todos los campos como "tocados" para mostrar los errores
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
  
    this.adminService.createUser(this.userForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.notyfService.success('Usuario creado exitosamente.');
        this.router.navigate(['/admin/usuarios-admin']); // Redirige a la lista de usuarios
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error al crear el usuario:', error);
       
        const errorMessage = error.error?.message || 'No se pudo crear el usuario.';
        this.notyfService.error(errorMessage);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/usuarios-admin']);
  }

  // Getters para facilitar el acceso a los controles en el HTML
  get f() {
    return this.userForm.controls;
  }
}
