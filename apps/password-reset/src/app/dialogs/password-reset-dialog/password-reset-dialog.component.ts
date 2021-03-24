import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';
import { of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface PasswordResetDialogData {
  mode: string;
  token?: string;
  namespace?: string;
}

export class PasswordStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

/**
 * State matcher that shows error on inputs whenever the input is changed and invalid (by default, the error
 * is shown after leaving the input field)
 */
export class ImmediateStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && control.dirty);
  }
}

export const loginAsyncValidator =
  (namespace: string, usersManager: UsersManagerService, apiRequestConfiguration: ApiRequestConfigurationService, time: number = 500) => {
    return (input: FormControl) => {
      return timer(time).pipe(
        switchMap(() => {
          apiRequestConfiguration.dontHandleErrorForNext();
          if (namespace === null || namespace === 'No namespace') {
            return of(null);
          }
          return usersManager.checkPasswordStrength(input.value, namespace)
        }),
        map(() => null),
        // catch error and send it as a valid value
        catchError(err => of({backendError: err.error.message.substr(err.error.message.indexOf(":")+1)})),
      );
    };
  };

@Component({
  selector: 'perun-web-apps-password-reset-dialog',
  templateUrl: './password-reset-dialog.component.html',
  styleUrls: ['./password-reset-dialog.component.scss']
})
export class PasswordResetDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: PasswordResetDialogData,
    private translate: TranslateService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private usersService: UsersManagerService) { }

  oldPasswd: FormControl = new FormControl('', Validators.required);
  newPasswdForm = new FormGroup({
    password: new FormControl('', Validators.required,
      [loginAsyncValidator(this.data.namespace, this.usersService, this.apiRequestConfiguration)]),
    passwordConfirm: new FormControl('', Validators.required),
    showPassword: new FormControl(false),
  }, this.passwordMatchValidator);

  passwordStateMatcher = new PasswordStateMatcher();
  immediateStateMatcher = new ImmediateStateMatcher();

  mode = '';
  title = '';

  loading = false;
  success = false;

  ngOnInit(): void {
    this.loading = true;
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
    this.loading = false;
  }

  passwordMatchValidator(group: FormGroup) {
    return group.get('password').value === group.get('passwordConfirm').value
      ? null : {'mismatch': true};
  }

  onSubmit() {
    this.loading = true;
    this.usersService.changeNonAuthzPasswordByToken(this.data.token, this.newPasswdForm.get('password').value).subscribe(() => {
      this.success = true;
      this.loading = false;
    });
  }
}
