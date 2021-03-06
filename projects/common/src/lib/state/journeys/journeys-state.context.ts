import { StateContext, Application } from '@lcu/common';
import { Injectable, Injector } from '@angular/core';
import { LimitedJourneysManagementState } from './journeys.state';

@Injectable({
  providedIn: 'root',
})
export class JourneysManagementStateContext extends StateContext<
  LimitedJourneysManagementState
> {
  //  Properties

  //  Constructors
  constructor(protected injector: Injector) {
    super(injector);
  }

  //  API Methods
  public MoreDetails(journeyLookup: string): void {
    this.Execute({
      Arguments: {
        JourneyLookup: journeyLookup
      },
      Type: 'MoreDetails'
    });
  }

  //  Helpers
  protected defaultValue() {
    return { Loading: true } as LimitedJourneysManagementState;
  }

  protected loadStateKey(): string {
    return 'journeys';
  }

  protected loadStateName(): string {
    return 'guidedtour';
  }
}
