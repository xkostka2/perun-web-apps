import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-application-form-item-line',
  templateUrl: './edit-application-form-item-line.component.html',
  styleUrls: ['./edit-application-form-item-line.component.css']
})
export class EditApplicationFormItemLineComponent implements OnChanges {

  constructor() { }

  @Input()
  label: string;

  @Input()
  description: string;

  ngOnChanges(): void {
  }

}
