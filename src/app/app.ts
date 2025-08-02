import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./layout/footer/footer";
import { Header } from "./layout/header/header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('employee-management-system');
}
