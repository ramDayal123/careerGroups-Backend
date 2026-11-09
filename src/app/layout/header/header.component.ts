import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
@Input() sidebarCollapsed = false;  
  @Output() menuToggle = new EventEmitter<void>();

  profileDropdownOpen = false;

  pageTitle = 'Dashboard';
  today = new Date();
  notificationsOpen = false;

  constructor(private router: Router) {
   
  }

    toggleProfileDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }


  closeProfileDropdown(): void {
    this.profileDropdownOpen = false;
  }

  signOut(): void {
    this.profileDropdownOpen = false;

    // Change this route to your actual login route if necessary.
    this.router.navigate(['/login']);
  }

  onMenuClick(): void {
    this.menuToggle.emit();
  }

}
