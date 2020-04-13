import { TourStep } from './tour-step.model';

export interface GuidedTour {
  /** Identifier for tour */
  tourId: string;
  /** Use orb to start tour */
  useOrb?: boolean;
  /** Steps fo the tour */
  steps: TourStep[];
  /** Function will be called when tour is skipped */
  skipCallback?: (stepSkippedOn: number) => void;
  /** Function will be called when tour is completed */
  completeCallback?: () => void;
  /** Minimum size of screen in pixels before the tour is run, if the tour is resized below this value the user will be told to resize */
  minimumScreenSize?: number;
  /** Dialog shown if the window width is smaller than the defined minimum screen size. */
  resizeDialog?: {
      /** Resize dialog title text */
      title?: string;
      /** Resize dialog text */
      content: string;
  }
  /**
   * Prevents the tour from advancing by clicking the backdrop.
   * This should only be set if you are completely sure your tour is displaying correctly on all screen sizes otherwise a user can get stuck.
   */
  preventBackdropFromAdvancing?: boolean;
}
