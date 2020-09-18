import { Component, OnInit, Injector } from '@angular/core';
import { LCUElementContext, LcuElementComponent } from '@lcu/common';

export class LcuGuidedTourJourneyDetailsIotEdgeBeyondElementState {}

export class LcuGuidedTourJourneyDetailsIotEdgeBeyondContext extends LCUElementContext<LcuGuidedTourJourneyDetailsIotEdgeBeyondElementState> {}

export const SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_EDGE_BEYOND_ELEMENT = 'lcu-guided-tour-journey-details-iot-edge-beyond-element';

@Component({
  selector: SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_EDGE_BEYOND_ELEMENT,
  templateUrl: './journey-details-iot-edge-beyond.component.html',
  styleUrls: ['./journey-details-iot-edge-beyond.component.scss']
})
export class LcuGuidedTourJourneyDetailsIotEdgeBeyondElementComponent extends LcuElementComponent<LcuGuidedTourJourneyDetailsIotEdgeBeyondContext> implements OnInit {
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
