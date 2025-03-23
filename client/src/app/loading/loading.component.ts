import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router, Event } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-loading',
  template: `
    <div *ngIf="showLoading$ | async" class="loading-container">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    
    .spinner-container {
      background-color: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    p {
      margin: 0;
      font-family: 'Roboto', sans-serif;
      font-size: 16px;
      color: #333;
    }
  `]
})
export class LoadingComponent implements OnInit {
  // Combined loading state from both auth service and router events
  private showLoadingSource = new BehaviorSubject<boolean>(true);
  showLoading$ = this.showLoadingSource.asObservable();
  
  private isAuthLoading = true;
  
  constructor(
    public accountService: AccountService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Subscribe to both auth loading status and router events
    this.accountService.isLoading$.subscribe(isLoading => {
      this.isAuthLoading = isLoading;
      if (isLoading) {
        this.showLoadingSource.next(true);
      } else {
        // Only hide if router isn't also navigating
        if (!this.router.navigated) {
          this.showLoadingSource.next(false);
        }
      }
    });
    
    // Monitor router events for loading states
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.showLoadingSource.next(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Only hide loading if auth service isn't also loading
        if (!this.isAuthLoading) {
          setTimeout(() => {
            this.showLoadingSource.next(false);
          }, 500); // Add a small delay to ensure full page load
        }
      }
    });
  }
} 