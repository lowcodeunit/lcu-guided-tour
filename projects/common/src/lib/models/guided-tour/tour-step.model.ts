import { OrientationConfiguration } from './orientation-configuration.model';
import { OrientationTypes } from './orientation-types.enum';

export class TourStep {
  /** Selector for element that will be highlighted */
  public Selector?: string;
  /** Tour title text */
  public Title?: string;
  /** Tour subtitle text */
  public Subtitle?: string;
  /** Tour step text */
  public Content: string;
  /** Where the tour step will appear next to the selected element */
  public Orientation?: OrientationTypes;
  /** Where the tour step will appear next to the selected element */
  public OrientationConfiguration?: OrientationConfiguration[];
  /** The amount (in milliseconds) of a delay before action() function is called */
  public ActionDelay?: number;
  /** Skips this step, this is so you do not have create multiple tour configurations based on user settings/configuration */
  public SkipStep?: boolean;
  /** Adds some padding for things like sticky headers when scrolling to an element */
  public ScrollAdjustment?: number;
  /** Adds default padding around tour highlighting. Does not need to be true for highlightPadding to work */
  public UseHighlightPadding?: boolean;
  /** Adds padding around tour highlighting in pixels, this overwrites the default for this step. Is not dependent on useHighlightPadding being true */
  public HighlightPadding?: number;
}
