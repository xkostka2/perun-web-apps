import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Destination, Host } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-object-list-values',
  templateUrl: './object-list-values.component.html',
  styleUrls: ['./object-list-values.component.css']
})
export class ObjectListValuesComponent implements OnInit, OnChanges {

  constructor() { }

  @Input()
  objects: Destination[] | Host[] = [];

  @Input()
  filterValue = '';

  @Input()
  paramName = ''

  showMore = false;
  defaultItemsShown = 3;
  itemsShown: number;


  ngOnInit(): void {
    this.itemsShown = this.defaultItemsShown;
  }

  ngOnChanges() {
    this.itemsShown = this.defaultItemsShown;
    this.showMore = false;
  }

  onShowChange() {
    this.showMore = !this.showMore;
    if(this.showMore){
      this.itemsShown = this.objects.length;
    } else {
      this.itemsShown = this.defaultItemsShown;
    }
  }
}
