import { HttpClient } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AccountService } from './_services/account.service';
import { User } from './_models/user';
import { Transaction, TransactionService } from './transaction.service';
import { filter, take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AbnormalTx Monitor';
  users: any;
  duplicateTransactions: Transaction[] = [];
  currentUser: User | null = null;
  initialNavigation = true;

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router,
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.titleService.setTitle(this.title);
  }

  ngOnInit(): void {
    // Prevent flickering during initial navigation
    if (isPlatformBrowser(this.platformId)) {
      const savedPath = localStorage.getItem('lastPath');
      if (savedPath && savedPath.includes('home')) {
        this.router.navigateByUrl(savedPath);
      }
    }

    // Monitor routes and save last path
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (isPlatformBrowser(this.platformId) && event.url !== '/login') {
        localStorage.setItem('lastPath', event.url);
      }
    });

    // The account service is handling loading and authentication now
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.getUsers();
      }
    });
  }

  getUsers() {
    this.http.get('http://localhost:5000/api/users').subscribe({
      next: response => this.users = response,
      error: error => {
        console.log(error);
        if (error.status === 500) {
          console.warn('Server connection issue detected');
        }
      },
      complete: () => console.log('Request has completed')
    });
  }

  checkDuplicateTransactions() {
    this.transactionService.getDuplicateTransactions().subscribe({
      next: transactions => this.duplicateTransactions = transactions,
      error: error => console.error('Error fetching duplicate transactions:', error),
      complete: () => console.log('Duplicate transactions fetch completed')
    });
  }
}
