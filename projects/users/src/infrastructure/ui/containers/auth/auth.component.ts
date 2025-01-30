import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, switchMap, tap } from 'rxjs';
import { AuthUserUseCase } from '../../../../application/auth-user.usecase';
import { IAuthResponse } from '../../../../domain/model/auth-response.model';
import { AuthFormComponent } from "../../forms/auth-form/auth-form.component";
import { LoaderComponent, LoaderService, ToastComponent, ToastService, TokenService } from 'shared';

@Component({
  selector: 'lib-auth',
  imports: [AuthFormComponent, LoaderComponent, ToastComponent],
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
  private readonly _useCase = inject(AuthUserUseCase);
  public auth$: Observable<IAuthResponse>;
  private router = inject(Router);
  private fb = inject(FormBuilder);
  tokenService = inject(TokenService)
  toastService = inject(ToastService);
  loaderService = inject(LoaderService);

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if(this.tokenService.isAuthenticated()) {
      this.router.navigate(['']);
    } else {
      this._useCase.initSubscriptions();
      this.auth$ = this._useCase.authUser$();
    }
  }

  ngOnDestroy(): void {
    this._useCase.destroySubscriptions();
  }

  auth() {
    this.authForm.markAllAsTouched();
    if (this.authForm.valid) {
      this.validateCredentials();
    } else {
      this.toastService.emitToast("Error", "Inconsistency in fields", "error", true);
    }
  }

  get getEmail(): string {
    return this.authForm.value.email ?? '';
  }

  validateCredentials() {
    this.loaderService.show(true);
    of(this._useCase.execute(this.authForm.getRawValue())).pipe(
      switchMap(() => this.auth$),
      tap(response => {
        if (response?.token) {
          localStorage.setItem('email', this.getEmail);
          this.tokenService.handleToken(response.token);
          this.router.navigate(['']);
          return true;
        } else {
          return false;
        }
      })
    ).subscribe();
  }
}
