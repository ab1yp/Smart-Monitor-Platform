import { Component } from "@angular/core";
import { SideNav } from "../../shared/components/side-nav/side-nav";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-main-layout',
  imports: [SideNav, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
