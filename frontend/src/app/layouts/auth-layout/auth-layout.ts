import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { AuthService } from '../../features/auth/services/auth';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout implements OnInit {
  constructor(private authService: AuthService, private route: Router) { }
  ngOnInit() {
    if (!this.authService.getToken()) {
      this.authService.refresh().subscribe({
        next: ({ accessToken }) => {
          this.authService.setToken(accessToken);
          this.route.navigate(['ml/main'])
        }
      });
    }
  }
}
