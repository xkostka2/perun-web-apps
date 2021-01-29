import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss']
})
export class DateRangeComponent implements OnInit {

  constructor() { }

  startMinDate: Date;
  startMaxDate: Date;
  endMinDate: Date;
  endMaxDate: Date;

  @Input()
  startDate: FormControl;

  @Input()
  endDate: FormControl;

  @Output()
  datePicker: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit(): void {
    this.startMinDate = new Date(2000, 0, 1);
    this.endMaxDate = new Date();
    this.startMaxDate = this.endDate.value;
    this.endMinDate = this.startDate.value;
  }


  dateChange() {
    this.datePicker.emit();
    this.startMaxDate = this.endDate.value;
    this.endMinDate = this.startDate.value;
  }

}
