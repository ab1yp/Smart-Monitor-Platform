import { Component, OnInit } from '@angular/core';
import { SideNav } from '../../shared/components/side-nav/side-nav';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-device-layout',
  imports: [RouterOutlet, SideNav],
  templateUrl: './device-layout.html',
  styleUrl: './device-layout.css',
})
export class DeviceLayout implements OnInit {
  constructor(private activatedRoute: ActivatedRoute) { }
  deviceId: string | null | undefined
  ngOnInit(): void { this.deviceId = this.activatedRoute.snapshot.paramMap.get("deviceId") }
}
