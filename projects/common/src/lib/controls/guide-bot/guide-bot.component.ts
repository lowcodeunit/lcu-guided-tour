import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { GuideBotEventService } from '../../services/guide-bot-event.service';
import { GuideBotScreenPosition } from '../../models/guide-bot-position.enum';
import { GuidedTour } from '../../models/guided-tour.model';
import { GuidedTourService } from '../../services/guided-tour.service';
import { GuideBotSubItem } from '../../models/guide-bot-sub-item.model';

@Component({
  selector: 'lcu-guide-bot',
  templateUrl: './guide-bot.component.html',
  styleUrls: ['./guide-bot.component.scss']
})
export class GuideBotComponent implements OnInit {
  public IsChatOpen: boolean = false;

  @Input('bot-screen-position') public BotLogoPosition: GuideBotScreenPosition = GuideBotScreenPosition.BottomLeft;

  @Input('bounding-element-selector') public BoundingElementSelector: string = 'body';

  @Input('bot-padding') public BotPadding: number = 5;

  @Input('bot-sub-items') public BotSubItems: GuideBotSubItem[] = this.setDefaultBotSubItems();

  @Input('enable-chat') public ChatEnabled: boolean = true;

  @Input('tour') public Tour: GuidedTour;

  constructor(
    private guideBotEventService: GuideBotEventService,
    private guidedTourService: GuidedTourService
  ) {
    this.guideBotEventService.GetBotToggledEvent().subscribe(
      (isBotOpen: boolean) => {
        this.IsChatOpen = isBotOpen ? true : false;
      }
    );
  }

  public ngOnInit(): void { }

  public OnTourStarted(isStarted: boolean): void {
    if (isStarted) {
      this.guidedTourService.startTour(this.Tour);
    }
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
