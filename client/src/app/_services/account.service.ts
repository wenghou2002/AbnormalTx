import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map, tap, of, finalize } from 'rxjs';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = 'http://localhost:5000/api/';
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();
  private memoryStorage: { [key: string]: string } = {}; // Fallback for server
  
  // Add loading state to track authentication status check
  private isLoadingSource = new BehaviorSubject<boolean>(true);
  isLoading$ = this.isLoadingSource.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCurrentUser();
    } else {
      // Not in browser, set loading to false
      this.isLoadingSource.next(false);
    }
  }

  login(model: any): Observable<void>{
    this.isLoadingSource.next(true);
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setStorageItem('user', JSON.stringify(user));
          this.currentUserSource.next(user);
          this.router.navigateByUrl('/home');
        }
      }),
      finalize(() => this.isLoadingSource.next(false))
    )
  }

  setCurremtUser(user: User){
    this.currentUserSource.next(user);
  }

  logout(){
    this.removeStorageItem('user');
    this.currentUserSource.next(null);
    this.router.navigateByUrl('/login');
  }

  private loadCurrentUser(): void {
    this.isLoadingSource.next(true);
    const userJson = this.getStorageItem('user');
    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUserSource.next(user);
      } catch (e) {
        console.error('Error parsing user data', e);
        this.removeStorageItem('user');
      }
    }
    // Authentication check is complete
    this.isLoadingSource.next(false);
  }

  // Storage methods that work in both browser and server environments
  private setStorageItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('localStorage not available, using memory storage instead');
        this.memoryStorage[key] = value;
      }
    } else {
      this.memoryStorage[key] = value;
    }
  }

  private getStorageItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage not available, using memory storage instead');
        return this.memoryStorage[key] || null;
      }
    }
    return this.memoryStorage[key] || null;
  }

  private removeStorageItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage not available, using memory storage instead');
        delete this.memoryStorage[key];
      }
    } else {
      delete this.memoryStorage[key];
    }
  }
}
