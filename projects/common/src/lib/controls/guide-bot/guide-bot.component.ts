import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GuideBotEventService } from '../../services/guide-bot-event.service';
import { GuideBotScreenPosition } from '../../models/guide-bot/guide-bot-position.enum';
import { GuidedTourService } from '../../services/guided-tour.service';
import { GuideBotSubItem } from '../../models/guide-bot/guide-bot-sub-item.model';
import { GuidedTour } from '../../models/guided-tour/guided-tour.model';
import { TourStep } from '../../models/guided-tour/tour-step.model';

@Component({
  selector: 'lcu-guide-bot',
  templateUrl: './guide-bot.component.html',
  styleUrls: ['./guide-bot.component.scss']
})
export class GuideBotComponent implements OnInit {
  public IsChatOpen: boolean = false;

  private readonly FIRST_TIME_KEY: string = 'first-time-user';

  @Input('bot-padding') public BotPadding: number = 5;
  @Input('bot-scale') public BotScale: number = 1;
  @Input('bot-screen-position') public BotLogoPosition: GuideBotScreenPosition = GuideBotScreenPosition.BottomLeft;
  @Input('bot-sub-items') public BotSubItems: GuideBotSubItem[] = this.setDefaultBotSubItems();
  @Input('bounding-element-selector') public BoundingElementSelector: string = 'body';
  @Input('enable-chat') public ChatEnabled: boolean = false;
  @Input('enable-first-time-popup') public FirstTimePopupEnabled: boolean = false;
  @Input('tour') public Tour: GuidedTour;

  @Output('on-complete') public OnCompleteEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output('on-skipped') public OnSkippedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output('on-step-closed') public OnStepClosedEvent: EventEmitter<TourStep> = new EventEmitter<TourStep>();
  @Output('on-step-opened') public OnStepOpenedEvent: EventEmitter<TourStep> = new EventEmitter<TourStep>();

  constructor(
    private guideBotEventService: GuideBotEventService,
    private guidedTourService: GuidedTourService
  ) {
    this.guidedTourService.isTourOpenStream.subscribe(
      (isTourOpen: boolean) => {
        if (this.FirstTimePopupEnabled && !isTourOpen) {
          this.setFirstTimeKey(false);
        }
      }
    );
    this.guidedTourService.onTourCompleteStream.subscribe(
      () => {
        this.OnCompleteEvent.emit();
      }
    );
    this.guidedTourService.onTourSkippedStream.subscribe(
      () => {
        this.OnSkippedEvent.emit();
      }
    );
    this.guidedTourService.onStepClosedActionStream.subscribe(
      (step: TourStep) => {
        this.OnStepClosedEvent.emit(step);
      }
    );
    this.guidedTourService.onStepOpenedActionStream.subscribe(
      (step: TourStep) => {
        this.OnStepOpenedEvent.emit(step);
      }
    );
    this.guideBotEventService.GetBotToggledEvent().subscribe(
      (isBotOpen: boolean) => {
        this.IsChatOpen = isBotOpen ? true : false;
      }
    );
  }

  public ngOnInit(): void {
    if (this.FirstTimePopupEnabled) {
      this.firstTimeSetup();
    }
  }

  public OnTourStarted(isStarted: boolean): void {
    if (isStarted) {
      this.guidedTourService.startTour(this.Tour);
    }
  }

  /**
   * Sets up Thinky to popup with Tour on first time loading app
   * TODO: We need to use a State for this
   */
  private firstTimeSetup() {
    if (this.isFirstTimeUser()) {
      this.setFirstTimeKey(true);

      setTimeout(() => {
        this.OnTourStarted(true);
      }, 2000);
    }
  }

  private isFirstTimeUser(): boolean {
    return localStorage.getItem(this.FIRST_TIME_KEY)
        && localStorage.getItem(this.FIRST_TIME_KEY) === 'false'
         ? false : true;
  }

  private setFirstTimeKey(isFirstTime: boolean) {
    localStorage.setItem(this.FIRST_TIME_KEY, String(isFirstTime));
  }

  private setDefaultBotSubItems(): GuideBotSubItem[] {
    return [
      new GuideBotSubItem({ label: 'Start Tour', icon: 'all_out', action: () => this.OnTourStarted(true) }),
      new GuideBotSubItem({ label: 'Toggle Chat', icon: 'chat_bubble_outline', action: () => this.toggleChat() }),
      new GuideBotSubItem({ label: 'About Thinky', icon: 'info_outline', action: () => { console.log('Thinky is cool.'); } })
    ];
  }

  private toggleChat(): void {
    this.guideBotEventService.EmitChatToggledEvent();
  }
}
