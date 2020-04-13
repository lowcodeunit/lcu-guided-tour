import { Injectable, EventEmitter } from '@angular/core';
import { GuideBotScreenPosition } from '@lowcodeunit/lcu-guided-tour-common';

@Injectable({
  providedIn: 'root'
})
export class AppEventService {
  private botPaddingChangedEvent: EventEmitter<number>;
  private boundsContainerChangedEvent: EventEmitter<string>;
  private positionChangedEvent: EventEmitter<GuideBotScreenPosition>;
  private startTourEvent: EventEmitter<any>;

  constructor() {
    this.botPaddingChangedEvent = new EventEmitter<number>();
    this.boundsContainerChangedEvent = new EventEmitter<string>();
    this.positionChangedEvent = new EventEmitter<GuideBotScreenPosition>();
    this.startTourEvent = new EventEmitter<any>();
  }

  public EmitBotPaddingChangedEvent(padding: number): void {
    this.botPaddingChangedEvent.emit(padding);
  }

  public GetBotPaddingChangedEvent(): EventEmitter<number> {
    return this.botPaddingChangedEvent;
  }

  public EmitBoundsContainerChangedEvent(container: string): void {
    this.boundsContainerChangedEvent.emit(container);
  }

  public GetBoundsContainerChangedEvent(): EventEmitter<string> {
    return this.boundsContainerChangedEvent;
  }

  public EmitPositionChangedEvent(position: GuideBotScreenPosition): void {
    this.positionChangedEvent.emit(position);
  }

  public GetPositionChangedEvent(): EventEmitter<GuideBotScreenPosition> {
    return this.positionChangedEvent;
  }

  public EmitStartTourEvent(): void {
    this.startTourEvent.emit();
  }

  public GetStartTourEvent(): EventEmitter<any> {
    return this.startTourEvent;
  }
}
