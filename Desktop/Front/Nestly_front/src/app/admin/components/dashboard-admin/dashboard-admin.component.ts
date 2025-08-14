import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpLavavelService } from '../../../http.service'; // Asegúrate que la ruta sea correcta
import { NotyfService } from '../../../services/notyf.service'; // Asegúrate que la ruta sea correcta
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {

  // --- PROPIEDADES DEL COMPONENTE ---

  isLoading = true;
  stats = {
    total_users: 0,
    active_properties: 0,
    current_rents: 0,
    monthly_income: 0
  };
  recentActivities: any[] = [];

  /**
   * Referencia segura al elemento <canvas> en el HTML.
   * Usamos '!' para decirle a TypeScript que estamos seguros de que este
   * elemento existirá cuando lo necesitemos.
   */
  @ViewChild('userChart') private chartCanvas!: ElementRef;

  /**
   * Variable para almacenar la instancia de la gráfica de Chart.js.
   * Usamos '!' por la misma razón que arriba. Se inicializará en initChart().
   */
  private chart!: Chart;

  // --- MÉTODOS DEL CICLO DE VIDA ---

  constructor(
    private httpService: HttpLavavelService,
    private notyfService: NotyfService
  ) {}

  /**
   * ngOnInit se ejecuta una vez que el componente es inicializado.
   * Es el lugar ideal para iniciar la carga de datos.
   */
  ngOnInit(): void {
    this.loadDashboardData();
  }

  // --- MÉTODOS DE LÓGICA ---

  /**
   * Carga todos los datos necesarios para el dashboard desde el backend.
   */
  /**
   * Carga todos los datos necesarios para el dashboard desde el backend.
   */
  loadDashboardData(): void {
    this.isLoading = true;
    this.httpService.Service_Get('admin/stats').subscribe({
      next: (response: any) => {
        // Asignamos los datos a las propiedades del componente
        this.stats = response.stats;
        this.recentActivities = response.recent_activities;
        
        // 1. PRIMERO: Hacemos que el canvas sea visible en el HTML
        this.isLoading = false;

        // 2. SEGUNDO: Esperamos un instante antes de dibujar
        // Esto le da tiempo a Angular para renderizar el canvas en la pantalla.
        setTimeout(() => {
          this.initChart(response.user_chart.labels, response.user_chart.values);
        }, 0);
        
      },
      error: (err) => {
        console.error('La API devolvió un ERROR:', err);
        this.notyfService.error('No se pudieron cargar los datos del dashboard.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Inicializa o actualiza la gráfica con los datos proporcionados.
   * @param labels - Un array de strings para el eje X (ej: los meses).
   * @param data - Un array de números para el eje Y (ej: cantidad de usuarios).
   */
  initChart(labels: string[], data: number[]): void {
    // Si por alguna razón el canvas no existiera, salimos para evitar errores.
      console.log('Buscando el canvas para dibujar. El resultado es:', this.chartCanvas);

    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Si ya existe una gráfica, la destruimos antes de crear una nueva.
    // Esto es importante si permites recargar los datos sin refrescar la página.
    if (this.chart) {
      this.chart.destroy();
    }

    // Creamos la nueva instancia de la gráfica.
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nuevos Usuarios',
          data: data,
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4, // Suaviza la línea
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false 
          }
        }
      }
    });
  }
}