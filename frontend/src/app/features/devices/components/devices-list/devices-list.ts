import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../../users/services/users';
import { DevicesService } from '../../services/devices';
import { Device } from '../../../../shared/interfaces/device';

@Component({
  selector: 'app-devices-list',
  imports: [DatePipe, RouterLink, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './devices-list.html',
  styleUrl: './devices-list.css',
})
export class DevicesList {

  devices: any[] = []
  devicesLength: Number = 0
  deviceForm: boolean = false
  filteredDevices: any[] = [];
  searchValue!: string;
  openForm: boolean = false

  constructor(
    private devicesService: DevicesService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService
  ) { }

  trackByUserId(index: number, device: Device): string { return device._id; }

  ngOnInit() { this.loadDevices(); }

  getUserById(userId: string) {
    return this.usersService.getUserById(userId);
  }

  loadDevices() {
    this.devicesService.getDevices().subscribe({
      next: ({ responseData }: any) => {
        this.devices = responseData.devices;
        this.filteredDevices = this.devices;
        this.devicesLength = this.filteredDevices.length
        this.cdr.detectChanges()
      },
      error: (err) => { console.error(err) }
    })
  }

  search() {
    const value = this.searchValue.trim().toLowerCase();
    if (!value) { this.filteredDevices = this.devices; return; }
    this.filteredDevices = this.devices.filter((device: { name: string; }) =>
      device.name.toLowerCase().includes(value)
    );
    this.devicesLength = this.filteredDevices.length
  }
}