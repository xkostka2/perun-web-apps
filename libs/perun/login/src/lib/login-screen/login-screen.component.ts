import { Component, OnInit } from '@angular/core';
import { AuthService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent {

  constructor(
    private auth: AuthService
  ) { }

  startAuth(): void {
    this.auth.startAuthentication();
  }
}
