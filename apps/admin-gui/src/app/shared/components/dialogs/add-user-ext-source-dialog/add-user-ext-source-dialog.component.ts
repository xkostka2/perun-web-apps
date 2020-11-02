import { Component, Inject, OnInit } from '@angular/core';
import {
  ExtSource,
  ExtSourcesManagerService, UserExtSource,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface AddUserExtSourceDialogData {
  userId: number;
}

@Component({
  selector: 'app-add-user-ext-source-dialog',
  templateUrl: './add-user-ext-source-dialog.component.html',
  styleUrls: ['./add-user-ext-source-dialog.component.scss']
})
export class AddUserExtSourceDialogComponent implements OnInit {

  extSources: ExtSource[] = [];
  filteredExtSources: Observable<ExtSource[]>;
  loginControl: FormControl;
  extSourcesControl: FormControl;
  loading: boolean;
  successMessage: string;

  constructor(private dialogRef: MatDialogRef<AddUserExtSourceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: AddUserExtSourceDialogData,
              private extSourcesManagerService: ExtSourcesManagerService,
              private usersManagerService: UsersManagerService,
              private translate: TranslateService,
              private notificator: NotificatorService) {
    translate.get('DIALOGS.ADD_USER_EXT_SOURCE.SUCCESS').subscribe(res => this.successMessage = res);
  }

  ngOnInit(): void {
    this.loading = true;
    this.loginControl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
    this.extSourcesControl = new FormControl('', [Validators.required]);
    this.loginControl.markAllAsTouched();
    this.extSourcesControl.markAllAsTouched();
    this.filteredExtSources = this.extSourcesControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    this.extSourcesManagerService.getExtSources().subscribe(extSources => {
      this.extSources = extSources;

      this.filteredExtSources = this.extSourcesControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      this.loading = false;
    }, () => this.loading = false);
  }

  displayFn(extSource?: ExtSource): string | undefined {
    return extSource ? extSource.name : null;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onAdd() {
    this.loading = true;
    const ues: UserExtSource = {
      beanName: '',
      extSource: this.extSourcesControl.value,
      id: 0,
      login: this.loginControl.value,
      userId: this.data.userId
    };
    this.usersManagerService.addUserExtSource({ user: this.data.userId, userExtSource: ues }).subscribe(() => {
      this.loading = false;
      this.notificator.showSuccess(this.successMessage);
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  private _filter(value: string | ExtSource): ExtSource[] {
    const filterValue = typeof (value) === 'string' ? value.toLowerCase() : value.name.toLowerCase;
    return this.extSources.filter(option => option.name.toLowerCase().includes(<string>filterValue));
  }
}
