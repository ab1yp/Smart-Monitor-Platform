import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InviteUsers } from '../invite-users/invite-users';
import { Loading } from '../../../../shared/components/loading/loading';
import { DevicesService } from '../../services/devices';
import { Device } from '../../../../shared/interfaces/device';

@Component({
  selector: 'app-device-dashboard',
  standalone: true,
  imports: [CommonModule, Loading, InviteUsers],
  templateUrl: './device-dashboard.html',
  styleUrl: './device-dashboard.css',
})

export class DeviceDashboard implements OnInit, OnDestroy {

  deviceId: string | null = null;
  loading = true;
  usersWindow = false;
  deviceData: any;
  output = '';
  
  private readonly destroy$ = new Subject<void>();

  constructor(
    readonly router: Router,
    private readonly devicesService: DevicesService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.deviceId =
      this.activatedRoute.parent?.snapshot.paramMap.get('deviceId') ?? null;
    if (!this.deviceId) {
      console.error('Device ID is missing');
      this.router.navigate(['/ml/main']);
      return;
    } this.loadDashboard();
  }


  loadDashboard(): void {
    if (!this.deviceId) {
      return;
    }
    this.loading = true;
    this.devicesService.getDevice(this.deviceId).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ responseData }: any) => {
        console.log('Device response:', responseData);
        if (!responseData) {
          console.error('Invalid device response:', responseData);
          this.deviceData = null;
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.deviceData = responseData;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load device dashboard:', err);
        this.deviceData = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openInviteUsers(): void { this.usersWindow = true; }

  closeInviteUsers(): void { this.usersWindow = false; }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) { return '—'; }
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) { return '—'; }
    return new Intl.DateTimeFormat(
      'en-US', { month: 'short', day: 'numeric', year: 'numeric' }
    ).format(parsedDate);
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

}