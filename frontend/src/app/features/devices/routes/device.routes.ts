import { Routes } from '@angular/router';
export const DeviceRoutes: Routes = [
    { path: "", redirectTo: "dashboard", pathMatch: "full", },
    { path: "dashboard", loadComponent: () => import('../components/device-dashboard/device-dashboard').then(x => x.DeviceDashboard) },
    { path: "editDevice", loadComponent: () => import('../components/edit-device-form/edit-device-form').then(x => x.EditDeviceForm) },
    { path: "settings", loadComponent: () => import('../components/device-settings/device-settings').then(x => x.DeviceSettings) },
];
