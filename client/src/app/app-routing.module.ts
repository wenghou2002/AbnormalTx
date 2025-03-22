import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NvComponent } from './nv/nv.component';
import { DuplicateTransactionsComponent } from './transaction/duplicate-transactions/duplicate-transactions.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: NvComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'abnormal', component: DuplicateTransactionsComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
