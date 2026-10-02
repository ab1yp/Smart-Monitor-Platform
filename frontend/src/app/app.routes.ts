import { Routes } from "@angular/router";
import { AuthLayout } from "./layouts/auth-layout/auth-layout";
import { CrustLayout } from "./layouts/crust-layout/crust-layout";
import { DeviceLayout } from "./layouts/device-layout/device-layout";
import { MainLayout } from "./layouts/main-layout/main-layout";
import { NotFound } from "./shared/components/not-found/not-found";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  
  {
    path: "cl",
    component: CrustLayout,
    children: [
      {
        path: "",
        redirectTo: "home_en",
        pathMatch: "full",
      },
      {
        path: "home_en",
        loadComponent: () =>
          import("./features/down-page-en/down-page")
            .then(x => x.DownPageEn),
      },
    ],
  },

  {
    path: "al",
    component: AuthLayout,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/auth/routes/auth.routes")
            .then(x => x.AuthRoutes),
      },
    ],
  },

  {
    path: "ml",
    canActivate: [authGuard],
    component: MainLayout,
    children: [
      {
        path: "",
        redirectTo: "main",
        pathMatch: "full",
      },
      {
        path: "main",
        loadComponent: () =>
          import("./features/main/components/main/main")
            .then(x => x.Main),
      },
      {
        path: "user/profile",
        loadComponent: () =>
          import("./features/users/components/user-profile/user-profile")
            .then(x => x.UserProfile),
      },
      {
        path: "user/edit",
        loadComponent: () =>
          import("./features/users/components/edit-user-form/edit-user-form")
            .then(x => x.EditUserForm),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./core/settings/settings")
            .then(x => x.Settings),
      },
      {
        path: "",
        loadChildren: () =>
          import("./features/devices/routes/devices.routes")
            .then(x => x.DevicesRoutes),
      },
    ],
  },

  {
    path: "dl/:deviceId",
    canActivate: [authGuard],
    component: DeviceLayout,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/devices/routes/device.routes")
            .then(x => x.DeviceRoutes),
      },
    ],
  },

  {
    path: "**",
    component: NotFound,
  },

];