import {Component} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { EqualPasswordsValidator} from '../../theme/validators';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import {Auth} from "../../auth.service";

@Component({
  selector: 'register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {

  public form:FormGroup;
  public nicker:AbstractControl;
  public sex:AbstractControl;
  public password:AbstractControl;
  public repeatPassword:AbstractControl;
  public passwords:FormGroup;
  public username:AbstractControl;
  public birthday:AbstractControl;

  public submitted:boolean = false;

  constructor(fb:FormBuilder,private auth:Auth,public router: Router,private notificationsService: NotificationsService) {
    if(this.auth.islogin){
      this.notificationsService.info("login","has login");
      this.router.navigate(["/"]);
    }
    this.form = fb.group({
      'nicker': ['', [Validators.required, Validators.minLength(4)]],
      'sex':['',[Validators.required]],
      'birthday':['',[]],
      'username':['', [Validators.required, Validators.minLength(4)]],
      'passwords': fb.group({
        'password': ['', [Validators.required, Validators.minLength(4)]],
        'repeatPassword': ['',[Validators.required, Validators.minLength(4)]]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
    });

    this.nicker = this.form.controls['nicker'];
    this.passwords = <FormGroup> this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.sex=this.form.controls['sex'];
    this.username=this.form.controls['username'];
    this.birthday=this.form.controls['birthday'];
  }

  public onSubmit(values:Object):void {
    this.submitted = false;
    if (this.form.valid) {
      let user:any=values;
      user.password=user.passwords.password;
      delete user.passwords;
      user.birthday={__datetime__:true,timestamp:Date.parse([user.birthday.year,user.birthday.month,user.birthday.day].join('-'))/1000};
      user.sex=parseInt(user.sex);
      user.power=0;
      this.auth.register(user).then((response:any)=>{
        if(response.status>0){
          this.notificationsService.success("register",response.msg);
          this.router.navigate(["/"]);
        }else{
          this.notificationsService.error("register",response.msg);
        }
      });
    }
  }
}
