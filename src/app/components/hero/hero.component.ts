import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AudioProcessingService } from '../../services/audio-processing.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  providers: [AudioProcessingService]
})
export class HeroComponent {
  isDragging = false;
  uploadedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadError: string | null = null;
  processingCompleted = false; // Flag untuk menandai proses selesai
  processingResult: any = null; // Menyimpan hasil processing

  constructor(
    private el: ElementRef,
    private router: Router,
    private audioService: AudioProcessingService
  ) {}

  // ========== TOMBOL PLUS - DIRECT FILE PICKER ==========
  openFilePicker() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/wav,audio/mpeg,audio/mp3,audio/x-wav';
    fileInput.style.display = 'none';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFile(file);
      }
      document.body.removeChild(fileInput);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  // ========== DRAG & DROP ==========
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    if (this.isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    if (this.isUploading) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  // ========== HANDLE FILE UPLOAD ==========
  handleFile(file: File) {
    // Reset states
    this.processingCompleted = false;
    this.processingResult = null;

    // Validasi file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp3'];
    const validExtensions = ['.wav', '.mp3'];

    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      alert('Silakan upload file audio (WAV atau MP3)');
      return;
    }

    // Validasi file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File terlalu besar. Maksimal 50MB');
      return;
    }

    this.uploadedFile = file;
    this.uploadFile();
  }

  // ========== UPLOAD FILE KE API ==========
  uploadFile() {
    if (!this.uploadedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = null;

    // Simulate progress untuk UI (opsional)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    // Call API untuk memproses audio
    this.audioService.processAudio(this.uploadedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;

        // Simpan hasil processing
        this.processingResult = response;

        // Tandai processing selesai setelah delay singkat
        setTimeout(() => {
          this.isUploading = false;
          this.processingCompleted = true;
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadError = 'Gagal memproses file. Silakan coba lagi.';
        console.error('Upload error:', error);
      }
    });
  }

  // ========== LIHAT HASIL ==========
  viewResult() {
    if (this.processingCompleted && this.processingResult) {
      // Navigasi ke halaman hasil dengan data
      this.router.navigate(['/result'], {
        state: {
          processingResult: this.processingResult,
          audioFile: this.uploadedFile // Optional: kirim file audio juga jika diperlukan
        }
      });
    }
  }

  // Reset upload
  resetUpload() {
    this.uploadedFile = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.uploadError = null;
    this.processingCompleted = false;
    this.processingResult = null;
  }

  playAudio() {
    if (this.uploadedFile) {
      const audioUrl = URL.createObjectURL(this.uploadedFile);
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Gagal memutar audio:', error);
        alert('Gagal memutar audio. Silakan coba lagi.');
      });

      // Cleanup URL object setelah audio selesai
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }

  // Get file icon
  getFileIcon(): string {
    if (!this.uploadedFile) return '📁';
    return '🎵';
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
