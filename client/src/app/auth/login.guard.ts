import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { Observable, skipWhile, map, take, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private accountService: AccountService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Wait until loading is complete before making routing decisions
    return this.accountService.isLoading$.pipe(
      skipWhile(isLoading => isLoading), // Skip while still loading
      take(1), // Take only the first emission after loading is complete
      switchMap(() => this.accountService.currentUser$.pipe(
        take(1),
        map(user => {
          if (!user) {
            return true;
          } else {
            this.router.navigate(['/home']);
            return false;
          }
        })
      ))
    );
  }
} 