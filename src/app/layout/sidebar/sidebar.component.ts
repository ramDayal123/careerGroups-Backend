import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
 imports: [CommonModule,RouterLinkActive,RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
@Input() mobileOpen = false;
 @Input() collapsed = false;
  @Output() navigate = new EventEmitter<void>();

  @HostBinding('class.mobile-open')
  get isMobileOpen(): boolean {
    return this.mobileOpen;
  }

  menuGroups: { title: string; items: MenuItem[] }[] = [
    {
      title: 'MAIN MENU',
      items: [
        { label: 'Dashboard', icon: 'bi-grid-1x2-fill', route: 'dashboard' },
        { label: 'Home Page', icon: 'bi-house-door', route: '/admin/home' },
        { label: 'About Us', icon: 'bi-building', route: '/admin/about' },
        { label: 'Courses', icon: 'bi-journal-bookmark', route: '/admin/courses' },
        { label: 'Certificates', icon: 'bi-award', route: '/admin/certificates' },
        { label: 'Students', icon: 'bi-people', route: '/admin/stud-details' },
     
        { label: 'Blog', icon: 'bi-file-earmark-text', route: '/admin/blog' },
        { label: 'Contact Messages', icon: 'bi-chat-left-text', route: '/admin/contact' },
        { label: 'Settings', icon: 'bi-gear', route: '/admin/settings' }
      ]
    }
  ];

  constructor(private router: Router) {}

  onNavigate(): void {
    this.navigate.emit();
  }

  logout(): void {
    // Replace this with your authentication service's logout method.
    this.navigate.emit();
    this.router.navigate(['/admin/login']);
  }
}