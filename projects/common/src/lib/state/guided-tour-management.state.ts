import { GuidedTour } from '../models/guided-tour/guided-tour.model';

export class GuidedTourManagementState {
  public CurrentTour?: GuidedTour;

  public Loading?: boolean;

  public Tours?: GuidedTour[];
}
