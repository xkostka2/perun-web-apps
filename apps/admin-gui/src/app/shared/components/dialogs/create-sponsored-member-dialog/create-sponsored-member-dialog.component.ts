import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AuthzResolverService,
  InputCreateSponsoredMember,
  MembersManagerService,
  NamespaceRules,
  RichMember,
  RichUser,
  User,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService,GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import {
  AsyncValidatorFn,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '@perun-web-apps/perun/models';
import { of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';

export interface CreateSponsoredMemberDialogData {
  entityId?: number;
  voId?: number;
  sponsors?: RichUser[];
  theme: string;
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

  userControl: FormGroup = null;
  namespaceControl: FormGroup = null;
  passwordStateMatcher = new ImmediateStateMatcher();

  voSponsors: RichUser[] = [];

  selectedSponsor: User = null;
  sponsorType: string = null;
  isSponsor = false;
  isPerunAdmin = false;

  expiration = 'never';

  constructor(private dialogRef: MatDialogRef<CreateSponsoredMemberDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: CreateSponsoredMemberDialogData,
              private membersService: MembersManagerService,
              private apiRequestConfiguration: ApiRequestConfigurationService,
              private usersService: UsersManagerService,
              private store: StoreService,
              private translator: TranslateService,
              private authzService: AuthzResolverService,
              private guiAuthResolver: GuiAuthResolver,
              private formBuilder: FormBuilder)  {  }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.voSponsors = this.data.sponsors;
    this.isSponsor = this.guiAuthResolver.principalHasRole(Role.SPONSOR, 'Vo', this.data.voId);
    this.isPerunAdmin = this.guiAuthResolver.isPerunAdmin();

    this.userControl = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      titleBefore: [''],
      titleAfter: ['']
    });

    this.namespaceControl = this.formBuilder.group({
      namespace: ['', Validators.required],
      login: ['', [Validators.required]],
      password: ['', Validators.required, [loginAsyncValidator(null, this.usersService, this.apiRequestConfiguration)]],
      passwordReset: [false, []],
      showPassword: [false, []],
      email: ['', [Validators.required, Validators.pattern(this.emailRegx)]]
    });

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
        firstName: this.userControl.get('firstName').value,
        lastName: this.userControl.get('lastName').value,
        titleAfter: this.userControl.get('titleAfter').value,
        titleBefore: this.userControl.get('titleBefore').value,
        email: this.namespaceControl.get('email').value
      },
      sponsor: this.sponsorType === 'other' ? this.selectedSponsor.id : this.store.getPerunPrincipal().userId,
    }

    const namespace = this.namespaceControl.get('namespace').value;
    const rules = this.parsedRules.get(namespace);
    if (namespace !== 'No namespace') {
      sponsoredMember.userData.namespace = namespace;
    }

    if (rules.login !== 'disabled') {
      sponsoredMember.userData.login = this.namespaceControl.get('login').value;
    }

    if (rules.password !== 'disabled') {
      sponsoredMember.sendActivationLink = this.namespaceControl.get('passwordReset').value;
      sponsoredMember.userData.password = this.namespaceControl.get('password').value;
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
          .filter(attr => attr.friendlyNameParameter === namespace)
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

  enableFormControl(control: AbstractControl, validators: ValidatorFn[], asyncValidators: AsyncValidatorFn[] = []) {
    control.enable();
    control.clearValidators();
    control.clearAsyncValidators();
    control.setValidators(validators);
    control.setAsyncValidators(asyncValidators);
    control.updateValueAndValidity();
  }

  onNamespaceChanged(namespc: string) {
    const rules = this.parsedRules.get(namespc);
    const login = this.namespaceControl.get('login');
    const password = this.namespaceControl.get('password');
    const passwordReset = this.namespaceControl.get('passwordReset');
    const showPassword = this.namespaceControl.get('showPassword');

    if (rules.login !== 'disabled') {
      const validators = rules.login === 'optional' ? [] : [Validators.required];
      this.enableFormControl(login, validators);
    } else {
      login.disable();
      login.setValue('');
    }
    if (rules.password !== 'disabled') {
      const validators = rules.password === 'optional' ? [] : [Validators.required];
      this.enableFormControl(password, validators, [loginAsyncValidator(namespc, this.usersService, this.apiRequestConfiguration)]);
      this.enableFormControl(passwordReset, []);
      this.enableFormControl(showPassword, []);
    } else {
      password.disable();
      password.setValue('');
      passwordReset.disable();
      passwordReset.setValue(false);
      showPassword.disable();
      showPassword.setValue(false);
    }
  }

  passwordResetChange() {
    const password = this.namespaceControl.get('password');
    if (this.namespaceControl.get('passwordReset').value){
      password.disable();
      password.setValue('');
    } else {
      password.enable();
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
    if (this.namespaceControl.get('passwordReset').value) {
      return this.translator.instant('DIALOGS.CREATE_SPONSORED_MEMBER.PASSWORD_VIA_EMAIL');
    } else {
      return this.translator.instant('DIALOGS.CREATE_SPONSORED_MEMBER.PASSWORD_DISABLED');
    }
  }
}
