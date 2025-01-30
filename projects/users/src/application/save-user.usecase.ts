import { inject, Injectable } from "@angular/core";
import { Observable, Subscription, tap } from "rxjs";
import { IUserRequest } from "../domain/model/user-request.model";
import { IUserResponse } from "../domain/model/user-response.model";
import { State } from "../domain/state";
import { SaveUserService } from "../infrastructure/services/save-user.service";

@Injectable({
    providedIn: 'root'
})
export class SaveUsersUseCase {
    private readonly _service = inject(SaveUserService);
    private readonly _state = inject(State);
    private subscriptions: Subscription;
  
    //#region Observables
    saveUser$(): Observable<IUserResponse> {
      return this._state.users.user.$();
    }
    //#endregion
  
    //#region Public Methods
    initSubscriptions(): void {
      this.subscriptions = new Subscription();
    }
  
    destroySubscriptions(): void {
      this.subscriptions.unsubscribe();
    }
  
    execute(user: IUserRequest): void {
      this.subscriptions.add(
        this._service.saveUser(user)
          .pipe(
            tap(result => {
                this._state.users.user.set(result);
            })
          )
          .subscribe()
      );
    }
    //#endregion

}