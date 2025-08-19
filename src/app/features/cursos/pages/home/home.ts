import { Component } from '@angular/core';
import { Navbar } from '@shared/components/navbar/navbar';
import {Footer} from '@shared/components/footer/footer';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink
  ],
  templateUrl: './home.html'
})
export class Home {

}
