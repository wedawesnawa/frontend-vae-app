import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProcessingResponse, AudioProcessingService } from '../../services/audio-processing.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit, OnDestroy {
  // Data dari API
  processingResult: ProcessingResponse | null = null;

  // Data untuk UI
  preprocessingSteps: any[] = [];
  extractionSteps: any[] = [];

  // URLs untuk audio dan gambar
  originalAudioUrl: SafeUrl | null = null;
  reconstructedAudioUrl: SafeUrl | null = null;
  originalSpectrogramUrl: SafeUrl | null = null;
  reconstructedSpectrogramUrl: SafeUrl | null = null;

  // Loading state
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private audioService: AudioProcessingService,
    private sanitizer: DomSanitizer
  ) {
    // Get navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { processingResult: ProcessingResponse };

    if (state?.processingResult) {
      this.processingResult = state.processingResult;
      this.isLoading = false;
      this.prepareDisplayData();
    } else {
      // If no data, redirect to home
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    // Jika tidak ada data, redirect ke home
    if (!this.processingResult) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    // Cleanup object URLs to prevent memory leaks
    if (this.originalAudioUrl) {
      URL.revokeObjectURL(this.originalAudioUrl.toString());
    }
    if (this.reconstructedAudioUrl) {
      URL.revokeObjectURL(this.reconstructedAudioUrl.toString());
    }
    if (this.originalSpectrogramUrl) {
      URL.revokeObjectURL(this.originalSpectrogramUrl.toString());
    }
    if (this.reconstructedSpectrogramUrl) {
      URL.revokeObjectURL(this.reconstructedSpectrogramUrl.toString());
    }
  }

  /**
   * Prepare data for display
   */
  prepareDisplayData() {
    if (!this.processingResult) return;

    // 1. Convert preprocessing steps ke format yang bisa ditampilkan
    this.preprocessingSteps = this.processingResult.preprocessing.steps.map(step => ({
      label: step.step,
      description: step.description,
      checked: true // Semua step yang berhasil dijalankan
    }));

    // 2. Convert extraction steps ke format yang bisa ditampilkan
    this.extractionSteps = this.processingResult.feature_extraction.steps.map(step => ({
      label: step.step,
      description: step.description,
      checked: true
    }));

    // 3. Convert base64 ke object URLs
    this.originalAudioUrl = this.sanitizer.bypassSecurityTrustUrl(
      this.audioService.base64ToAudioUrl(this.processingResult.audio.original)
    );

    this.reconstructedAudioUrl = this.sanitizer.bypassSecurityTrustUrl(
      this.audioService.base64ToAudioUrl(this.processingResult.audio.reconstructed)
    );

    this.originalSpectrogramUrl = this.sanitizer.bypassSecurityTrustUrl(
      this.audioService.base64ToImageUrl(this.processingResult.spectrograms.original)
    );

    this.reconstructedSpectrogramUrl = this.sanitizer.bypassSecurityTrustUrl(
      this.audioService.base64ToImageUrl(this.processingResult.spectrograms.reconstructed)
    );
  }

  /**
   * Download reconstructed audio
   */
  downloadAudio() {
    if (!this.processingResult) return;

    const blob = this.audioService.base64ToBlob(
      this.processingResult.audio.reconstructed,
      'audio/wav'
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.processingResult.filename}_reconstructed.wav`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download comparison image
   */
  downloadImage() {
    if (!this.processingResult) return;

    const blob = this.audioService.base64ToBlob(
      this.processingResult.spectrograms.original,
      'image/png'
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.processingResult.filename}_spectrogram.png`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download all results as zip
   */
  downloadAll() {
    // Bisa diimplementasikan untuk download semua file dalam satu zip
    this.downloadAudio();
    this.downloadImage();
  }

  /**
   * Process another file
   */
  processAnother() {
    this.router.navigate(['/']);
  }

  /**
   * Get file name without extension
   */
  getFileName(): string {
    if (!this.processingResult) return '';
    return this.processingResult.filename.replace(/\.[^/.]+$/, '');
  }

  /**
   * Format metrics with decimal places
   */
  // formatMetric(value: number, decimals: number = 4): string {
  //   return value.toFixed(decimals);
  // }
  formatMetric(val: any, type: 'mse' | 'rmse-percent' = 'mse'): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '0.00000';
  }

  const num = Number(val);

  if (type === 'rmse-percent') {
    return (Math.sqrt(num) * 100).toFixed(2);
  }
    // Safely convert to a number and format
    return Number(val).toFixed(5);
  }
}
