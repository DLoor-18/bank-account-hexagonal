import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuthResponse } from '../../domain/model/auth-response.model';
import { IAuthRequest } from '../../domain/model/auth-request.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthUserService {
  private http = inject(HttpClient);
  private urlBase = 'http://localhost:8080/api';

  authUser(auth: IAuthRequest):Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.urlBase}/auth/login`, auth);
  }

}