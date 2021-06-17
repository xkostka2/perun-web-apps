import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'perun-web-apps-group-resource-status',
  templateUrl: './group-resource-status.component.html',
  styleUrls: ['./group-resource-status.component.css']
})
export class GroupResourceStatusComponent implements OnInit{

  constructor() { }

  @Input()
  status = "";

  ngOnInit(): void {
  }

}
