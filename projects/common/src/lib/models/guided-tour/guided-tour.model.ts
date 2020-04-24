import { TourStep } from './tour-step.model';
import { ResizeDialog } from './resize-dialog.model';

export class GuidedTour {
  /** Lookup for tour */
  public Lookup: string;
  /** Identifier for tour */
  public ID: string;
  /** Use orb to start tour */
  public UseOrb?: boolean;
  /** Steps fo the tour */
  public Steps: TourStep[];
  /** Minimum size of screen in pixels before the tour is run, if the tour is resized below this value the user will be told to resize */
  public MinimumScreenSize?: number;
  /** Dialog shown if the window width is smaller than the defined minimum screen size. */
  public ResizeDialog?: ResizeDialog;
  /**
   * Prevents the tour from advancing by clicking the backdrop.
   * This should only be set if you are completely sure your tour is displaying correctly on all screen sizes otherwise a user can get stuck.
   */
  public PreventBackdropFromAdvancing?: boolean;
}
