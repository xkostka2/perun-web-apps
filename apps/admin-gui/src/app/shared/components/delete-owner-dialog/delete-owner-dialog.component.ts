import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Owner, OwnersManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-delete-owner-dialog',
  templateUrl: './delete-owner-dialog.component.html',
  styleUrls: ['./delete-owner-dialog.component.scss']
})
export class DeleteOwnerDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteOwnerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Owner[],
              private notificator: NotificatorService,
              private translate: TranslateService,
              private ownersManagerService: OwnersManagerService) { }

  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Owner>;
  owners: Owner[] = [];

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Owner>(this.data);
    this.owners = this.data;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    if(this.owners.length){
      this.ownersManagerService.deleteOwner(this.owners.pop().id).subscribe(()=>{
        this.onSubmit();
      }, ()=> this.loading = false);
    }else {
      this.translate.get('DIALOGS.DELETE_OWNER.SUCCESS').subscribe(successMessage => {
        this.loading = false;
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
    }

  }

}
