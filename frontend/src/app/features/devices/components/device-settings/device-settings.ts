import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Loading } from '../../../../shared/components/loading/loading';
import { DevicesService } from '../../services/devices';
import { Device } from '../../../../shared/interfaces/device';

@Component({
  selector: 'app-device-settings',
  imports: [Loading],
  templateUrl: './device-settings.html',
  styleUrl: './device-settings.css',
})

export class DeviceSettings implements OnInit {

  deviceId: string | undefined;
  loading = false;
  deviceData: any
  message = { title: '', description: '', do: () => { } };
  confirmWindow = false;

  constructor(
    private router: Router,
    private devicesService: DevicesService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading = true
    this.deviceId = this.activatedRoute.parent?.snapshot.paramMap.get("deviceId") ?? ''
    if (!this.deviceId) {
      console.error('Device ID is missing');
      this.router.navigate(['/']); return;
    } if (this.deviceId) this.loadDevice();
  }

  private loadDevice() {
    this.devicesService.getDevice(this.deviceId ?? '').subscribe({
      next: ({ responseData }: any) => {
        this.deviceData = responseData
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load device:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  deleteDevice() {
    this.loading = true;
    this.devicesService.deleteDevice(this.deviceId ?? '').subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([`ml/devices`])
      }, error: (err) => {
        console.error('Failed to delete device:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  navigateTo(name: string) { this.router.navigate([`dl/${this.deviceId}/${name}`]) }

  confirm(type: string) {
    this.confirmWindow = true;
    switch (type) {
      case 'delete':
        this.message = {
          title: 'Are you sure you want to delete this device?',
          description:
            `Deleting this device will permanently remove all associated data,
             including members, teams, groups, tasks, and files.`,
          do: () => this.deleteDevice()
        };
    }
  }
}
