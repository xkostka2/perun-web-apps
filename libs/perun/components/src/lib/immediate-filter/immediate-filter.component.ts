import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'perun-web-apps-immediate-filter',
  templateUrl: './immediate-filter.component.html',
  styleUrls: ['./immediate-filter.component.scss']
})
export class ImmediateFilterComponent implements OnInit {

  constructor() { }

  @Input()
  placeholder: string;

  @Output()
  filter = new EventEmitter<string>();

  @Input()
  autoFocus = false;

  formControl = new FormControl();

  ngOnInit(): void {
    this.formControl.valueChanges.subscribe(value => {
      let returnValue = value.trim();
      returnValue = returnValue.toLowerCase();
      this.filter.emit(returnValue);
    });
  }
}
