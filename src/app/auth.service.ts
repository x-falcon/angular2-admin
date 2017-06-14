import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {HttpMsgClientService} from './httpMsgClient.service';
import * as jsrsasign from 'jsrsasign';
import 'rxjs/add/operator/toPromise';
@Injectable()
export class Auth {

  islogin = false;
  userinfo;
  redirectUrl;

  constructor(private hmcs: HttpMsgClientService) {
    console.log("Auth create");
    this.getSaveToken();
  }

  private getSaveToken() {
    let token = localStorage.getItem("auth");
    if (!token || !this.parseToken(token)) {
      this.hmcs.sget("/api/token").subscribe((response: any) => {
        if (response.status > 0) {
          localStorage.setItem("auth", response.token);
          this.parseToken(response.token);
        }
      });
    }
  }

  private parseToken(token: string): boolean {
    let userinfo;
    try {
      userinfo = jsrsasign.jws.JWS.readSafeJSONString(jsrsasign.b64utoutf8(token.split(".")[1]));
    } catch (e) {
      return false;
    }
    if (userinfo.exp < new Date().getTime() / 1000) {
      return false;
    }
    this.userinfo = userinfo;
    if (userinfo.user_id > 0) {
      this.islogin = true;
    }
    this.hmcs.setheader("Authorization", token);
    return true;
  }

  logout() {
    this.hmcs.removeheader("Authorization");
    localStorage.removeItem("auth");
    this.userinfo = null;
    this.islogin = false;
    this.getSaveToken();
  }

  login(user: any) {
    return this.userHandle("/api/user/login", user);
  }

  register(user: any) {
    return this.userHandle("/api/user/register", user);
  }

  private userHandle(url: string, user: any) {
    return this.hmcs.sget(url).map((response: any) => {
      const encryptedKey = response.pk;
      const pkey = jsrsasign.KEYUTIL.getKey(encryptedKey);
      const password = pkey.encrypt(user.password);
      user.password = jsrsasign.hextob64(password);
      return this.hmcs.post(url, user).map((response: any) => {
        if (response.status > 0) {
          localStorage.setItem("auth", response.token);
          this.parseToken(response.token);
        }
        return response;
      }).toPromise();
    }).toPromise();
  }
}
