import { Component } from '@angular/core';
import { HttpLavavelService } from '../../http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalstorageService } from '../../localstorage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
LoginFormulario: FormGroup;

constructor(
  private fb: FormBuilder,
  private service: HttpLavavelService,
  private router: Router,
  private localStorage: LocalstorageService
){
  this.LoginFormulario = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['',[Validators.required]],
  });
}



onLoggedin(){
  if(this.LoginFormulario.invalid){
    return;
  }
  console.log(this.LoginFormulario.value);

  this.service
  .Service_Post('user', 'login', this.LoginFormulario.value)
  .subscribe(
    (data: any) => {
      console.log(data);

      if(data.estatus){
        this.localStorage.setItem('accessToken', data.access_token);
        this.router.navigate(['/']);
      }
    },
    (error) => {
      console.log(error);
    }
  )
}


isValid(field:string): boolean{
return !!(
this.LoginFormulario.controls[field].errors &&
this.LoginFormulario.controls[field].touched
);
}

get f(){
  return this.LoginFormulario.controls;
}









Guardar(){
  if(this.LoginFormulario.invalid){
    this.LoginFormulario.markAllAsTouched();
    return;
  }
  console.log(this.LoginFormulario.value);
  this.LoginFormulario.reset({email:'',password:''});
}










}
