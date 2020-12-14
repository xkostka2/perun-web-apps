import { Injectable} from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { StoreService } from '@perun-web-apps/perun/services';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MfaService {

  constructor(private http: HttpClient,
              private storeService: StoreService) {
  }

  getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Access-Control-Allow-Origin');
    return headers;
  }

  enableMfa(value: boolean, idToken: string, accessToken: string): Observable<any> {
    const apiUrl = this.storeService.get('mfa','api_url');
    const path = `mfaEnabled`;
    const url = `${apiUrl}${path}`;
    const body = `value=${value}&id_token=${idToken}`;
    const headers = new HttpHeaders();
    headers.set('Authorization', `Bearer ${accessToken}`)
    return this.http.put(url, body, { headers: headers })
      .pipe(catchError(err => this.formatErrors(err)));
  }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  // revokeToken(tokenId: number): Observable<any>{
  //   const apiUrl = this.storeService.get('mfa_api_url');
  //   const path = `token/${tokenId}/revoke}`;
  //   const url = `${apiUrl}${path}`;
  //   const payload = JSON.stringify(new HttpParams());
  //   return this.http.put(url, payload, { headers: this.getHeaders() })
  //     .pipe(catchError(err => this.formatErrors(err)));
  // }
  //
  // renameToken(tokenId: number, name: string): Observable<any>{
  //   const apiUrl = this.storeService.get('mfa_api_url');
  //   const path = `token/${tokenId}/rename?name=${name}`;
  //   const url = `${apiUrl}${path}`;
  //   const payload = JSON.stringify(new HttpParams());
  //   return this.http.put(url, payload, { headers: this.getHeaders() })
  //     .pipe(catchError(err => this.formatErrors(err)));
  // }
}
