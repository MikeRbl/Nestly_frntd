import { Component, OnInit } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
  helpful?: boolean | null; // Para la funcionalidad de "útil"
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  faqItems: FaqItem[] = []; // Contiene todas las preguntas frecuentes

  constructor() { }

  ngOnInit(): void {
    this.faqItems = [
      {
        question: '¿Cómo puedo publicar una propiedad?',
        answer: 'Para publicar una propiedad, ve a la sección "Publicar Propiedad", rellena todos los campos requeridos, incluyendo la ubicación en el mapa y sube al menos una foto. Luego, haz clic en "Publicar Propiedad".',
        open: false
      },
      {
        question: '¿Es gratis publicar propiedades?',
        answer: 'Sí, actualmente publicar propiedades en nuestra plataforma es completamente gratis. Queremos que más personas puedan encontrar su hogar ideal.',
        open: false
      },
      {
        question: '¿Cómo contacto al anunciante de una propiedad?',
        answer: 'En la página de detalles de cada propiedad, encontrarás la información de contacto del anunciante, que generalmente incluye un correo electrónico y un número de teléfono.',
        open: false
      },
      {
        question: '¿Puedo editar mi publicación después de publicarla?',
        answer: 'Sí, una vez que tu propiedad esté publicada, podrás editarla desde tu perfil. Busca la sección "Mis Propiedades" y selecciona la opción de editar.',
        open: false
      },
      {
        question: '¿Qué hago si tengo problemas con el mapa?',
        answer: 'Si el mapa no carga o no puedes seleccionar una ubicación, asegúrate de tener una conexión a internet estable. Si el problema persiste, intenta recargar la página.',
        open: false
      },
    
      {
        question: '¿Puedo subir videos de mi propiedad?',
        answer: 'Actualmente solo admitimos imágenes.',
        open: false
      }
    ];
  }

  toggleAccordion(item: FaqItem): void {
    // Cierra todas las demás preguntas
    this.faqItems.forEach(faqItem => {
      if (faqItem !== item) {
        faqItem.open = false;
      }
    });
    
    // Abre/cierra la pregunta actual
    item.open = !item.open;
    
    // Scroll suave para mantener la pregunta visible
    if (item.open) {
      setTimeout(() => {
        // Usamos el índice para obtener el ID, ya que no hay filtro
        const index = this.faqItems.indexOf(item);
        const element = document.getElementById('faq-' + index);
        element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  rateAnswer(item: FaqItem, helpful: boolean): void {
    item.helpful = helpful;
    // Aquí podrías enviar esta información a tu backend para análisis
    console.log(`Respuesta calificada como ${helpful ? 'útil' : 'no útil'}: ${item.question}`);
  }
}
