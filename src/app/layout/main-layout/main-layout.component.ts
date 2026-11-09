
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

import { SidebarComponent } from 'src/app/layout/sidebar/sidebar.component';
import { HeaderComponent } from 'src/app/layout/header/header.component';
import { FooterComponent } from 'src/app/layout/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
    imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {


  sidebarCollapsed = false;
  mobileOpen = false;

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992) {
      this.mobileOpen = false;
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeSidebar(): void {
    this.mobileOpen = false;
  }
}
