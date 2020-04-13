import { NgModule, ModuleWithProviders, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FathymSharedModule, MaterialModule } from '@lcu/common';
import { GuidedTourComponent } from './controls/guided-tour/guided-tour.component';
import { GuideBotComponent } from './controls/guide-bot/guide-bot.component';
import { GuideBotChatComponent } from './controls/guide-bot/bot-chat/bot-chat.component';
import { GuideBotLogoComponent } from './controls/guide-bot/bot-logo/bot-logo.component';
import { GuidedTourService } from './services/guided-tour.service';
import { WindowRefService } from './services/windowref.service';
import { GuideBotEventService } from './services/guide-bot-event.service';

@NgModule({
  declarations: [
    GuidedTourComponent,
    GuideBotComponent,
    GuideBotChatComponent,
    GuideBotLogoComponent
  ],
  imports: [
    FathymSharedModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule
  ],
  providers: [
    WindowRefService
  ],
  exports: [
    GuidedTourComponent,
    GuideBotComponent,
    GuideBotChatComponent,
    GuideBotLogoComponent
  ]
})
export class LcuGuidedTourModule {
  static forRoot(): ModuleWithProviders<LcuGuidedTourModule> {
    return {
      ngModule: LcuGuidedTourModule,
      providers: [
        ErrorHandler,
        GuidedTourService,
        GuideBotEventService
      ]
    };
  }
}
