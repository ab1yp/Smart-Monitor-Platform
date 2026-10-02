import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})

export class SignUp {
  constructor(private authService: AuthService, private router: Router) { }

  formData = new FormGroup({
    name: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    about: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    email: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    cPassword: new FormControl('', { validators: [Validators.required], nonNullable: true }),
  });

  submitForm() {
    if (this.formData.value.password === this.formData.value.cPassword) {
      const formData = this.formData.getRawValue();
      const userData = {
        name: formData.name,
        about: formData.about,
        email: formData.email,
        password: formData.password
      };
      this.authService.signUp(userData).subscribe({
        next: () => { this.formData.reset(); this.router.navigate(['al/signin']) },
        error: (err) => { console.error(err) }
      })
    }
  }
}
