import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GuideBotEventService } from '../../services/guide-bot-event.service';
import { GuideBotScreenPosition } from '../../models/guide-bot/guide-bot-position.enum';
import { GuidedTourService } from '../../services/guided-tour.service';
import { GuideBotSubItem } from '../../models/guide-bot/guide-bot-sub-item.model';
import { GuidedTour } from '../../models/guided-tour/guided-tour.model';
import { TourStep } from '../../models/guided-tour/tour-step.model';
import { GuidedTourManagementStateContext } from '../../state/guided-tour-management-state.context';
import { GuidedTourManagementState } from '../../state/guided-tour-management.state';
import { ChatTourButton } from '../../models/guide-bot/chat-tour-button.model';

@Component({
  selector: 'lcu-guide-bot',
  templateUrl: './guide-bot.component.html',
  styleUrls: ['./guide-bot.component.scss']
})
export class GuideBotComponent implements OnInit {
  public IsChatOpen: boolean = false;
  public State: GuidedTourManagementState;

  @Input('bot-padding') public BotPadding: number = 5;
  @Input('bot-scale') public BotScale: number = 1;
  @Input('bot-screen-position') public BotLogoPosition: GuideBotScreenPosition = GuideBotScreenPosition.BottomLeft;
  @Input('bot-sub-items') public BotSubItems: GuideBotSubItem[] = this.setDefaultBotSubItems();
  @Input('bounding-element-selector') public BoundingElementSelector: string = 'body';
  @Input('enable-chat') public ChatEnabled: boolean = false;
  @Input('enable-first-time-popup') public FirstTimePopupEnabled: boolean = false;
  @Input('tour') public Tour: GuidedTour;
  @Input('tour-buttons') public TourButtons: ChatTourButton[] = [];

  @Output('on-complete') public OnCompleteEvent: EventEmitter<GuidedTour> = new EventEmitter<GuidedTour>();
  @Output('on-skipped') public OnSkippedEvent: EventEmitter<GuidedTour> = new EventEmitter<GuidedTour>();
  @Output('on-step-closed') public OnStepClosedEvent: EventEmitter<TourStep> = new EventEmitter<TourStep>();
  @Output('on-step-opened') public OnStepOpenedEvent: EventEmitter<TourStep> = new EventEmitter<TourStep>();

  constructor(
    protected guideBotEventService: GuideBotEventService,
    protected guidedTourService: GuidedTourService,
    protected guidedTourState: GuidedTourManagementStateContext
  ) {
    this.guidedTourService.isTourOpenStream.subscribe(
      (isTourOpen: boolean) => {
        if (isTourOpen) {
          console.warn('TOUR IS OPENED!');
           // Turns on functionality to continue where the user left off.
          this.guidedTourService.SetCurrentStepIndex(this.State.StepRecords, this.State.CurrentTour);
        }
      }
    );
    this.guidedTourService.onTourCompleteStream.subscribe(
      (tour: GuidedTour) => {
        this.OnCompleteEvent.emit(tour);
        const stepLookup = tour.Steps[(tour.Steps.length - 1)].Lookup;
        this.recordStep(stepLookup, true);
      }
    );
    this.guidedTourService.onTourSkippedStream.subscribe(
      (tour: GuidedTour) => {
        this.OnSkippedEvent.emit(tour);
        const stepLookup = this.State.StepRecords[tour.Lookup].CurrentStep;
        this.recordStep(stepLookup, true);
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
        this.recordStep(step.Lookup);
      }
    );
    this.guideBotEventService.GetBotToggledEvent().subscribe(
      (isBotOpen: boolean) => {
        this.IsChatOpen = isBotOpen ? true : false;
      }
    );

    this.guideBotEventService.GetChatTourStartedEvent().subscribe(
      (lookup: string) => {
        this.guidedTourState.SetActiveTour(lookup);
        setTimeout(() => {
          this.guidedTourService.startTour(this.State.CurrentTour);
        }, 1500);
      }
    );
  }

  public ngOnInit(): void {
    this.guidedTourState.Context.subscribe((state: GuidedTourManagementState) => {
      this.State = state;

      this.stateChanged();
    });
  }

  public OnTourStarted(isStarted: boolean): void {
    if (isStarted) {
      this.guidedTourService.startTour(this.Tour);
    }
  }

  protected stateChanged(): void {
    console.warn('guide-bot stateChanged()');
    if (this.State.CurrentTour) {
      this.firstTimeSetup();
    }
  }

  /**
   * Sets up Thinky to popup with Tour on first time loading app
   */
  protected firstTimeSetup() {
    if (this.FirstTimePopupEnabled && this.isFirstTimeUser()) {
      if (!this.guidedTourService.onTourOpen) { // start only if a tour isn't already open
        setTimeout(() => {
          this.OnTourStarted(true);
        }, 1000);
      }
    }
  }

  protected isFirstTimeUser(): boolean {
    let isFirstTimeUser: boolean = true;

    if (this.State.CompletedTourLookups) {
      isFirstTimeUser = !this.State.CompletedTourLookups[this.State.CurrentTour.Lookup];
    }
    console.warn('isFirstTimeUser() returning: ', isFirstTimeUser);
    return isFirstTimeUser;
  }

  protected recordStep(stepLookup: string, isComplete: boolean = false): void {
    console.warn('Recording current step: ', stepLookup);
    if (stepLookup) {
      this.guidedTourState.RecordStep(this.State.CurrentTour.Lookup, stepLookup, isComplete);
    }
  }

  protected setDefaultBotSubItems(): GuideBotSubItem[] {
    return [
      new GuideBotSubItem({ label: 'Start Tour', icon: 'all_out', action: () => this.OnTourStarted(true) }),
      new GuideBotSubItem({ label: 'Toggle Chat', icon: 'chat_bubble_outline', action: () => this.toggleChat() }),
      new GuideBotSubItem({ label: 'About Thinky', icon: 'info_outline', action: () => { console.log('Thinky is cool.'); } })
    ];
  }

  protected toggleChat(): void {
    this.guideBotEventService.EmitChatToggledEvent();
  }
}
