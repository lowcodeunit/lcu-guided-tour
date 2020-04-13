export interface OrientationConfiguration {
  /** Where the tour step will appear next to the selected element */
  orientationDirection: Orientation;
  /** When this orientation configuration starts in pixels */
  maximumSize?: number;
}

export class Orientation {
  public static readonly Bottom = 'bottom';
  public static readonly BottomLeft = 'bottom-left';
  public static readonly BottomRight = 'bottom-right';
  public static readonly Center = 'center';
  public static readonly Left = 'left';
  public static readonly Right = 'right';
  public static readonly Top = 'top';
  public static readonly TopLeft = 'top-left';
  public static readonly TopRight = 'top-right';
}
