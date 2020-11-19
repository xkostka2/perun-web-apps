import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionExpirationDialogComponent } from './session-expiration-dialog/session-expiration-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, TranslateModule, MatDialogModule, MatButtonModule],
  declarations: [SessionExpirationDialogComponent],
  exports: [SessionExpirationDialogComponent]
})
export class PerunSessionExpirationModule {}
