import { Component, input, output } from '@angular/core';
import {  FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-auth',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  authForm = input<FormGroup>();
  submit = output<FormGroup>();

  onSubmit() {
    this.authForm().markAllAsTouched();
    if(this.authForm().valid){
      this.submit.emit(this.authForm());

    } else {
      console.log('error');      
      // this.toastService.emitToast("Error", "Inconsistency in fields", "error", true);
    }
  }

}