import { GuidedTour } from '../models/guided-tour/guided-tour.model';
import { GuidedTourStepRecord } from '../models/guided-tour/guided-tour-step-record.model';

export class GuidedTourManagementState {
  public CompletedTourLookups?: { [tourLookup: string]: string};

  public CurrentTour?: GuidedTour;

  public Loading?: boolean;

  public StepRecords?: { [tourLookup: string]: GuidedTourStepRecord };

  public Tours?: GuidedTour[];

  public ToursEnabled?: boolean;
}
