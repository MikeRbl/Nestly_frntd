import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../interface/usuario.interface';
import { AuthService } from '../../../auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-resena-form',
  templateUrl: './resena-form.component.html',
  styleUrls: ['./resena-form.component.css']
})
export class ResenaFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public usuarioActual: User | null = null;
  @Output() formSubmit = new EventEmitter<{ puntuacion: number; comentario: string }>();

  public formEnviado = false;
  public isFormActive = false;
  public readonly stars: number[] = [1, 2, 3, 4, 5];
  public hoveredRating = 0;
  public resenaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService 
  ) {
    this.resenaForm = this.fb.group({
      puntuacion: [null, Validators.required],
      comentario: ['']
    });
  }

  ngOnInit(): void {
    // 1. Suscripción reactiva al usuario actual
    console.log('usuarioActual avatar_url:', this.usuarioActual?.avatar_url);

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.usuarioActual = user;
        console.log('Usuario actualizado:', user);
      });

    // 2. Carga inicial síncrona (para retrocompatibilidad)
    this.usuarioActual = this.authService.obtenerUsuarioActualId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  get f() { return this.resenaForm.controls; }

  // Simplify star rating logic to avoid template errors
  get effectiveRating(): number {
    return this.hoveredRating > 0 ? this.hoveredRating : this.resenaForm.get('puntuacion')?.value || 0;
  }

  public rate(rating: number): void { 
    this.resenaForm.get('puntuacion')?.setValue(rating); 
    this.isFormActive = true; 
  }

  public onStarHover(rating: number): void { this.hoveredRating = rating; }
  public onStarLeave(): void { this.hoveredRating = 0; }
  
  public onSubmit(): void {
    this.formEnviado = true;
    if (this.resenaForm.invalid) { return; }
    this.formSubmit.emit(this.resenaForm.value);
    this.resenaForm.reset();
    this.formEnviado = false;
    this.isFormActive = false;
  }

  getFullImageUrl(path?: string, defaultImg: string = 'assets/default-profile.png'): string {
    if (!path || path.trim() === '') return defaultImg;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}