import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NvComponent } from './nv/nv.component';
import { FormsModule } from '@angular/forms';
import { BsDropdownModule } from'ngx-bootstrap/dropdown';
import { HomeComponent } from './home/home.component';
import { DuplicateTransactionsComponent } from './transaction/duplicate-transactions/duplicate-transactions.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    NvComponent,
    HomeComponent,
    DuplicateTransactionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    SweetAlert2Module.forRoot(),
    RouterModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
