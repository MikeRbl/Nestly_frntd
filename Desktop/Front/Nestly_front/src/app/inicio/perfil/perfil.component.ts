import { Component, OnInit } from '@angular/core';
import { HttpLavavelService } from '../../http.service';

interface User { //INTERFAZ DE LA API DE LARAVEL
  id: number;
  first_name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  role: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  userData: User | null = null; //Almacena los datos del usuario obtenidos del servidor
  isLoading: boolean = true;
  errorMessage: string = '';
  selectedImage: string | ArrayBuffer | null = null;
  constructor(private Shttp: HttpLavavelService) {}

  ngOnInit(): void { //funcion para ejectutar la otra funcion
    this.loadUserData();
  }
   // Maneja la selección de la foto de perfil
   onFileChange(event: any): void {
    const file = event.target.files[0]; // Obtener el primer archivo seleccionado
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result; // Guardar la URL de la imagen seleccionada
      };
      reader.readAsDataURL(file); // Leer el archivo como URL base64
    }
  }
  loadUserData(): void { //FUNCION loadUserData es clave para obtener y manejar los datos desde la backend
    this.isLoading = true; //Solo muestra un mensaje de cargar (mejora la experiencia del usuario)
    //sbscribe es importante o sino la peticion no se ejecuta
    this.Shttp.Service_Get('user').subscribe({ //Realiza una petición HTTP GET al endpoint 'user' de tu API Laravel ('user': Ruta relativa del endpoint (normalmente se convierte en algo como https://tudominio.com/api/user)
      next: (response: any) => { //contiene los datos devueltos por el servidor 
        console.log('Respuesta completa:', response);
        
        // Extrae los datos del objeto 'user' en la respuesta
        this.userData = response.user; // Guarda los datos en this.userData para usarlos en la vista
        
        console.log('Datos del usuario:', this.userData);
        this.isLoading = false; //Desactiva el indicador de carga
      },
      error: (err) => {//err: Objeto con detalles del error
        console.error('Error al cargar datos:', err);
        this.errorMessage = 'Error al cargar los datos del usuario';//Guarda un mensaje amigable para mostrar al usuario
        this.isLoading = false;
      }
    });
  }

 
  
  logout() {
    localStorage.removeItem('token'); 
    window.location.href = '/login'; 
  }
}