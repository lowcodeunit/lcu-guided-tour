import { OrientationTypes } from './orientation-types.enum';

export class OrientationConfiguration {
  /** Where the tour step will appear next to the selected element */
  public OrientationDirection: OrientationTypes;
  /** When this orientation configuration starts in pixels */
  public MaximumSize?: number;
}
