import { Component, OnInit } from '@angular/core';
import { AppEventService } from '../../app-event.service';

@Component({
  selector: 'lcu-journeys',
  templateUrl: './journeys.component.html',
  styleUrls: ['./journeys.component.scss']
})
export class JourneysComponent implements OnInit {
  public BotPadding: number = 5;
  public BotPositions: any[];
  public BotScale: number = 1;
  public BoundsContainers: string[];
  public CurrentContainer: string;
  public CurrentPosition: any;
  public CurrentTourLookup: string;
  public SelectedTabIndex: number = 0;
  public Tours: string[];

  constructor(
    private appEventService: AppEventService
  ) {
    this.BotPositions = [
      'BottomLeft', 'BottomRight', 'TopLeft', 'TopRight'
    ];
    this.BoundsContainers = [
      'body', '.lcu-content', '#boundingBox'
    ];
    this.Tours = [
      'demo-tour', 'limited-trial-tour'
    ];
    this.CurrentPosition = this.BotPositions[0];
    this.CurrentContainer = this.BoundsContainers[0];
    this.appEventService.GetTabIndexEvent().subscribe(
      (tabIndex: number) => {
        this.SelectedTabIndex = tabIndex;
      }
    );
  }

  public ngOnInit(): void { }

  public OnPositionChanged(): void {
    this.appEventService.EmitPositionChangedEvent(this.CurrentPosition);
  }

  public OnBoundsContainerChanged(): void {
    this.appEventService.EmitBoundsContainerChangedEvent(this.CurrentContainer);
  }

  public OnBotPaddingChanged(): void {
    this.appEventService.EmitBotPaddingChangedEvent(this.BotPadding);
  }

  public OnBotScaleChanged(): void {
    this.appEventService.EmitBotScaleChangedEvent(this.BotScale);
  }

  public OnStartTour(): void {
    this.appEventService.EmitStartTourEvent('demo-tour');
  }

  public OnTourChanged(): void {
    this.appEventService.EmitTourChangedEvent(this.CurrentTourLookup);
  }

}
