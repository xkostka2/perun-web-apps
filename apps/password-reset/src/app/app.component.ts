import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PasswordResetDialogComponent } from './dialogs/password-reset-dialog/password-reset-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  title = 'password-reset';

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    const config = getDefaultDialogConfig();
    config.width = '450px';

    const queryParams = location.search.substr(1);
    let mode = ''
    if (queryParams.includes('activation')) {
      mode = 'activation'
    } else if(queryParams.includes('token')) {
      mode = 'reset'
    } else {
      mode = 'change'
    }

    config.data = {mode: mode}

    this.dialog.open(PasswordResetDialogComponent, config);
  }
}
