import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from './_services/account.service';
import { User } from './_models/user';
import { Transaction, TransactionService } from './transaction.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SpamApp';
  users: any;
  duplicateTransactions: Transaction[] = [];  // Add a property to store duplicate transactions
  currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private transactionService: TransactionService,  // Inject TransactionService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setCurrentUser();
    // Check if user is logged in from the observable
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
        // If server error, don't log out user, just show a warning
        if (error.status === 500) {
          console.warn('Server connection issue detected');
        }
      },
      complete: () => console.log('Request has completed')
    });
  }

  setCurrentUser() {
    if (typeof localStorage !== 'undefined') {
      const userString = localStorage.getItem('user');
      if (!userString) {
        this.router.navigateByUrl('/login');
        return;
      }
      const user: User = JSON.parse(userString);
      this.accountService.setCurremtUser(user);
    } else {
      console.warn('localStorage is not available.');
      this.router.navigateByUrl('/login');
    }
  }

  checkDuplicateTransactions() {
    this.transactionService.getDuplicateTransactions().subscribe({
      next: transactions => this.duplicateTransactions = transactions,
      error: error => console.error('Error fetching duplicate transactions:', error),
      complete: () => console.log('Duplicate transactions fetch completed')
    });
  }
  
}
