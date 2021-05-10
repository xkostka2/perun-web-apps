import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationForm, RegistrarManagerService } from '@perun-web-apps/perun/openapi';

export interface UpdateApplicationFormDialogData {
  entity: string;
  applicationForm: ApplicationForm;
  theme: string;
  autoRegistrationEnabled: boolean;
}

@Component({
  selector: 'app-update-application-form-dialog',
  templateUrl: './update-application-form-dialog.component.html',
  styleUrls: ['./update-application-form-dialog.component.scss']
})
export class UpdateApplicationFormDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<UpdateApplicationFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: UpdateApplicationFormDialogData,
              private registrarManager: RegistrarManagerService) { }

  entity: string;
  applicationForm: ApplicationForm;
  moduleName: string;
  initialState: string;
  extensionState: string;
  embeddedState: string;
  loading = false;
  theme: string;
  autoRegistrationEnabled: boolean;

  ngOnInit() {
    this.theme = this.data.theme;
    this.applicationForm = this.data.applicationForm;
    this.moduleName = this.applicationForm.moduleClassName;
    this.initialState = this.applicationForm.automaticApproval ? 'auto' : 'manual';
    this.extensionState = this.applicationForm.automaticApprovalExtension ? 'auto' : 'manual';
    this.embeddedState = this.applicationForm.automaticApprovalEmbedded ? 'auto' : 'manual';
    this.entity = this.data.entity;
    this.autoRegistrationEnabled = this.data.autoRegistrationEnabled;
  }

  onCancel() {
    this.dialogRef.close();
  }

  submit() {
    this.loading = true;
    this.applicationForm.moduleClassName = this.moduleName;
    this.applicationForm.automaticApproval = this.initialState === 'auto';
    this.applicationForm.automaticApprovalExtension = this.extensionState === 'auto';
    this.applicationForm.automaticApprovalEmbedded = this.embeddedState === 'auto';
    this.registrarManager.updateForm({form: this.applicationForm}).subscribe( updatedForm => {
      this.dialogRef.close(updatedForm);
    }, () => this.loading = false);
  }
}
