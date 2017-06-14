import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {
  Http,
  Headers,
  ResponseContentType,
  Response,
  RequestMethod,
  Request,
  BaseRequestOptions,
} from '@angular/http';
import * as msgpack from 'msgpack-lite';

@Injectable()
export class HttpMsgClientService {

  headers: Headers;

  constructor(private http: Http) {
    console.log("HttpMsgClientService create");
    this.headers = new Headers({"Content-Type": "application/msgpack", "Accept": "application/msgpack"});
  }

  setheader(name: string, value: string) {
    this.headers.set(name, value);
  }
  removeheader(name: string) {
    this.headers.delete(name);
  }
  sget(url: string): Observable<Response> {
    return this.get(url, null);
  }

  get(url: string, json_data: object): Observable<Response> {
    return this.request(url, RequestMethod.Get, json_data);
  }

  post(url: string, json_data: any): Observable<Response> {
    return this.request(url, RequestMethod.Post, json_data);
  }

  put(url: string, json_data: any): Observable<Response> {
    return this.request(url, RequestMethod.Put, json_data);
  }

  delete(url: string, json_data: any): Observable<Response> {
    return this.request(url, RequestMethod.Delete, json_data);
  }
  sdelete(url: string): Observable<Response> {
    return this.delete(url,null);
  }
  private request(url: string, method: RequestMethod, json_data?: any): Observable<Response> {
    if (json_data) {
      if (method == RequestMethod.Get || method == RequestMethod.Delete) {
        url = url + "?" + Object.keys(json_data).map(function (k) {
            if (json_data[k]) {
              return encodeURIComponent(k) + '=' + encodeURIComponent(json_data[k]);
            } else {
              return encodeURIComponent(k) + '=';
            }
          }).join('&');
        json_data = null;
      } else {
        let encode_data=msgpack.encode(json_data);
        //Utf8array to arraybuffer
        json_data = encode_data.buffer.slice(0,encode_data.byteLength);
      }
    }
    const options = new BaseRequestOptions();
    options.headers = this.headers;
    options.url = url;
    options.method = method;
    options.body = json_data;
    options.withCredentials = true;
    options.responseType = ResponseContentType.ArrayBuffer;
    const request = new Request(options);
    return this.http.request(request).map(response => msgpack.decode(new Uint8Array(response.arrayBuffer())));
  }

}
