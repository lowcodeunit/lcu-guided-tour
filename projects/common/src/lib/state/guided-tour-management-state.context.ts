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
  public GetTourById(id: number): void {
    this.Execute({
      Arguments: {
          TourId: id
      },
      Type: 'get-tour-by-id'
    });
  }

  public SetActiveTour(lookup: string): void {
    this.Execute({
      Arguments: {
        Lookup: lookup
      },
      Type: 'SetActiveTour'
    });
  }

  //  Helpers
  protected defaultValue() {
    return { Loading: true } as GuidedTourManagementState;
  }

  protected loadStateKey(): string {
    return 'main';
  }

  protected loadStateName(): string {
    return 'guidedtour';
  }
}
