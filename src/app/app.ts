import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { NgHttpLoaderComponent } from 'ng-http-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NgHttpLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Frontend');
}
