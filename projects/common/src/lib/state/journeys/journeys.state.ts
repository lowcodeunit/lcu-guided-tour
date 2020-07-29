import { Application, DAFViewApplicationConfig } from '@lcu/common';

/**
 * Model class for state data
 */
export class LimitedJourneysManagementState {
  public ActiveJourneyLookup?: string;

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
  public Active: boolean;

  public ComingSoon: boolean;

  public ContentType: JourneyContentTypes;

  public ContentURL: string;

  public Description: string;

  public HighlightedOrder?: number;

  public Lookup: string;

  public Name: string;

  public Roles: string[];

  public Uses: string[];
}

export enum JourneyContentTypes {
  Image = 'Image',

  Video = 'Video',
}
