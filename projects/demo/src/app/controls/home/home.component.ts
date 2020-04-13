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
  public BoundsContainers: string[];
  public CurrentContainer: string;
  public CurrentPosition: any;

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

  public OnStartTour(): void {
    this.appEventService.EmitStartTourEvent();
  }

}
