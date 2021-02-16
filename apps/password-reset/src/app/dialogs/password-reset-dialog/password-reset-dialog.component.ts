import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ErrorStateMatcher } from '@angular/material/core';

export interface PasswordResetDialogData {
  mode: string
}

export class PasswordStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

@Component({
  selector: 'perun-web-apps-password-reset-dialog',
  templateUrl: './password-reset-dialog.component.html',
  styleUrls: ['./password-reset-dialog.component.scss']
})
export class PasswordResetDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: PasswordResetDialogData,
    private translate: TranslateService
  ) { }

  oldPasswd: FormControl = new FormControl('', Validators.required);
  newPasswdForm = new FormGroup({
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', Validators.required)
  }, this.passwordMatchValidator);

  matcher = new PasswordStateMatcher();

  mode = '';
  title = '';

  ngOnInit(): void {
    this.mode = this.data.mode;

    switch (this.mode) {
      case 'change': {
        this.title = this.translate.instant('DIALOGS.PASSWORD_CHANGE.TITLE_CHANGE');
        break;
      }
      case 'reset': {
        this.title = this.translate.instant('DIALOGS.PASSWORD_CHANGE.TITLE_RESET');
        break;
      }
      case 'activation': {
        this.title = this.translate.instant('DIALOGS.PASSWORD_CHANGE.TITLE_ACTIVATION');
        break;
      }
    }
  }

  passwordMatchValidator(group: FormGroup) {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : {'mismatch': true};
  }

  onSubmit() {
    console.log("Yey :)");
  }
}
