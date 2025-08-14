import { Component, OnInit } from '@angular/core';

interface Propiedad {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  estado: 'disponible' | 'rentada' | 'en mantenimiento';
  imagenUrl: string;
}

@Component({
  selector: 'app-gestion-propiedades',
  templateUrl: './gestion-propiedades-admin.component.html',
  styleUrls: ['./gestion-propiedades-admin.component.css']
})
export class GestionPropiedadesAdminComponent implements OnInit {
  propiedades: Propiedad[] = [];

  constructor() {}

  ngOnInit(): void {
    // Aquí cargarías las propiedades, pero de momento hardcode para demo
    this.propiedades = [
      {
        id: 1,
        titulo: 'Departamento en Polanco',
        descripcion: 'Muy bonito y céntrico.',
        precio: 15000,
        estado: 'disponible',
        imagenUrl: 'https://via.placeholder.com/150'
      },
      {
        id: 2,
        titulo: 'Casa en Coyoacán',
        descripcion: 'Amplia, perfecta para familia.',
        precio: 20000,
        estado: 'rentada',
        imagenUrl: 'https://via.placeholder.com/150'
      }
    ];
  }

  editarPropiedad(id: number) {
    alert(`Editar propiedad con id: ${id}`);
    // Aquí iría la navegación a un form para editar
  }

  eliminarPropiedad(id: number) {
    const confirmDelete = confirm('¿Seguro que quieres eliminar esta propiedad?');
    if (confirmDelete) {
      this.propiedades = this.propiedades.filter(p => p.id !== id);
      alert('Propiedad eliminada');
      // Aquí harías la llamada al backend para eliminar
    }
  }

  agregarPropiedad() {
    alert('Ir a formulario para agregar propiedad');
    // Aquí navegarías a la vista para crear una propiedad
  }
}
