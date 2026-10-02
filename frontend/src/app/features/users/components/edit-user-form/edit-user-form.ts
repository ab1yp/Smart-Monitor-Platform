import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { Loading } from '../../../../shared/components/loading/loading';
import { UsersService } from '../../services/users';
import { User } from '../../../../shared/interfaces/user';

@Component({
  selector: 'app-edit-user-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Loading],
  templateUrl: './edit-user-form.html',
  styleUrl: './edit-user-form.css',
})
export class EditUserForm {
  userForm = new FormGroup({
    email: new FormControl({ value: '', disabled: true }),
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    about: new FormControl('', Validators.maxLength(500))
  });
  isSubmitting = false;
  selectedPlan!: { plan: string; time: string; } | undefined;
  loading: boolean = false;
  userData: any = {}

  constructor(
    private usersService: UsersService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadUser();
  }

  private loadUser() {
    this.loading = true;
    this.usersService.getUser().subscribe({
      next: ({ responseData }: any) => {
        this.loading = false;
        console.log(responseData)
        this.userData = responseData;
        this.userForm.get('email')?.patchValue(this.userData?.email);
        this.userForm.get('name')?.patchValue(this.userData?.name);
        this.userForm.get('about')?.patchValue(this.userData?.about);
        this.cdr.detectChanges();
      }, error: (err) => {
        this.loading = false;
        console.error('Failed to load user dashboard:', err);
        this.router.navigate(['/']);
        this.cdr.detectChanges();
        return;
      }
    });
  }

  goBack() {
    this.selectedPlan = undefined; this.router.navigate([`/ml/user/profile`])
  }
  updateUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); return;
    }
    this.isSubmitting = true;
    const userData = {
      name: this.userForm.value.name?.trim()!,
      about: this.userForm.value.about?.trim(),
    };
    this.usersService.updateUser(userData)
      .pipe(finalize(() => { this.isSubmitting = false; })).subscribe({
        next: () => {
          this.userForm.reset();
          this.cdr.detectChanges()
          this.router.navigate(['ml/user/profile'])
        },
        error: (err) => { console.error(err); }
      });
  }
}
