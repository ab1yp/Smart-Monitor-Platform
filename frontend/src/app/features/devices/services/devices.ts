import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerResponse } from '../../../shared/interfaces/server-response';
import { environment } from '../../../core/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DevicesService {

  private readonly devicesApiUrl = environment.api.devices;
  private readonly deviceMembersApiUrl = environment.api.deviceMembers;

  constructor(private http: HttpClient) { }

  createDevice(deviceData: { name: string; description?: string; }): Observable<any> {
    return this.http.post(`${this.devicesApiUrl}createDevice`, deviceData);
  }

  getDevices(): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(`${this.devicesApiUrl}getDevices`);
  }

  getdevicesByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.devicesApiUrl}getDevicesByUserId/${userId}`);
  }


  getDevice(deviceId: string): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(`${this.devicesApiUrl}getDevice/${deviceId}`);
  }

  updateDevice(deviceData: { deviceId: string, name: string; description?: string; }): Observable<any> {
    return this.http.post(`${this.devicesApiUrl}updateDevice`, deviceData);
  }

  deleteDevice(deviceId: string) {
    return this.http.delete(`${this.devicesApiUrl}deleteDevice/${deviceId}`);
  }

  getDeviceMember(deviceId: string): Observable<any> {
    return this.http.get<ServerResponse>(`${this.deviceMembersApiUrl}getDeviceMember/${deviceId}`);
  }
  getDeviceMembers(deviceId: string): Observable<any> {
    return this.http.get<ServerResponse>(`${this.deviceMembersApiUrl}getDeviceMembers/${deviceId}`);
  }

  getSearchedDeviceMembers(data: any) {
    return this.http.post<any>(`${this.deviceMembersApiUrl}getSearchedDeviceMembers`, data);
  }
}
