import { NgModule, ModuleWithProviders, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FathymSharedModule, MaterialModule, DirectiveModule } from '@lcu/common';
import { GuidedTourComponent } from './controls/guided-tour/guided-tour.component';
import { GuideBotComponent } from './controls/guide-bot/guide-bot.component';
import { GuideBotChatComponent } from './controls/guide-bot/bot-chat/bot-chat.component';
import { GuideBotLogoComponent } from './controls/guide-bot/bot-logo/bot-logo.component';
import { GuidedTourService } from './services/guided-tour.service';
import { WindowRefService } from './services/windowref.service';
import { GuideBotEventService } from './services/guide-bot-event.service';
import { GuidedTourManagementStateContext } from './state/guided-tour-management-state.context';
import { LcuGuidedTourJourneysElementComponent } from './elements/journeys/journeys.component';
import { JourneysManagementStateContext } from './state/journeys/journeys-state.context';
import { JourneyCardComponent } from './elements/journeys/journey-card/journey-card.component';
import { IotDataChartComponent } from './elements/journeys/iot-data-chart/iot-data-chart.component';
import { JourneyDetailsComponent } from './elements/journeys/journey-details/journey-details.component';
import { ChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { LazyElementModule } from '@lowcodeunit/lazy-element';
import { LcuGuidedTourJourneyDetailsIotStarterElementComponent } from './elements/journey-details-iot-starter/journey-details-iot-starter.component';
import { LcuGuidedTourJourneyDetailsMicroFrontendStarterElementComponent } from './elements/journey-details-micro-frontend-starter/journey-details-micro-frontend-starter.component';
import { LcuGuidedTourJourneyDetailsIotEdgeBeyondElementComponent } from './elements/journey-details-iot-edge-beyond/journey-details-iot-edge-beyond.component';

@NgModule({
  declarations: [
    GuidedTourComponent,
    GuideBotComponent,
    GuideBotChatComponent,
    GuideBotLogoComponent,
    LcuGuidedTourJourneysElementComponent,
    JourneyCardComponent,
    IotDataChartComponent,
    JourneyDetailsComponent,
    LcuGuidedTourJourneyDetailsIotStarterElementComponent,
    LcuGuidedTourJourneyDetailsMicroFrontendStarterElementComponent,
    LcuGuidedTourJourneyDetailsIotEdgeBeyondElementComponent,
  ],
  imports: [
    FathymSharedModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    ChartsModule,
    DirectiveModule,
    LazyElementModule,
  ],
  providers: [WindowRefService],
  exports: [
    GuidedTourComponent,
    GuideBotComponent,
    GuideBotChatComponent,
    GuideBotLogoComponent,
    LcuGuidedTourJourneysElementComponent,
    JourneyCardComponent,
    IotDataChartComponent,
    JourneyDetailsComponent,
    ChartsModule,
    HttpClientModule,
    DirectiveModule,
    LcuGuidedTourJourneyDetailsIotStarterElementComponent,
    LcuGuidedTourJourneyDetailsMicroFrontendStarterElementComponent,
    LcuGuidedTourJourneyDetailsIotEdgeBeyondElementComponent
  ],
  entryComponents: [LcuGuidedTourJourneysElementComponent, LcuGuidedTourJourneyDetailsIotStarterElementComponent, LcuGuidedTourJourneyDetailsMicroFrontendStarterElementComponent, LcuGuidedTourJourneyDetailsIotEdgeBeyondElementComponent],
})
export class LcuGuidedTourModule {
  static forRoot(): ModuleWithProviders<LcuGuidedTourModule> {
    return {
      ngModule: LcuGuidedTourModule,
      providers: [
        ErrorHandler,
        GuidedTourService,
        GuidedTourService,
        JourneysManagementStateContext,
        GuideBotEventService,
        GuidedTourManagementStateContext,
      ],
    };
  }
}
