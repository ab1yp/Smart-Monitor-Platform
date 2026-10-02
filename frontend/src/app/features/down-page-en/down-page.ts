import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme';

@Component({
  selector: 'app-down-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './down-page.html',
  styleUrl: './down-page.css'
})
export class DownPageEn {
  constructor(private themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  protected readonly capabilities = [
    {
      number: '01',
      title: 'Device management',
      description:
        'Create and manage Split AC devices with identity, ownership, location, model, serial number, and installation details.'
    },
    {
      number: '02',
      title: 'Operational telemetry',
      description:
        'Store structured measurements for room temperature, setpoint, compressor behavior, electrical load, internal temperatures, and errors.'
    },
    {
      number: '03',
      title: 'Access control',
      description:
        'Control device access with owner, admin, and member roles backed by server-side authorization.'
    },
    {
      number: '04',
      title: 'Current status snapshots',
      description:
        'Expose the latest device state through a dedicated status document so fleet views can load quickly and consistently.'
    }
  ];

  protected readonly measurements = [
    'Room temperature',
    'Setpoint',
    'Compressor state',
    'Compressor frequency',
    'Power',
    'Current',
    'Evaporator temperature',
    'Condenser temperature',
    'Discharge temperature',
    'Error codes'
  ];

  protected readonly architecture = [
    {
      title: 'Angular client',
      description:
        'Feature-based Angular application with protected routes, reusable services, typed interfaces, and responsive layouts.'
    },
    {
      title: 'Express API',
      description:
        'REST endpoints for authentication, devices, users, and device membership with middleware-based authorization.'
    },
    {
      title: 'MongoDB',
      description:
        'Document storage for users, devices, memberships, status snapshots, and timestamped telemetry collections.'
    }
  ];

  protected readonly roadmap = [
    'Historical charts and analytics',
    'Anomaly and alert workflows',
    'Maintenance-oriented analysis',
    'ESP32 and physical sensor integration',
    'Predictive maintenance models',
    'AI-assisted device summaries'
  ];
}
