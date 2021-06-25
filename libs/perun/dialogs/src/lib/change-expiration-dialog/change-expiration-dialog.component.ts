import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  Attribute,
  AttributesManagerService,
  GroupsManagerService,
  MembersManagerService,
  Sponsor
} from '@perun-web-apps/perun/openapi';
import { formatDate } from '@angular/common';

@Component({
  selector: 'perun-web-apps-change-expiration-dialog',
  templateUrl: './change-expiration-dialog.component.html',
  styleUrls: ['./change-expiration-dialog.component.scss']
})
export class ChangeExpirationDialogComponent implements OnInit {

  @Input()
  currentExpiration: string;
  @Input()
  newExpiration: string;
  @Input()
  canExtendMembership = false;
  @Input()
  minDate: Date;
  @Input()
  maxDate: Date;
  @Input()
  mode: 'group' | 'vo' | 'sponsor';
  @Output()
  expirationChanged: EventEmitter<string> = new EventEmitter<string>()

  successMessage: string;
  expirationControl: FormControl = new FormControl(null);

  constructor(private dialogRef: MatDialogRef<ChangeExpirationDialogComponent>) { }

  ngOnInit(): void {
    if(this.newExpiration !== 'never'){
      this.expirationControl.setValue(this.newExpiration);
    }
  }

  onChange() {
    this.expirationChanged.emit(this.newExpiration);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  setExpiration() {
    this.newExpiration = formatDate(this.expirationControl.value, 'yyyy-MM-dd', 'en');
    this.expirationControl.setValue(formatDate(this.expirationControl.value, 'yyyy-MM-dd', 'en'));
  }
}
