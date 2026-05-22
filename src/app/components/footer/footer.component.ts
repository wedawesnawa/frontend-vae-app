import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  footerLinks = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', link: '#' },
        { label: 'Careers', link: '#' },
        { label: 'Press', link: '#' },
        { label: 'Blog', link: '#' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', link: '#' },
        { label: 'Contact Us', link: '#' },
        { label: 'Privacy Policy', link: '#' },
        { label: 'Terms of Service', link: '#' }
      ]
    },
    {
      title: 'Connect',
      links: [
        { label: 'Facebook', link: '#' },
        { label: 'Twitter', link: '#' },
        { label: 'Instagram', link: '#' },
        { label: 'Pinterest', link: '#' }
      ]
    }
  ];
}
