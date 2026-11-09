import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AllCertificateComponent } from './pages/all-certificate/all-certificate.component';

const routes: Routes = [

  { path: '', redirectTo: '/certificates', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  {path: 'certificates', component: AllCertificateComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
