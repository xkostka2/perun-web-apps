import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  InputCreateSponsoredMember,
  MembersManagerService,
  NamespaceRules,
  RichMember,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService, StoreService } from '@perun-web-apps/perun/services';
import {
  AsyncValidatorFn,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';

export interface CreateSponsoredMemberDialogData {
  entityId?: number
  voId?: number;
  theme: string,
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
  selector: 'app-create-sponsored-member-dialog',
  templateUrl: './create-sponsored-member-dialog.component.html',
  styleUrls: ['./create-sponsored-member-dialog.component.scss']
})
export class CreateSponsoredMemberDialogComponent implements OnInit {

  theme: string;
  loading = false;
  functionalityNotSupported = false;
  loginThatWasSet = '';
  successfullyCreated = false;
  createdMember: RichMember;

  namespaceOptions: string[] = [];
  namespaceRules: NamespaceRules[] = [];
  parsedRules: Map<string, {login: string, password: string}> =
    new Map<string, {login: string, password: string}>();

  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

  firstName = new FormControl('', [Validators.required]);

  lastName = new FormControl('', [Validators.required]);

  titleBefore = '';

  titleAfter = '';

  passwordReset = false;
  passwordResetDisabled = false;
  password: FormControl;
  passwordStateMatcher = new ImmediateStateMatcher();

  namespace = new FormControl('', [Validators.required]);

  login = new FormControl('', [Validators.required]);

  email = new FormControl('', [Validators.required, Validators.pattern(this.emailRegx)]);

  expiration = 'never';

  private selectedNamespace: string;
  showPassword = false;

  constructor(private dialogRef: MatDialogRef<CreateSponsoredMemberDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: CreateSponsoredMemberDialogData,
              private membersService: MembersManagerService,
              private apiRequestConfiguration: ApiRequestConfigurationService,
              private usersService: UsersManagerService,
              private store: StoreService,
              private translator: TranslateService) {
    this.password = new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [loginAsyncValidator(null, usersService, apiRequestConfiguration)]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;

    this.membersService.getAllNamespacesRules().subscribe(rules => {
      if (this.store.get('allow_empty_sponsor_namespace')) {
        this.namespaceRules.push({
          namespaceName: 'No namespace',
          requiredAttributes: [],
          optionalAttributes: []
        });
      }

      this.namespaceRules = this.namespaceRules.concat(rules);
      this.parseNamespaceRules();
      if (this.namespaceOptions.length === 0) {
        this.functionalityNotSupported = true;
      }
      this.loading = false;
    });
  }

  parseNamespaceRules(){
    for (const rule of this.namespaceRules) {
      this.namespaceOptions.push(rule.namespaceName);

      const fieldTypes =  {login: 'disabled', password: 'disabled'};
      this.parseAttributes(fieldTypes, rule.requiredAttributes, 'required');
      this.parseAttributes(fieldTypes, rule.optionalAttributes, 'optional');

      this.parsedRules.set(rule.namespaceName, fieldTypes);
    }
  }

  parseAttributes(field, attributes, type: string) {
    for (const att of attributes) {
      switch (att) {
        case 'login': {
          field.login = type;
          break;
        }
        case 'password': {
          field.password = type;
          break;
        }
        default: break;
      }
    }
  }

  onConfirm() {
    this.loading = true;

    const sponsoredMember: InputCreateSponsoredMember = {
      vo: this.data.voId,
      userData: {
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        titleAfter: this.titleAfter,
        titleBefore: this.titleBefore,
        email: this.email.value
      },
      sponsor: this.store.getPerunPrincipal().userId,
    }

    const rules = this.parsedRules.get(this.namespace.value);
    if (this.namespace.value !== 'No namespace') {
      sponsoredMember.userData.namespace = this.namespace.value;
    }

    if (rules.login !== 'disabled') {
      sponsoredMember.userData.login = this.login.value;
    }

    if (rules.password !== 'disabled') {
      sponsoredMember.sendActivationLink = this.passwordReset;
      sponsoredMember.userData.password = this.password.value;
    }

    if(this.expiration !== 'never'){
      sponsoredMember.validityTo = this.expiration;
    }

    this.membersService.createSponsoredMember(sponsoredMember).subscribe(richMember => {
      this.successfullyCreated = true;
      this.dialogRef.updateSize('600px');
      this.createdMember = richMember;
      if(!!richMember && !!richMember.userAttributes){
        richMember.userAttributes
          .filter(attr => attr.baseFriendlyName === 'login-namespace')
          .filter(attr => attr.friendlyNameParameter === this.namespace.value)
          .filter(attr => attr.value !== null)
          .forEach(attr => {
            this.loginThatWasSet = attr.value.toString();
          });
      }
      this.loading = false;
    }, () => {
      this.loading = false
    });
  }

  onCancel() {
    if (this.successfullyCreated) {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close();
    }

  }

  enableFormControl(control: FormControl, validators: ValidatorFn[], asyncValidators: AsyncValidatorFn[] = []) {
    control.enable();
    control.clearValidators();
    control.clearAsyncValidators();
    control.setValidators(validators);
    control.setAsyncValidators(asyncValidators);
    control.updateValueAndValidity();
  }

  onNamespaceChanged(namespc: string) {
    this.selectedNamespace = namespc;
    const rules = this.parsedRules.get(namespc);
    this.login.disable();
    this.password.disable();
    this.passwordReset = false;
    this.passwordResetDisabled = true;

    if (rules.login !== 'disabled') {
      const validators = rules.login === 'optional' ? [] : [Validators.required];
      this.enableFormControl(this.login, validators);
    }
    if (rules.password !== 'disabled') {
      const validators = rules.password === 'optional' ? [] : [Validators.required];
      this.enableFormControl(this.password, validators, [loginAsyncValidator(namespc, this.usersService, this.apiRequestConfiguration)])
      this.passwordResetDisabled = false;
    }
  }

  passwordResetChange() {
    if (this.passwordReset){
      this.password.disable();
      this.password.setValue('');
    } else {
      this.password.enable();
    }
  }

  setExpiration(newExpiration) {
    if (newExpiration === 'never') {
      this.expiration = 'never';
    } else {
      this.expiration = formatDate(newExpiration, 'yyyy-MM-dd', 'en-GB');
    }
  }

  getPasswordDisabledTooltip(): string {
    if (this.passwordReset) {
      return this.translator.instant('DIALOGS.CREATE_SPONSORED_MEMBER.PASSWORD_VIA_EMAIL');
    } else {
      return this.translator.instant('DIALOGS.CREATE_SPONSORED_MEMBER.PASSWORD_DISABLED');
    }
  }
}
