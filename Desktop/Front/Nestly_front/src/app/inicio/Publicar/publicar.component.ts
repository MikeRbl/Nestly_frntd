import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-publicar',
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent implements OnInit {
  formulario!: FormGroup;
  imagenURLs: (string | ArrayBuffer | null)[] = [];
  vistaPrevia = false;
  datosPublicacion: any = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', Validators.required],
      ubicacion: ['', Validators.required]
    });
  }

  cargarImagen(event: any): void {
    const archivos: FileList = event.target.files;
    this.imagenURLs = [];

    if (archivos && archivos.length > 0) {
      Array.from(archivos).forEach(archivo => {
        const reader = new FileReader();
        reader.onload = () => this.imagenURLs.push(reader.result);
        reader.readAsDataURL(archivo);
      });
    }
  }

  publicarPropiedad(): void {
    if (this.formulario.valid && this.imagenURLs.length > 0) {
      this.datosPublicacion = {
        ...this.formulario.value,
        imagenes: this.imagenURLs
      };
      this.vistaPrevia = true;
    }
  }

  editar(): void {
    this.vistaPrevia = false;
  }
}
