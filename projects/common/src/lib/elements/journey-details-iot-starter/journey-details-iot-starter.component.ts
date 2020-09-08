import { Component, OnInit, Injector } from '@angular/core';
import { LCUElementContext, LcuElementComponent } from '@lcu/common';

export class LcuGuidedTourJourneyDetailsIotStarterElementState {}

export class LcuGuidedTourJourneyDetailsIotStarterContext extends LCUElementContext<LcuGuidedTourJourneyDetailsIotStarterElementState> {}

export const SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_STARTER_ELEMENT = 'lcu-guided-tour-journey-details-iot-starter-element';

@Component({
  selector: SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_STARTER_ELEMENT,
  templateUrl: './journey-details-iot-starter.component.html',
  styleUrls: ['./journey-details-iot-starter.component.scss']
})
export class LcuGuidedTourJourneyDetailsIotStarterElementComponent extends LcuElementComponent<LcuGuidedTourJourneyDetailsIotStarterContext> implements OnInit {
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
