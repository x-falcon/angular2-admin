import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'diagmodal',
  styleUrls: ['./linkmodal.component.scss'],
  templateUrl: './linkmodal.component.html'
})

export class LinkmodalComponent implements OnInit {

  modalHeader: string;
  modalContent: string = `Lorem ipsum dolor sit amet,
   consectetuer adipiscing elit, sed diam nonummy
   nibh euismod tincidunt ut laoreet dolore magna aliquam
   erat volutpat. Ut wisi enim ad minim veniam, quis
   nostrud exerci tation ullamcorper suscipit lobortis
   nisl ut aliquip ex ea commodo consequat.`;
  url:string;
  constructor(private activeModal: NgbActiveModal) {
  }

  ngOnInit() {}

  link() {
    this.activeModal.close(this.url);
  }
}
