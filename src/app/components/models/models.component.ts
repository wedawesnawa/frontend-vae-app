import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

export interface ModelCategory {
  id: string;
  name: string;
  metrics: ModelMetrics;
  images: ModelImages;
}

export interface ModelMetrics {
  latentDim: number;
  batchSize: number;
  learningRate: number;
  epoch: number;
  mse: number;
  klDivergence: number;
  totalElbo: number;
  trainingDuration: string;
}

export interface ModelImages {
  totalLoss: string;
  reconstructionLoss: string;
  klDivergence: string;
}

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './models.component.html',
  styleUrl: './models.component.css'
})
export class ModelsComponent implements OnInit {
  categories: ModelCategory[] = [
    {
      id: 'model-1',
      name: 'Model 1',
      metrics: {
        latentDim: 64,
        batchSize: 32,
        learningRate: 0.0001,
        epoch: 100,
        mse: 0.00178,
        klDivergence: 0.06138,
        totalElbo: 0.06316,
        trainingDuration: '9h 39m'
      },
      images: {
        totalLoss: '/64+0,0001+elbo.png',
        reconstructionLoss: '/64+0,0001+mse.png',
        klDivergence: '/64+0,0001+kld.png'
      }
    },
    {
      id: 'model-2',
      name: 'Model 2',
      metrics: {
        latentDim: 128,
        batchSize: 32,
        learningRate: 0.0001,
        epoch: 100,
        mse: 0.00143,
        klDivergence: 0.06934,
        totalElbo: 0.07077,
        trainingDuration: '9h 4m'
      },
      images: {
        totalLoss: '/128+0,0001+elbo.png',
        reconstructionLoss: '/128+0,0001+mse.png',
        klDivergence: '/128+0,0001+kld.png'
      }
    },
    {
      id: 'model-3',
      name: 'Model 3',
      metrics: {
        latentDim: 256,
        batchSize: 32,
        learningRate: 0.0001,
        epoch: 100,
        mse: 0.00136,
        klDivergence: 0.08950,
        totalElbo: 0.09086,
        trainingDuration: '10h 15m'
      },
      images: {
        totalLoss: '/256+0,0001+elbo.png',
        reconstructionLoss: '/256+0,0001+mse.png',
        klDivergence: '/256+0,0001+kld.png'
      }
    },
    {
      id: 'model-4',
      name: 'Model 4',
      metrics: {
        latentDim: 128,
        batchSize: 32,
        learningRate: 0.00001,
        epoch: 100,
        mse: 0.00248,
        klDivergence: 0.05987,
        totalElbo: 0.06235,
        trainingDuration: '10h 13m'
      },
      images: {
        totalLoss: '/128+0,00001+elbo.png',
        reconstructionLoss: '/128+0,00001+mse.png',
        klDivergence: '/128+0,00001+kld.png'
      }
    },
    {
      id: 'model-5',
      name: 'Model 5',
      metrics: {
        latentDim: 128,
        batchSize: 32,
        learningRate: 0.001,
        epoch: 100,
        mse: 0,
        klDivergence: 0,
        totalElbo: 0,
        trainingDuration: 'Error'
      },
      images: {
        totalLoss: 'assets/charts/total-loss-beta05.svg',
        reconstructionLoss: 'assets/charts/recon-loss-beta05.svg',
        klDivergence: 'assets/charts/kl-loss-beta05.svg'
      }
    }
  ];

  selectedCategory: ModelCategory = this.categories[0];
  isLoading = false;
  showTooltip = false;

  ngOnInit() {
    // Set default selected category
    this.selectedCategory = this.categories[0];
  }

  onCategoryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const categoryId = select.value;

    this.isLoading = true;

    // Simulate loading data
    setTimeout(() => {
      const category = this.categories.find(c => c.id === categoryId);
      if (category) {
        this.selectedCategory = category;
      }
      this.isLoading = false;
    }, 500); // 500ms delay untuk simulasi loading
  }

  downloadModel() {
    console.log('Downloading model:', this.selectedCategory.name);
    // Implementasi download logic di sini
  }
}
