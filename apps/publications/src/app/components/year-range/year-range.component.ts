import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-year-range',
  templateUrl: './year-range.component.html',
  styleUrls: ['./year-range.component.scss']
})
export class YearRangeComponent implements OnInit {

  constructor() { }

  startMaxYear: Date;
  endMinYear: Date;
  endMaxYear: Date;

  @Input()
  startYear: FormControl;

  @Input()
  endYear: FormControl;

  ngOnInit(): void {
    this.endMaxYear = new Date();
    this.startMaxYear = this.endYear.value;
    this.endMinYear = this.startYear.value;
  }

  chosenYearHandler(dateFormControl: FormControl, event: FormControl, datepicker: any) {
    dateFormControl.setValue(event);
    this.startMaxYear = this.endYear.value;
    this.endMinYear = this.startYear.value;
    datepicker.close();
  }

}
