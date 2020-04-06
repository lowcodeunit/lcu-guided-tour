import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FathymSharedModule, MaterialModule } from '@lcu/common';
import { LcuService } from './services/lcu.service';
import { LcuComponent } from './controls/lcu/lcu.component';
import { LcuDirective } from './directives/lcu.directive';

@NgModule({
  declarations: [LcuComponent, LcuDirective],
  imports: [
    FathymSharedModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule
  ],
  exports: [LcuComponent, LcuDirective],
  entryComponents: []
})
export class LcuGuidedTourModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LcuGuidedTourModule,
      providers: [LcuService]
    };
  }
}
