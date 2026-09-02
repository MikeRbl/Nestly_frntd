import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'primeraMayuscula'
})
export class PrimeraMayusculaPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    
    if (!value) return '';
    const texto = value.toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

}
