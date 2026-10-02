import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-update-pass',
  imports: [ReactiveFormsModule],
  templateUrl: './update-pass.html',
  styleUrl: './update-pass.css',
})

export class UpdatePass implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  passwordUpdated = false;
  isLoading = false;
  token = '';

  formData = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) { alert(this.token); this.router.navigate(['/al/signin']);  }
  }

  submitForm(): void {
    if (this.isLoading) return;
    const { password, confirmPassword } = this.formData.getRawValue();
    if (password !== confirmPassword) { alert('Passwords do not match.'); return; }
    this.isLoading = true;
    this.authService.updatePass({ token: this.token, password: password! }).subscribe({
      next: () => {
        this.isLoading = false;
        this.passwordUpdated = true;
        this.formData.reset();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}