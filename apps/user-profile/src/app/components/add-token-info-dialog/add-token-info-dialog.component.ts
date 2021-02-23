import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-add-token-info-dialog',
  templateUrl: './add-token-info-dialog.component.html',
  styleUrls: ['./add-token-info-dialog.component.scss']
})
export class AddTokenInfoDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AddTokenInfoDialogComponent>) { }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close()
  }

  onAdd() {
    window.open('https://id.muni.cz/simplesaml/module.php/muni/register-totp.php', '_blank');
    this.dialogRef.close()
  }
}
