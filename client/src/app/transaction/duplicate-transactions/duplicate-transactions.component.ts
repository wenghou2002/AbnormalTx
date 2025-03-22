import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionService, Transaction } from '../../transaction.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { AccountService } from '../../_services/account.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-duplicate-transactions',
  templateUrl: './duplicate-transactions.component.html',
  styleUrls: ['./duplicate-transactions.component.css']
})

export class DuplicateTransactionsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  intervalId: any;
  isMonitoring: boolean = false;
  lastUpdated: Date = new Date();
  alertShown: boolean = false;
  private previousTransactionCount: number = 0;
  isGeneratingData: boolean = false;

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initial state setup
  }

  ngOnDestroy(): void {
    // Make sure to clear the interval if the component is destroyed
    this.stoptransaction();
  }

  loadtransaction(): void {
    this.isMonitoring = true;
    this.alertShown = false;
    this.previousTransactionCount = 0; // Reset count when starting monitoring
    
    this.fetchTransactions();

    this.intervalId = setInterval(() => {
      this.fetchTransactions();
    }, environment.refreshInterval);
  }

  fetchTransactions(): void {
    this.transactionService.getDuplicateTransactions().subscribe({
      next: (response: Transaction[]) => {
        this.lastUpdated = new Date();
        
        // Check if we have new transactions
        if (response.length > 0 && response.length > this.previousTransactionCount) {
          // Only show notification when new transactions are detected
          const newTransactionsDetected = response.length > this.previousTransactionCount;
          
          // Update transactions list
          this.transactions = response;
          
          // If we have new transactions, show notification
          if (newTransactionsDetected) {
            this.showNotification(response.length);
          }
        } else {
          // Just update the transactions without alert
          this.transactions = response;
        }
        
        // Store current count for next comparison
        this.previousTransactionCount = response.length;
        
        console.log("Monitoring status:", this.isMonitoring);
        console.log("Transaction count:", response.length);
      },
      error: (error) => {
        console.error("Error fetching abnormal transactions:", error);
        
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Failed to connect to the monitoring service.'
        });
      }
    });
  }

  stoptransaction(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isMonitoring = false;
      console.log("Abnormal Transaction Monitoring System has been stopped.");
    }
  }

  generateDummyData(count: number = 100): void {
    if (this.isGeneratingData) return;
    
    // Use take(1) to take only the current value and then complete
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      // Check if user is logged in
      if (!user) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Required',
          text: 'You need to be logged in to generate data. Redirecting to login page...',
          timer: 3000,
          showConfirmButton: false
        });
        setTimeout(() => this.router.navigateByUrl('/login'), 3000);
        return;
      }
      
      // Continue with data generation if authenticated
      this.isGeneratingData = true;
      
      Swal.fire({
        title: 'Generating Data',
        text: `Generating ${count} transactions...`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      this.transactionService.generateDummyTransactions(count).subscribe({
        next: (response) => {
          this.isGeneratingData = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || `Successfully generated ${count} transactions`
          });
          
          // If monitoring is active, refresh the list
          if (this.isMonitoring) {
            this.fetchTransactions();
          }
        },
        error: (error) => {
          this.isGeneratingData = false;
          console.error("Error generating dummy data:", error);
          
          let errorMessage = 'Failed to generate dummy transaction data.';
          
          if (error.status === 401) {
            errorMessage = 'Authentication error. Please log in again.';
            localStorage.removeItem('user');
            setTimeout(() => this.router.navigateByUrl('/login'), 3000);
          } else if (error.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
        }
      });
    });
  }

  showNotification(count: number) {
    Swal.fire({
      icon: 'warning',
      title: 'Abnormal Transactions Detected!',
      text: `${count} suspicious transaction patterns have been identified.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true
    });
  }
}
