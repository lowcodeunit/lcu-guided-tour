import { Component, OnInit, Injector } from '@angular/core';
import { LCUElementContext, LcuElementComponent } from '@lcu/common';

export class LcuGuidedTourJourneyDetailsMicroFrontendStarterElementState {}

export class LcuGuidedTourJourneyDetailsMicroFrontendStarterContext extends LCUElementContext<LcuGuidedTourJourneyDetailsMicroFrontendStarterElementState> {}

export const SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_MICRO_FRONTEND_STARTER_ELEMENT = 'lcu-guided-tour-journey-details-micro-frontend-starter-element';

@Component({
  selector: SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_MICRO_FRONTEND_STARTER_ELEMENT,
  templateUrl: './journey-details-micro-frontend-starter.component.html',
  styleUrls: ['./journey-details-micro-frontend-starter.component.scss']
})
export class LcuGuidedTourJourneyDetailsMicroFrontendStarterElementComponent extends LcuElementComponent<LcuGuidedTourJourneyDetailsMicroFrontendStarterContext> implements OnInit {
  //  Fields

  //  Properties

  //  Constructors
  constructor(protected injector: Injector) {
    super(injector);
  }

  //  Life Cycle
  public ngOnInit() {
    super.ngOnInit();
  }

  //  API Methods

  //  Helpers
}
