import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GuideBotEventService {
  private botMovedEvent: EventEmitter<any>;
  private botToggledEvent: EventEmitter<boolean>;
  private chatToggledEvent: EventEmitter<boolean>;
  private chatTourStartedEvent: EventEmitter<string>;

  constructor() {
    this.botMovedEvent = new EventEmitter<any>();
    this.botToggledEvent = new EventEmitter<boolean>();
    this.chatToggledEvent = new EventEmitter<boolean>();
    this.chatTourStartedEvent = new EventEmitter<string>();
  }

  public EmitBotMovedEvent(): void {
    this.botMovedEvent.emit();
  }

  public GetBotMovedEvent(): EventEmitter<any> {
    return this.botMovedEvent;
  }

  public EmitBotToggledEvent(isBotOpen: boolean): void {
    this.botToggledEvent.emit(isBotOpen);
  }

  public GetBotToggledEvent(): EventEmitter<boolean> {
    return this.botToggledEvent;
  }

  public EmitChatToggledEvent(isChatOpen?: boolean): void {
    this.chatToggledEvent.emit(isChatOpen);
  }

  public GetChatToggledEvent(): EventEmitter<boolean> {
    return this.chatToggledEvent;
  }

  public EmitChatTourStartedEvent(lookup: string): void {
    this.chatTourStartedEvent.emit(lookup);
  }

  public GetChatTourStartedEvent(): EventEmitter<string> {
    return this.chatTourStartedEvent;
  }
}
