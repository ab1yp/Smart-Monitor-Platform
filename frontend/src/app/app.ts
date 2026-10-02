import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterOutlet } from '@angular/router';
import { Loading } from './shared/components/loading/loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  loading = false;
  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    this.router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) { this.loading = true; this.cdr.detectChanges() }
      if (event instanceof RouteConfigLoadEnd) { this.loading = false; this.cdr.detectChanges() }
    });
  }
}