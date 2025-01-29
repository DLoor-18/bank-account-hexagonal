import { inject, Injectable } from "@angular/core";
import { StateFactory } from "./state.factory";
import { BehaviorSubject } from "rxjs";
import { IUserResponse } from "../model/user-response.model";
import { IAuthResponse } from "../model/auth-response.model";

@Injectable({
  providedIn: 'root'
})
export class UsersState {
  private readonly _factory = inject(StateFactory);

  //#region Subjects
  private readonly user$ = new BehaviorSubject<IUserResponse>(null);
  private readonly auth$ = new BehaviorSubject<IAuthResponse>(null);
  //#endregion

  store() {
    return {
      user: this._factory.state(this.user$),
      auth: this._factory.state(this.auth$)
    }
  }
}