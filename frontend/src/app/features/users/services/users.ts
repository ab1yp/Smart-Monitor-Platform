import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse } from '../../../shared/interfaces/server-response';
import { environment } from '../../../core/environments/environment';

@Injectable({ providedIn: 'root', })
export class UsersService {

  private readonly userApiUrl = environment.api.users

  constructor(private http: HttpClient) { }

  getUserById(userId: string): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(`${this.userApiUrl}getUserById/${userId}`);
  }
  getUsersByGroupId(groupId: string): Observable<any> {
    return this.http.get<any[] | ServerResponse>(`${this.userApiUrl}getUsersByGroupId/${groupId}`);
  }

  getUser(): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(`${this.userApiUrl}getUser`);
  }

  getUsers(data: {searchValue: string}): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(`${this.userApiUrl}getUsers`, data);
  }

  updateUser(userData: { name: string; about?: string; }): Observable<any> {
    return this.http.put(`${this.userApiUrl}updateUser`, userData);
  }
  deleteUser(): Observable<ServerResponse> {
    return this.http.delete<ServerResponse>(`${this.userApiUrl}deleteUser`);
  }

}

