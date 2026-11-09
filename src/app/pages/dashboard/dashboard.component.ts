import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


interface Student {
  name: string;
  email: string;
  course: string;
  status: 'Active' | 'Pending';
}

interface QuickAction {
  label: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}

interface Activity {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
currentYear = new Date().getFullYear();

  stats = {
    students: 1250,
    courses: 18,
    certificates: 845,
    blogs: 32
  };

  students: Student[] = [
    {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      course: 'ADCA',
      status: 'Active'
    },
    {
      name: 'Priya Verma',
      email: 'priya@example.com',
      course: 'DCA',
      status: 'Active'
    },
    {
      name: 'Amit Kumar',
      email: 'amit@example.com',
      course: 'CCC',
      status: 'Pending'
    },
    {
      name: 'Neha Singh',
      email: 'neha@example.com',
      course: 'Tally',
      status: 'Active'
    }
  ];

  quickActions: QuickAction[] = [
    {
      label: 'Manage Courses',
      description: 'View and update courses',
      route: 'course',
      icon: 'bi-journal-plus',
      color: 'action-blue'
    },
    {
      label: 'Certificates',
      description: 'Manage student certificates',
      route: 'certificate',
      icon: 'bi-patch-check-fill',
      color: 'action-green'
    },
    {
      label: 'Manage Blog',
      description: 'Edit articles and posts',
      route: 'blog',
      icon: 'bi-pencil-square',
      color: 'action-purple'
    },
    {
      label: 'Institute Details',
      description: 'Update institute information',
      route: 'about',
      icon: 'bi-building',
      color: 'action-orange'
    }
  ];

  activities: Activity[] = [
    {
      title: 'Student registration',
      description: 'A new student record was added.',
      time: 'Recent update',
      icon: 'bi-person-plus-fill',
      color: 'activity-blue'
    },
    {
      title: 'Course management',
      description: 'Review your available courses.',
      time: 'Institute update',
      icon: 'bi-journal-check',
      color: 'activity-green'
    },
    {
      title: 'Certificate management',
      description: 'Check issued certificates.',
      time: 'Administration',
      icon: 'bi-award-fill',
      color: 'activity-orange'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate(['/admin', route]);
  }

  viewStudents(): void {
    this.router.navigate(['/admin/students']);
  }
}