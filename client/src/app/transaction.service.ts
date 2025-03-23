// src/app/tt/transaction.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { AccountService } from './_services/account.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiBaseUrl}/transaction`;
  private memoryStorage: { [key: string]: string } = {}; // Fallback for server
  
  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('API URL:', this.apiUrl);
  }

  // Helper method to get auth token from storage
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    // Let the current user$ observable handle authentication
    let user: any = null;
    this.accountService.currentUser$.subscribe(currentUser => {
      user = currentUser;
    }).unsubscribe();
    
    if (user?.token) {
      headers = headers.set('Authorization', `Bearer ${user.token}`);
    }
    
    return headers;
  }

  getDuplicateTransactions(): Observable<Transaction[]> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<Transaction[]>(`${this.apiUrl}/duplicates`, { headers })
      .pipe(
        retry(2), // Retry failed requests up to 2 times
        tap(data => console.log('Transactions data received:', data.length)),
        catchError(this.handleError)
      );
  }

  // Generate dummy transaction data
  generateDummyTransactions(count: number = 100): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('count', count.toString());
    
    return this.http.post<any>(`${this.apiUrl}/generate-dummy`, {}, { headers, params })
      .pipe(
        tap(response => console.log('Generate dummy transactions response:', response)),
        catchError(this.handleError)
      );
  }

  // Error handler
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status}\nMessage: ${error.message}`;
      
      // Add more specific error information
      if (error.status === 0) {
        errorMessage += '\nServer is unreachable. Please check your API server status.';
      } else if (error.status === 401) {
        errorMessage += '\nUnauthorized access. Please log in again.';
      } else if (error.status === 404) {
        errorMessage += '\nAPI endpoint not found. Please check API routes.';
      } else if (error.status === 500) {
        errorMessage += '\nInternal server error. Please check server logs.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Test connection to check if the API is reachable
  testConnection(): Observable<boolean> {
    return this.http.get<any>(`${environment.apiBaseUrl}/test`)
      .pipe(
        tap(() => console.log('API connection successful')),
        catchError(error => {
          console.error('API connection failed:', error);
          return of(false);
        })
      );
  }
}

export interface Transaction {
  msisdn: any;
  message: string;
  broadcastDate: string;
  country: string;
}
