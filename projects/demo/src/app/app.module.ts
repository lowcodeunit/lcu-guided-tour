import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FathymSharedModule, MaterialModule } from '@lcu/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './controls/home/home.component';
import { DocumentationComponent } from './controls/documentation/documentation.component';
import { LcuGuidedTourModule } from '@lowcodeunit/lcu-guided-tour-common';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DocumentationComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FathymSharedModule,
    MaterialModule,
    FlexLayoutModule,
    LcuGuidedTourModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [LcuGuidedTourModule]
})
export class AppModule { }
