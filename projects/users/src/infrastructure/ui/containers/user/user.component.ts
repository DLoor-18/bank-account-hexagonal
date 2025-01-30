import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { concatMap, delay, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { CardComponent, DialogComponent, DialogService, FormComponent, FormService, IButton, ICard, IField, IForm, IModal, InputService, ITableHeader, LoaderService, ModalComponent, TableComponent, TableEventsService, ToastService } from 'shared';
import { GetAllUsersUseCase } from '../../../../application/get-all-users.usecase';
import { SaveUsersUseCase } from '../../../../application/save-user.usecase';
import { IUserRequest } from '../../../../domain/model/user-request.model';
import { IUserResponse } from '../../../../domain/model/user-response.model';

@Component({
  selector: 'lib-user',
  imports: [CardComponent, ModalComponent, DialogComponent],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy{
  private readonly _saveUserUseCase = inject(SaveUsersUseCase);
  private readonly _getUsersUseCase = inject(GetAllUsersUseCase);
  private destroyTableEvent$ = new Subject<void>();
  private destroyForm$ = new Subject<void>();
  public user$: Observable<IUserResponse>;
  public listUser$: Observable<IUserResponse[]>;
  private tableEventsService = inject(TableEventsService);
  private formService = inject(FormService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  private loaderService = inject(LoaderService);
  
  private userRequest: IUserRequest | undefined;
  showModal = false;
  presentDialog = true;

  tableHeader: ITableHeader[] = [
    {
      name: "First Name",
      key: "firstName",
      type: "text"
    },
    {
      name: "Last Name",
      key: "lastName",
      type: "text"
    },
    {
      name: "Email",
      key: "email",
      type: "text"
    },
    {
      name: "Role",
      key: "userRole",
      type: "text"
    }
  ];

  cardData: ICard = {
    header: "Users",
    component: TableComponent,
    componentInputs: {
      dataHeader: this.tableHeader,
      dataBody: []
    }
  };

  fieldData: IField[] = [
    {
      type: "input",
      name: "firstName",
      class: "col-6",
      input: InputService.generateInputData("firstName", "First Name", "", "John", "text", "firstName", true, false),
      validators: [Validators.required]
    },
    {
      type: "input",
      name: "lastName",
      class: "col-6",
      input: InputService.generateInputData("lastName", "Last Name", "", "Doe", "text", "lastName", true, false),
      validators: [Validators.required]
    },
    {
      type: "input",
      name: "email",
      class: "col-6",
      input: InputService.generateInputData("email", "Email", "", "john@gmail.com", "text", "email", true, false),
      validators: [Validators.required, Validators.email]
    },
    {
      type: "input",
      name: "password",
      class: "col-6",
      input: InputService.generateInputData("password", "Password", "", "Jhon123.", "text", "password", true, false),
      validators: [Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$')]
    }

  ];

  buttonData: IButton = {
    type: "info",
    value: "Add",
    disabled: false
  };

  formData: IForm = {
    fields: this.fieldData,
    buttonForm: this.buttonData
  };

  modalData: IModal = {
    title: "Add User",
    component: FormComponent,
    componentInputs: {
      formData: this.formData
    }
  };

  constructor(){
    this.tableEventsService.event$.pipe(takeUntil(this.destroyTableEvent$)).subscribe(event => {
        this.showModal = true;
    });

    this.formService.$formData.pipe(takeUntil(this.destroyForm$)).subscribe(formData => {
      this.userRequest = formData as IUserRequest;
      this.userRequest.userRole = this.userRequest.userRole ?? 'ROLE_EXECUTIVE';
      this.dialogConfirm();
    });
  }

  ngOnInit(): void {
    this._getUsersUseCase.initSubscriptions();
    this.listUser$ = this._getUsersUseCase.listUsers$();
    this._saveUserUseCase.initSubscriptions();
    this.user$ = this._saveUserUseCase.saveUser$();
    
    this.getAllUsers();
  }

  ngOnDestroy(): void {
    this.destroyTableEvent$.next();
    this.destroyTableEvent$.complete();

    this.destroyForm$.next();
    this.destroyForm$.complete();

    this._getUsersUseCase.destroySubscriptions();
    this._saveUserUseCase.destroySubscriptions();
  }

  dialogConfirm() {
    this.presentDialog = true;
    this.dialogService.emitDialog("Confirm process", "Are you sure you want to continue with this process?", "Cancel", "Confirm");
  }

  getAllUsers(){
    this.loaderService.show(true);
    of(this._getUsersUseCase.execute()).pipe(
      concatMap(() => this.listUser$),
      tap(result => {
        if(result.length && this.cardData.componentInputs)
          this.cardData.componentInputs['dataBody'] = result;
        else
          this.toastService.emitToast("Error", "No Users found", "error", true);
  
        this.loaderService.show(false);
      })
    ).subscribe();
    
  }

  createUser() {
    if(!this.userRequest) 
      return;

    this.loaderService.show(true);
    of(this._saveUserUseCase.execute(this.userRequest)).pipe(delay(4000),
      concatMap(() => this.user$),
      tap(result => {
        if(result){
            this.toastService.emitToast("Success", "User created successfully", "success", true);
            this.presentDialog = false;
            this.showModal = false;
            return of (this.getAllUsers()); 
          }
        else{
          this.toastService.emitToast("Error", "User not created", "error", true);
          this.loaderService.show(false);
          return of(null);
        }
      })
    ).subscribe();
  }
  
}