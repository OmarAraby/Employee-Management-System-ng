import { Component } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { Header } from "../header/header";

@Component({
  selector: 'app-admin-layout',
  imports: [Sidebar, Header],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

}
