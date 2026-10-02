import { Routes } from '@angular/router';
export const DevicesRoutes: Routes = [
    { path: "devices", loadComponent: () => import('../components/devices-list/devices-list').then(x => x.DevicesList) },
    { path: "createDevice", loadComponent: () => import('../components/create-device-form/create-device-form').then(x => x.CreateDeviceForm) },
]
