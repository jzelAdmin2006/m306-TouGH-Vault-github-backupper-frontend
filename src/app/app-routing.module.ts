import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { OverviewComponent } from './overview/overview.component';
import { CallbackComponent } from './auth/callback.component';

const routes: Routes = [
  {
    path: 'overview',
    component: OverviewComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
  },
  {
    path: 'callback',
    component: CallbackComponent,
  },
  { path: 'overview/:filter', component: OverviewComponent },
  {
    path: '**',
    redirectTo: 'overview',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
