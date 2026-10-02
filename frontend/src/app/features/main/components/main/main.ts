import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DevicesService } from '../../../devices/services/devices';

@Component({
  selector: 'app-main',
  imports: [CommonModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main implements OnInit {

  devices: any = [];
  loading = true;

  constructor(
    private devicesService: DevicesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { this.loadDashboard(); }


  private loadDashboard() {
    this.loading = true;
    this.devicesService.getDevices().subscribe({
      next: (res) => {
        this.devices = res.responseData;
        this.loading = false;
        console.log(this.devices)
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error('Failed to load dashboard:', err);
        this.loading = false;
      }
    });
  }
}
