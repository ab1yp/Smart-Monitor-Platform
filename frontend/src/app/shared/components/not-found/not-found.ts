import { Component } from '@angular/core';
import { Location as NgLocation } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  constructor(private location: NgLocation) { }
  goBack(): void { this.location.back(); }
}