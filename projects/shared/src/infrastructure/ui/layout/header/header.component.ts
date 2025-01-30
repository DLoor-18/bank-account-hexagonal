import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/utils/token.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  emailUser: string = '';

  ngOnInit(): void {
    this.emailUser = localStorage.getItem('email') ?? '';
  }

  logout() {
    this.tokenService.revokeToken();
    this.router.navigate(['login']);
  }

}