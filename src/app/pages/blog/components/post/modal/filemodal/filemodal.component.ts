import { Component, OnInit, EventEmitter ,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {HttpMsgClientService} from "../../../../../../httpMsgClient.service";
import * as msgpack from 'msgpack-lite';

@Component({
  selector: 'app-filemodal',
  templateUrl: './filemodal.component.html',
  styleUrls: ['./filemodal.component.scss']
})
export class FilemodalComponent implements OnInit {

  isOk:boolean=false;
  picture:{};
  constructor(private activeModal: NgbActiveModal, private hmc: HttpMsgClientService) {
    const headers = this.hmc.headers.toJSON();
    delete headers['Content-Type'];
    delete headers['Accept'];
    headers['Accept'] = 'application/json';
    this.uploaderOptions['customHeaders'] = headers;
  }
  public uploaderOptions:any = {
    // url: 'http://website.com/upload'
    url: '/api/upload',
  };

  public fileUploaderOptions:any = {
    // url: 'http://website.com/upload'
    url: '',
  };
  ngOnInit() {}

  onConfirm() {
    this.activeModal.close(this.picture);
  }
  closeModal(){
    this.activeModal.close();
  }
  onUploadCompleted(data: any){
    this.picture=JSON.parse(data.response);
    this.isOk=true;
  }
}
