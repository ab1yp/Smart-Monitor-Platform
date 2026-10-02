import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  constructor(private authServices: AuthService, private router: Router) { }

  ChangePasswordForm = false;
  mailSent = false;
  isLoading: boolean = false

  SendChangePassformData = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true
    }),
  });

  SendChangePassform(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    const email = this.SendChangePassformData.getRawValue().email;
    this.authServices.forgotPassword(email).subscribe({
      next: () => { this.isLoading = false; this.mailSent = true; },
      error: (err) => { this.isLoading = false; console.error(err); }
    });
  }

  backToSignIn(): void {
    this.ChangePasswordForm = false;
    this.mailSent = false;
    this.SendChangePassformData.reset({ email: '' });
  }
  
  formData = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
      nonNullable: true
    })
  });

  submitForm(): void {
    if (this.formData.invalid) { this.formData.markAllAsTouched(); return; }
    const { email, password } = this.formData.getRawValue();
    this.authServices.signIn({ email, password }).subscribe({
      next: (res) => {
        this.authServices.setToken(res.token);
        this.formData.reset({ email: '', password: '' });
        this.router.navigate(['/ml/main']);
      },
      error: (err) => { console.error(err); }
    });
  }
}