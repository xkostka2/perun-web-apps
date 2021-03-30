import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'perun-web-apps-expiration-select',
  templateUrl: './expiration-select.component.html',
  styleUrls: ['./expiration-select.component.css']
})
export class ExpirationSelectComponent implements OnInit {

  constructor() { }

  @Input()
  expiration = 'never';

  expirationControl = new FormControl(null);
  minDate: Date;

  @Output()
  datePicker: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit(): void {
    const currentDate = new Date();
    this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    this.expirationControl.setValue(formatDate(this.minDate,'yyyy-MM-dd','en-GB'));
  }

  setExpiration() {
    this.expiration = formatDate(this.expirationControl.value,'yyyy-MM-dd','en-GB');
    this.expirationControl.setValue(formatDate(this.expirationControl.value,'yyyy-MM-dd','en-GB'));

    this.emitDate()
  }

  emitDate() {
    if (this.expiration !== 'never' && this.expirationControl.value === ''){
      return
    }

    this.datePicker.emit(this.expiration);
  }

}
