import { Component, OnInit } from "@angular/core";
import { HttpLavavelService } from "../../http.service";

interface User {
    id: number;
    first_name: string;
    last_name_paternal: string;
    last_name_maternal: string;
    email: string;
    phone: string;
    role: string;
    created_at: string;
    updated_at: string;
}

@Component({
    selector: "app-editar-perfil",
    templateUrl: "./editarPerfil.component.html",
    styleUrls: ["./editarPerfil.component.scss"],
})
export class EditarPerfilComponent implements OnInit {
    userData: User | null = null;
    isLoading: boolean = true;
    isSaving: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    password: string = '';
    passwordConfirmation: string = '';
    formChanges: any = {};

    constructor(private Shttp: HttpLavavelService) {}

    ngOnInit(): void {
        this.loadUserData();
    }

    loadUserData(): void {
        this.isLoading = true;
        this.Shttp.Service_Get('user').subscribe({
            next: (response: any) => {
                this.userData = response.user;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar datos:', err);
                this.errorMessage = 'Error al cargar los datos del usuario';
                this.isLoading = false;
            }
        });
    }

    onFieldChange(field: string, value: any) {
        this.formChanges[field] = value;
    }

    onSubmit() {
        if (!this.userData || Object.keys(this.formChanges).length === 0) {
            this.errorMessage = 'No hay cambios para guardar';
            return;
        }

        // Validar confirmación de contraseña
        if (this.password && this.password !== this.passwordConfirmation) {
            this.errorMessage = 'Las contraseñas no coinciden';
            return;
        }

        this.isSaving = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Preparar datos para enviar
        const updateData = {...this.formChanges};
        if (this.password) {
            updateData.password = this.password;
            updateData.password_confirmation = this.passwordConfirmation;
        }

        this.Shttp.Service_Put('users', this.userData.id, updateData).subscribe({
            next: (response) => {
                this.isSaving = false;
                this.successMessage = 'Perfil actualizado correctamente';
                if (this.userData) {
                    this.userData = { ...this.userData, ...this.formChanges };
                }
                this.formChanges = {};
                this.password = '';
                this.passwordConfirmation = '';
            },
            error: (err) => {
                console.error('Error al actualizar:', err);
                this.errorMessage = err.error?.message || 
                                   err.error?.errors ? 
                                   this.formatErrors(err.error.errors) : 
                                   'Error al actualizar el perfil';
                this.isSaving = false;
            }
        });
    }

    private formatErrors(errors: any): string {
        return Object.values(errors).flat().join(', ');
    }

    logout() {
        localStorage.removeItem('token'); 
        window.location.href = '/login'; 
    }
}