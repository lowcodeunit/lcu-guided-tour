import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './controls/home/home.component';
import { DocumentationComponent } from './controls/documentation/documentation.component';
import { IframeComponent } from './controls/iframe/iframe.component';
import { JourneysComponent } from './controls/journeys/journeys.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'documentation', component: DocumentationComponent },
  { path: 'iframe', component: IframeComponent },
  { path: 'journeys', component: JourneysComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
