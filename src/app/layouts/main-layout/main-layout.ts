import { Component } from '@angular/core';
import {Navbar} from '../../components/navbar/navbar';
import {Footer} from '../../components/footer/footer';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [
    Navbar,
    Footer,
    RouterOutlet
  ],
  templateUrl: './main-layout.html'
})
export class MainLayout {

}
