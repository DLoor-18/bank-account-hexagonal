import { inject, Injectable } from "@angular/core";
import { Subscription, Observable, tap, filter } from "rxjs";
import { State } from "../domain/state";
import { IAuthResponse } from "../domain/model/auth-response.model";
import { AuthUserService } from "../infrastructure/services/auth-user.service";
import { IAuthRequest } from "../domain/model/auth-request.model";

@Injectable({
    providedIn: 'root'
})
export class AuthUserUseCase {
    private readonly _service = inject(AuthUserService);
    private readonly _state = inject(State);
    private subscriptions: Subscription;
  
    //#region Observables
    authUser$(): Observable<IAuthResponse> {
      return this._state.users.auth.$();
    }
    //#endregion
  
    //#region Public Methods
    initSubscriptions(): void {
      this.subscriptions = new Subscription();
    }
  
    destroySubscriptions(): void {
      this.subscriptions.unsubscribe();
    }
  
    execute(user: IAuthRequest): void {
      this.subscriptions.add(
        this._service.authUser(user)
          .pipe(
            tap(result => {
                if (result!.token) {
                    this._state.users.auth.set(result);

                    // const users = this._state.users.user.snapshot();
                    // this._state.users.user.set([...users, result])
                }
            })
          )
          .subscribe()
      );
    }
    //#endregion

}