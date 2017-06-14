import {Component} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import {Auth} from "../../auth.service";
import { NotificationsService } from 'angular2-notifications';


@Component({
  selector: 'login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  public form:FormGroup;
  public username:AbstractControl;
  public password:AbstractControl;
  public submitted:boolean = false;

  constructor(fb:FormBuilder,private auth:Auth,public router: Router, private notificationsService: NotificationsService ) {
    if(this.auth.islogin){
      this.router.navigate([""]);
    }
    this.form = fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.username = this.form.controls['username'];
    this.password = this.form.controls['password'];
  }

  public onSubmit(values:Object):void {
    if (this.form.valid) {
      // your code goes here
      // console.log(values);
      this.auth.login({ username: this.username.value, password: this.password.value }).then((response:any)=>{
        if(response.status > 0){
          this.notificationsService.success('login info',response.msg);
          const redirectUrl = this.auth.redirectUrl ? this.auth.redirectUrl : '/';
          this.router.navigate([redirectUrl]);
        }else{
          this.notificationsService.alert('login info',response.msg);
        }
      }).catch(reasson=>{
        this.notificationsService.error('login info',reasson.statusText);
      });
    }
  }
}
