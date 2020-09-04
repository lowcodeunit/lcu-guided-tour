import { Component, OnInit, Injector } from '@angular/core';
import { LCUElementContext, LcuElementComponent } from '@lcu/common';
import {
  JourneyContentTypes,
  JourneyOption,
  LimitedJourneysManagementState,
} from '../../state/journeys/journeys.state';
import { JourneysManagementStateContext } from '../../state/journeys/journeys-state.context';

export class LcuGuidedTourJourneysElementState {}

export class LcuGuidedTourJourneysContext extends LCUElementContext<
  LcuGuidedTourJourneysElementState
> {}

export const SELECTOR_LCU_GUIDED_TOUR_JOURNEYS_ELEMENT =
  'lcu-guided-tour-journeys-element';

@Component({
  selector: SELECTOR_LCU_GUIDED_TOUR_JOURNEYS_ELEMENT,
  templateUrl: './journeys.component.html',
  styleUrls: ['./journeys.component.scss'],
})
export class LcuGuidedTourJourneysElementComponent
  extends LcuElementComponent<LcuGuidedTourJourneysContext>
  implements OnInit {
  //  Fields

  //  Properties
  
  /**
   * Content Types
   */
  public ContentTypes = JourneyContentTypes;

  public CurrentJourney: JourneyOption;

  /**
   * Array of journeys divided up into role types (used to populate UI)
   */
  public DividedJourneys: Array<{
    JourneyName: string;
    Journeys: Array<any>;
  }> = [];

  public HighlightedJourneys: JourneyOption[];

  /**
   * Current state
   */
  public State: LimitedJourneysManagementState;

  public JourneyRoles: string[];

  //  Constructors
  constructor(
    protected injector: Injector,
    protected state: JourneysManagementStateContext
  ) {
    super(injector);
  }

  //  Life Cycle
  public ngOnInit() {
    super.ngOnInit();

    this.state.Context.subscribe((state: any) => {
      this.State = state;

      this.State.IsIoTStarter = true;

      this.handleStateChanges();
    });
  }

  //  API Methods
  public ContainsRoleType(journey: JourneyOption, roleType: string) {
    return !!journey.Roles.find((r) => r === roleType);
  }

  public MoreDetails(journey: JourneyOption) {
    this.State.Loading = true;

    return this.state.MoreDetails(journey ? journey.Lookup : null);
  }

  //  Helpers
  protected setCurrentJourney() {
    this.CurrentJourney = this.State.Journeys.find(
      (j) => j.Lookup === this.State.CurrentJourneyLookup
    );
  }

  /**
   * Divides the journeys from the state into individual arrays of role-based journeys
   */
  protected divideJourneys() {
    this.DividedJourneys = [];
    this.JourneyRoles.forEach((role) => {
      this.DividedJourneys.push({ JourneyName: role, Journeys: [] });
    });
    this.State.Journeys.forEach((journey) => {
      journey.Roles.forEach((role: any) => {
        this.DividedJourneys.find((j) => j.JourneyName === role).Journeys.push(
          journey
        );
      });
    });
  }

  /**
   * Handle when the state is returned
   */
  protected handleStateChanges(): void {
    if (this.State.Journeys) {
      this.setJourneyRoles();

      this.divideJourneys();

      this.highlightJourneys();

      this.setCurrentJourney();
    }
  }

  protected highlightJourneys() {
    this.HighlightedJourneys = this.State.Journeys.filter(
      (j) => !!j.HighlightedOrder
    );
  }

  protected setJourneyRoles(): void {
    if (this.State.Journeys) {
      const roles = Array.from(
        new Set(
          this.State.Journeys.map((j) => j.Roles).reduce((a, b) => {
            return a.concat(b);
          })
        )
      );

      this.JourneyRoles = roles;
    }
  }
}
