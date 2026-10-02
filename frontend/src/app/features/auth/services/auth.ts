import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../core/environments/environment';

@Injectable({ providedIn: 'root', })

export class AuthService {

  authApiiUrl = environment.api.auth
  refreshApiiUrl = environment.api.refresh

  constructor(private http: HttpClient) { }

  signUp(userData: Object) { return this.http.post(`${this.authApiiUrl}signup`, userData) }
  signIn(userData: Object) {
    return this.http.post<{ token: string }>(`${this.authApiiUrl}signin`, userData, { withCredentials: true });
  }
  forgotPassword(email: string) { return this.http.post(`${this.authApiiUrl}forgot_password`, { email }); }

  updatePass(data: { token: string; password: string }) {
    return this.http.put(`${this.authApiiUrl}update_password`, data);
  }

  logout() { return this.http.get(`${this.authApiiUrl}logout`); }


  // Token

  private accessToken: string | null = null

  setToken(token: string) { this.accessToken = token }

  getToken(): string | null { return this.accessToken }

  clearToken() { this.accessToken = null }

  refresh() {
    return this.http.post<{ accessToken: string }>
      (this.refreshApiiUrl, {}, { withCredentials: true, });
  }
}
