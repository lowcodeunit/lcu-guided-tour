import { Component, OnInit } from '@angular/core';
import { AppEventService } from '../../app-event.service';

@Component({
  selector: 'lcu-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public BotPadding: number = 5;
  public BotPositions: any[];
  public BotScale: number = 1;
  public BoundsContainers: string[];
  public CurrentContainer: string;
  public CurrentPosition: any;
  public SelectedTabIndex: number = 0;

  constructor(
    private appEventService: AppEventService
  ) {
    this.BotPositions = [
      'BottomLeft', 'BottomRight', 'TopLeft', 'TopRight'
    ];
    this.BoundsContainers = [
      'body', '.lcu-content', '#boundingBox'
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

  public OnBotPaddingChange(): void {
    this.appEventService.EmitBotPaddingChangedEvent(this.BotPadding);
  }

  public OnBotScaleChange(): void {
    this.appEventService.EmitBotScaleChangedEvent(this.BotScale);
  }

  public OnStartTour(): void {
    this.appEventService.EmitStartTourEvent();
  }

}
