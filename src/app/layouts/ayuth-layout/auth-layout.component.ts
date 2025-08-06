import { Component } from '@angular/core';
import {Footer} from '../../components/footer/footer';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-ayuth-layout',
  imports: [
    Footer,
    RouterOutlet
  ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayout {

}
