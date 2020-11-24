import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  InputCreateSponsoredMember,
  MembersManagerService, RichMember
} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { FormControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';

export interface CreateSponsoredMemberDialogData {
  entityId?: number
  voId?: number;
  theme: string,
}

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

  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

  firstName = new FormControl('', [Validators.required]);

  lastName = new FormControl('', [Validators.required]);

  titleBefore = '';

  titleAfter = '';

  passwordReset = false;
  password = new FormControl('', [Validators.required]);

  namespace = new FormControl('', [Validators.required]);

  login = new FormControl('', [Validators.required]);

  email = new FormControl('', [Validators.required, Validators.pattern(this.emailRegx)]);

  expiration = 'never';

  constructor(private dialogRef: MatDialogRef<CreateSponsoredMemberDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: CreateSponsoredMemberDialogData,
              private membersService: MembersManagerService,
              private store: StoreService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.parseNamespace();
    if (this.namespaceOptions.length === 0) {
      this.functionalityNotSupported = true;
    }
    this.loading = false;
  }

  parseNamespace(){
    //TODO get login_namespace_attributes when creating for other namespaces will be available, then delete
    //TODO sponsor_namespace_attributes from configuration
    const namespaces = this.store.get("sponsor_namespace_attributes");
    for (const namespace of namespaces) {
      const index = namespace.lastIndexOf(':');
      if (index !== -1) {
        this.namespaceOptions.push(namespace.substring(index + 1, namespace.length));
      }
    }
  }

  onConfirm() {
    this.loading = true;

    const sponsoredMember: InputCreateSponsoredMember = {
      vo: this.data.voId,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      titleAfter: this.titleAfter,
      titleBefore: this.titleBefore,
      namespace: this.namespace.value,
      password: this.passwordReset ? '' : this.password.value,
      sponsor: this.store.getPerunPrincipal().userId,
      email: this.email.value,
      sendActivationLink: this.passwordReset
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
          .filter(attr => attr.friendlyNameParameter === 'mu')
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

  changeNamespace(namespc: string) {
    if (namespc === 'mu') {
      this.login.disable();
    } else {
      this.login.enable();
    }
  }

  passwordResetChange() {
    if (this.passwordReset){
      this.password.disable();
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

}
