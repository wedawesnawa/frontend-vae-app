import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuOpen = false;
  logoLoaded = false;
  private whatsappNumber = '087899509360';
  private defaultMessage = 'Halo, saya mau bertanya';
  ngOnInit() {
    // Check if logo exists
    this.checkLogo();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  menuItems = [
    { label: 'Home', link: '/' },
    { label: 'Data', link: '/data' },
    { label: 'Model', link: '/model' },
    { label: 'About', link: '/about' }
  ];

  checkLogo() {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => {
      this.logoLoaded = true;
    };
    img.onerror = () => {
      this.logoLoaded = false;
    };
  }
  openWhatsApp() {
    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(this.defaultMessage);

    // Buat URL WhatsApp
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

    // Buka di tab baru
    window.open(whatsappUrl, '_blank');

    // Alternatif: redirect di tab yang sama
    // window.location.href = whatsappUrl;

    // Tutup menu mobile jika terbuka
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }
}
