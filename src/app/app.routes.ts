import { Routes } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { ResultComponent } from './components/result/result.component';
import { ModelsComponent } from './components/models/models.component';
import { DataComponent } from './components/data/data.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
  {path: '', component: HeroComponent},//default langsung ke dashboard
  {path: 'result', component: ResultComponent},
  {path: 'model', component: ModelsComponent},
  {path: 'data', component: DataComponent},
  {path: 'about', component: AboutComponent},
  { path: '**', redirectTo: '' } //mekanisme buat url yang ga valid diakses ma user
];
