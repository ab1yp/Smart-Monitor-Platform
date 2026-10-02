import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../auth/services/auth';
import { DevicesService } from '../../services/devices';

@Component({
  selector: 'app-create-device-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-device-form.html',
  styleUrl: './create-device-form.css',
})

export class CreateDeviceForm {
  deviceForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl('', Validators.maxLength(500))
  });

  isSubmitting = false;
  deviceId: any

  constructor(private devicesService: DevicesService, private router: Router,) { }

  goBack() { this.router.navigate([`ml/devices`]) }
  
  createDevice(): void {
    if (this.deviceForm.invalid) { this.deviceForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    const deviceData = {
      name: this.deviceForm.value.name?.trim()!,
      description: this.deviceForm.value.description?.trim() || '',
    };
    this.devicesService.createDevice(deviceData).pipe(finalize(() => { this.isSubmitting = false; }))
      .subscribe({
        next: () => { this.deviceForm.reset(); this.router.navigate([`ml/devices`]) },
        error: (err) => { console.error(err); }
      });
  }
}
