import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { OverviewComponent } from './overview/overview.component';
import { CallbackComponent } from './auth/callback.component';

const routes: Routes = [
  {
    path: 'overview',
    component: OverviewComponent,
    canActivate: [
      (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        inject(AuthGuard).canActivate(),
    ],
  },
  {
    path: 'callback',
    component: CallbackComponent,
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
