import { Injectable, Injector } from '@angular/core';
import { StateContext } from '@lcu/common';
import { GuidedTourManagementState } from './guided-tour-management.state';

@Injectable({
    providedIn: 'root'
})
export class GuidedTourManagementStateContext extends StateContext<GuidedTourManagementState> {

  // Constructors
  constructor(protected injector: Injector) {
    super(injector);
  }

  // API Methods
  public RecordStep(tourLookup: string, currentStepLookup: string, isComplete: boolean): void {
    this.Execute({
      Arguments: {
        CurrentStep: currentStepLookup,
        IsComplete: isComplete,
        TourLookup: tourLookup
      },
      Type: 'RecordStep'
    });
  }

  public SetActiveTour(tourLookup: string): void {
    this.Execute({
      Arguments: {
        Lookup: tourLookup
      },
      Type: 'SetActiveTour'
    });
  }

  //  Helpers
  protected defaultValue() {
    return { Loading: true } as GuidedTourManagementState;
  }

  protected loadStateKey(): string {
    return 'tours';
  }

  protected loadStateName(): string {
    return 'guidedtour';
  }
}
