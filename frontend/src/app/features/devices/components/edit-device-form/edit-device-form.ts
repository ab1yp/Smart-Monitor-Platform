import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { Loading } from '../../../../shared/components/loading/loading';
import { DevicesService } from '../../services/devices';
import { Device } from '../../../../shared/interfaces/device';

@Component({
  selector: 'app-edit-device-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Loading],
  templateUrl: './edit-device-form.html',
  styleUrl: './edit-device-form.css',
})
export class EditDeviceForm {
  deviceForm = new FormGroup({
    id: new FormControl('', [Validators.maxLength(100)]),
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl('', Validators.maxLength(500))
  });
  isSubmitting = false;
  deviceId: string = ''
  selectedPlan!: { plan: string; time: string; } | undefined;
  loading: boolean = false;
  deviceData: any

  constructor(
    private devicesService: DevicesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.deviceId = this.activatedRoute.parent?.snapshot.paramMap.get("deviceId") ?? ''
    if (!this.deviceId) {
      console.error('Device ID is missing');
      this.router.navigate(['/']); return;
    } this.loadDevice();
  }

  private loadDevice() {
    this.devicesService.getDevice(this.deviceId).subscribe({
      next: ({ responseData }: any) => {
        this.deviceData = responseData.device;
        if (!['owner', 'admin'].includes(this.deviceData.currentUserMember.role)) {
          this.loading = false;
          this.deviceForm.reset();
          this.cdr.detectChanges();
          this.router.navigate([`dl/${this.deviceData.device._id}/settings`]); return;
        }
        this.deviceForm.get('id')?.patchValue(this.deviceData._id);
        this.deviceForm.get('name')?.patchValue(this.deviceData.name);
        this.deviceForm.get('description')?.patchValue(this.deviceData.description);
        this.loading = false;
        this.cdr.detectChanges();
      }, error: (err) => {
        console.error('Failed to load device dashboard:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.selectedPlan = undefined; this.router.navigate([`/dl/${this.deviceId}/settings`])
  }
  updateDevice() {
    if (this.deviceForm.invalid || !this.deviceId) {
      this.deviceForm.markAllAsTouched(); return;
    }
    this.isSubmitting = true;
    const deviceData = {
      deviceId: this.deviceId,
      name: this.deviceForm.value.name?.trim()!,
      description: this.deviceForm.value.description?.trim(),
    };
    this.devicesService.updateDevice(deviceData)
      .pipe(finalize(() => { this.isSubmitting = false; })).subscribe({
        next: () => {
          this.deviceForm.reset();
          this.router.navigate([`devices`])
        },
        error: (err) => { console.error(err); }
      });
  }
}
