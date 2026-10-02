import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from 'ng2-charts';
import { AuthService } from '../../../auth/services/auth';
import { DevicesService } from '../../../devices/services/devices';
import { UsersService } from '../../services/users';
import { User } from '../../../../shared/interfaces/user';
import { Device } from '../../../../shared/interfaces/device';
import { Loading } from '../../../../shared/components/loading/loading';
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, DatePipe, ReactiveFormsModule, Loading, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  userData: User | undefined;
  memberProgress: number = 0;
  devices: Device[] = [];
  deleteConfirmation: boolean = false;
  loading: boolean = false;
  constructor(
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    private devicesService: DevicesService,
    private cdr: ChangeDetectorRef,
    public theme: ThemeService,
  ) { }
  ngOnInit() {
    this.loadUserData();
    this.loadDevices();
  }
  loadUserData() {
    this.usersService.getUser().subscribe({
      next: ({ responseData }: any) => {
        this.userData = responseData;
        this.cdr.detectChanges();
      },
    });
  }
  loadDevices() {
    this.devicesService.getDevices().subscribe({
      next: ({ responeData }: any) => {
        this.devices = responeData;
        this.cdr.detectChanges();
      },
    });
  }
  deleteUser() {
    if (this.loading) return;
    this.loading = true;
    this.usersService.deleteUser().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/cl']);
          this.cdr.detectChanges();
        } else {
          console.warn('Delete user failed:', res.message);
          console.warn('Delete user failed:', res.error);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Delete user error:', err);
      },
    });
  }
  
  ChangePassword = false;
  mailSent = false;

  SendChangePass(): void {
    if (this.loading) return;
    this.loading = true;
    const email = this.userData?.email
    if (!email) {return}
    this.authService.forgotPassword(email).subscribe({
      next: () => { this.loading = false; this.mailSent = true; this.ChangePassword = true; this.cdr.detectChanges(); },
      error: (err) => { this.loading = false; console.error(err); this.ChangePassword = false; this.cdr.detectChanges();}
    });
  }

  back(): void {
    this.ChangePassword = false;
    this.mailSent = false;
    this.cdr.detectChanges()
  }
}
