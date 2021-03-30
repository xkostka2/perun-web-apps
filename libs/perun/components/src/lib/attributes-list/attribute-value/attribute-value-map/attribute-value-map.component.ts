import { Component, Input, OnInit} from '@angular/core';
import { Attribute } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { ShowValueDialogComponent } from '@perun-web-apps/perun/dialogs';
import { getDefaultDialogConfig, isVirtualAttribute } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-attribute-value-map',
  templateUrl: './attribute-value-map.component.html',
  styleUrls: ['./attribute-value-map.component.scss']
})
export class AttributeValueMapComponent implements OnInit {

  constructor(private dialog: MatDialog) {
  }

  @Input()
  attribute: Attribute;

  @Input()
  readonly = false;

  keys: string[] = [];
  values: string[] = [];

  defaultItemsShown = 3;
  itemsShown: number;

  showMore = false;

  ngOnInit() {
    if (this.attribute.value !== undefined) {
      const map = this.attribute.value as Map<string, string>;
      for (const [key, value] of Object.entries(map)) {
        this.keys.push(key);
        this.values.push(value);
      }
    }
    this.itemsShown = this.readonly ? this.values.length : this.defaultItemsShown;
    this.showMore = this.readonly;
    if(!this.readonly){
      this.readonly = isVirtualAttribute(this.attribute);
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  addValue() {
    this.keys.push('')
    this.values.push('');

    if(this.values.length > this.defaultItemsShown){
      this.showMore = true;
      this.setItemsShown()
    }
  }

  removeValue(index: number) {
    this.keys.splice(index, 1);
    this.values.splice(index, 1);
  }

  updateAttribute() {
    const map = {};
    for (let i = 0; i < this.keys.length; i++) {
      map[this.keys[i]] = this.values[i];
    }
    if (this.keys.length === 0) {
      this.attribute.value = undefined;
    } else {
      this.attribute.value = map;
    }
  }

  showValue(value: string, title: string) {
    const config = getDefaultDialogConfig();
    config.width = '350px';
    config.data = {
      value: value,
      title: title
    };
    this.dialog.open(ShowValueDialogComponent, config);
  }

  setItemsShown() {
    if(this.showMore){
      this.itemsShown = this.values.length;
    } else {
      this.itemsShown = this.defaultItemsShown;
    }
  }

  onShowChange() {
    this.showMore = !this.showMore;

    this.setItemsShown();
  }

}

