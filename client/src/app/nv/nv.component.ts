import { Component, OnInit, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { SharedService } from '../_services/shared.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';  // Import Router

@Component({
  selector: 'app-nv',
  templateUrl: './nv.component.html',
  styleUrls: ['./nv.component.css']
})
export class NvComponent implements OnInit{
  model: any = {};
  currentUser$: Observable<User | null> = this.accountService.currentUser$;
  username$: Observable<string | null> = this.sharedService.username$;
  visible:boolean = true;
  changetype:boolean = true;

  @ViewChild('loginForm', { static: false }) loginForm!: NgForm;

  constructor(
    public accountService: AccountService,
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check for stored user credentials
  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: () => {
        this.router.navigate(['/home']);
        console.log("Login successful");
      },
      error: error => {
        console.error("Login failed:", error);
        this.showLoginErrorNotification();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.visible = !this.visible;
    this.changetype = !this.changetype;
  }

  logout() {
    this.accountService.logout();
    this.sharedService.clearUsername();
    this.router.navigate(['/login']);
    console.log("Logout successful");
    
    // Reset the login form
    this.model = {};
  }

  showLoginErrorNotification() {
    // Show error notification (you could add SweetAlert2 here)
    alert("Login failed. Please check your credentials.");
  }

  resetLoginFormWithDelay() {
    setTimeout(() => {
      if (this.loginForm) {
        this.loginForm.resetForm();
      } 
    }, 100); // Delay of 100 milliseconds
  }
}
