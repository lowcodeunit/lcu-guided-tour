import { NgModule, DoBootstrap, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FathymSharedModule, LCUServiceSettings } from '@lcu/common';
import { environment } from '../environments/environment';
import { LcuGuidedTourModule, LcuGuidedTourJourneysElementComponent, SELECTOR_LCU_GUIDED_TOUR_JOURNEYS_ELEMENT, LcuGuidedTourJourneyDetailsIotStarterElementComponent, SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_STARTER_ELEMENT, LcuGuidedTourJourneyDetailsMicroFrontendStarterElementComponent, SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_MICRO_FRONTEND_STARTER_ELEMENT, LcuGuidedTourJourneyDetailsIotEdgeBeyondElementComponent, SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_EDGE_BEYOND_ELEMENT } from '@lowcodeunit/lcu-guided-tour-common';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FathymSharedModule,
    LcuGuidedTourModule.forRoot()
  ],
  providers: [
    {
      provide: LCUServiceSettings,
      useValue: FathymSharedModule.DefaultServiceSettings(environment)
    }
  ],
  exports: [LcuGuidedTourModule]
})
export class AppModule implements DoBootstrap {
	constructor(protected injector: Injector) {}

	public ngDoBootstrap() {
		const journeys = createCustomElement(LcuGuidedTourJourneysElementComponent, { injector: this.injector });

		customElements.define(SELECTOR_LCU_GUIDED_TOUR_JOURNEYS_ELEMENT, journeys);
	
		const journeyDetailsIotStarter = createCustomElement(LcuGuidedTourJourneyDetailsIotStarterElementComponent, { injector: this.injector });

		customElements.define(SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_STARTER_ELEMENT, journeyDetailsIotStarter);
	
		const journeyDetailsMicroFrontendStarter = createCustomElement(LcuGuidedTourJourneyDetailsMicroFrontendStarterElementComponent, { injector: this.injector });

		customElements.define(SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_MICRO_FRONTEND_STARTER_ELEMENT, journeyDetailsMicroFrontendStarter);
	
		const journeyDetailsIotEdgeBeyond = createCustomElement(LcuGuidedTourJourneyDetailsIotEdgeBeyondElementComponent, { injector: this.injector });

		customElements.define(SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_EDGE_BEYOND_ELEMENT, journeyDetailsIotEdgeBeyond);
	}
}
