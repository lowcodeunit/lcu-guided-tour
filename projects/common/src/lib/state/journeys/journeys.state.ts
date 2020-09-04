import { Application } from '@lcu/common';

/**
 * Model class for state data
 */
export class LimitedJourneysManagementState {
  public CurrentJourneyLookup?: string;

  public IoTData?: JourneysIoTDetails[];

  public IsIoTStarter?: boolean;

  public Journeys?: JourneyOption[];

  public Loading?: boolean;
}

export class JourneysIoTDetails {
  public Color?: string;

  public Name?: string;

  public Data: { [name: string]: number };
}

export class JourneyOption {
  public ActionURL: string;

  public Active: boolean;

  public ComingSoon: boolean;

  public ContentType: JourneyContentTypes;

  public ContentURL: string;

  public Description: string;

  public Details: JourneyOptionDetails;

  public HighlightedOrder?: number;

  public Lookup: string;

  public Name: string;

  public Roles: string[];

  public Uses: string[];
}

export class JourneyOptionDetails {
  public Abstract: string[];

  public Documentation: { [title: string]: string };

  public RelatedJourneys: { [title: string]: string };

  public Support: { [title: string]: string };
}

export enum JourneyContentTypes {
  Image = 'Image',

  Video = 'Video',
}
