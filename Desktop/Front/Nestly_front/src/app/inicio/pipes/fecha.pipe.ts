import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'fechaPipe' })  
export class FechaPipe implements PipeTransform {
  transform(value: string): string {
    const datePipe = new DatePipe('es-ES'); 
    return datePipe.transform(value, 'dd \'de\' MMMM \'de\' yyyy') || '';
  }
}