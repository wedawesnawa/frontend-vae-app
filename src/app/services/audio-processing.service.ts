// services/audio-processing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PreprocessingStep {
  step: string;
  description: string;
  original_shape?: number[];
  original_length?: number;
  final_length?: number;
  max_val?: number;
}

export interface ExtractionStep {
  step: string;
  description: string;
  n_mels?: number;
  time_frames?: number;
  min_db?: number;
  max_db?: number;
}

export interface Metrics {
  mse: number;
  kld: number;
  elbo: number;
  lsd: {
    mean: number;
    std: number;
    per_frame: number[];
  };
}

export interface ProcessingResponse {
  success: boolean;
  filename: string;
  preprocessing: {
    steps: PreprocessingStep[];
    summary: {
      duration: string;
      sample_rate: number;
      samples: number;
    };
  };
  feature_extraction: {
    steps: ExtractionStep[];
    summary: {
      n_mels: number;
      time_frames: number;
      spectrogram_shape: number[];
    };
  };
  spectrograms: {
    original: string;  // base64
    reconstructed: string;  // base64
  };
  audio: {
    original: string;  // base64
    reconstructed: string;  // base64
  };
  metrics: Metrics;
  latent_representation: {
    mu: number[];
    logvar: number[];
  };
}

export interface ModelInfo {
  model: {
    type: string;
    latent_dim: number;
    input_shape: number[];
  };
  audio_params: {
    sample_rate: number;
    duration: number;
    samples: number;
  };
  spectrogram_params: {
    n_fft: number;
    hop_length: number;
    n_mels: number;
    fmax: number;
  };
  normalization: {
    min_val: number;
    max_val: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AudioProcessingService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  /**
   * Upload dan proses file audio
   */
  processAudio(file: File): Observable<ProcessingResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ProcessingResponse>(`${this.apiUrl}/process`, formData);
  }

  /**
   * Upload dan proses multiple file audio
   */
  processBatchAudio(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files[]', file);
    });

    return this.http.post(`${this.apiUrl}/process_batch`, formData);
  }

  /**
   * Download file hasil rekonstruksi
   */
  downloadFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${filename}`, {
      responseType: 'blob'
    });
  }

  /**
   * Get model information
   */
  getModelInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.apiUrl}/info`);
  }

  /**
   * Health check
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  /**
   * Helper: Convert base64 to Blob for downloading
   */
  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Helper: Create object URL from base64 audio
   */
  base64ToAudioUrl(base64: string): string {
    const blob = this.base64ToBlob(base64, 'audio/wav');
    return URL.createObjectURL(blob);
  }

  /**
   * Helper: Create object URL from base64 image
   */
  base64ToImageUrl(base64: string): string {
    const blob = this.base64ToBlob(base64, 'image/png');
    return URL.createObjectURL(blob);
  }
}
