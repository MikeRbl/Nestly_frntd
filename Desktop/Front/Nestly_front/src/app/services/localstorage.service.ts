import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}
  setItem(key: string, value: string){
    if(isPlatformBrowser(this.platformId)){
      localStorage.setItem(key, value);
    }
  }
  getItem(key: string){
    if(isPlatformBrowser(this.platformId)){
      return localStorage.getItem(key);
    }
    return null;
  }
  clean(){
    if(isPlatformBrowser(this.platformId)){
      localStorage.clear();
    }
  }
  leanItem(key: string){
    if(isPlatformBrowser(this.platformId)){
      localStorage.getItem(key);
    }
  }


}
function cleanItem(key: any, string: any) {
  throw new Error('Function not implemented.');
}
