import { Component, OnInit, ViewChildren, ViewChild, QueryList, ElementRef, Renderer2, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatMessage, MessageType } from '../../../models/guide-bot/chat-message.model';
import { GuideBotEventService } from '../../../services/guide-bot-event.service';
import { GuidedTourService } from '../../../services/guided-tour.service';
import { ChatTourButton } from '../../../models/guide-bot/chat-tour-button.model';

@Component({
  selector: 'lcu-guide-bot-chat',
  templateUrl: './bot-chat.component.html',
  styleUrls: ['./bot-chat.component.scss']
})
export class GuideBotChatComponent implements OnInit {
  public BotMessages: ChatMessage[];
  public IsBotThinking: boolean = false;
  public IsChatVisible: boolean;
  public QuestionFormControl: FormControl;
  public ScrollHeight: number = null;

  @Input('enable-chat') public ChatEnabled: boolean;
  @Input('tour-buttons') public TourButtons: ChatTourButton[];

  @ViewChildren('customMsg') public customMsgs: QueryList<ElementRef>;
  @ViewChild('chat', { static: false }) public chat: ElementRef;
  @ViewChild('messageContainer', { static: false }) public messageContainer: ElementRef;
  @ViewChild('customMsg', { static: false }) public customMsg: ElementRef;

  constructor(
    protected guideBotEventService: GuideBotEventService,
    protected guidedTourService: GuidedTourService,
    protected renderer: Renderer2
  ) {
    this.IsChatVisible = true;
    this.QuestionFormControl = new FormControl('');
    this.BotMessages = [
      new ChatMessage({ message: `Hi! I'm Thinky™ and I'm here to help.`}),
      new ChatMessage({ message: `For a guided experience on this app, click on the desired button below.` }),
      new ChatMessage({ message: `Otherwise, type your specific question!`})
    ];
    this.guidedTourService.isTourOpenStream.subscribe(
      (tourLookup: string) => {
        this.IsChatVisible = tourLookup ? false : true;
      }
    );
    this.guideBotEventService.GetChatToggledEvent().subscribe(
      () => {
        this.IsChatVisible = !this.IsChatVisible;
        this.anchorChatToBotLogo();
      }
    );
    this.guideBotEventService.GetBotMovedEvent().subscribe(
      () => {
        this.anchorChatToBotLogo(600);
      }
    );

  }

  public ngOnInit(): void { }

  public OnBotChatClosed(): void {
    this.IsChatVisible = false;
  }

  public OnMessageEntered(): void {
    this.PublishMessage(this.QuestionFormControl.value, 'USER');
    this.parseMessage(this.QuestionFormControl.value);
    this.QuestionFormControl.patchValue('');
    this.QuestionFormControl.markAsPristine();
    this.IsBotThinking = true;
  }

  public PublishMessage(msg: string, type?: MessageType): void {
    const msgType = type ? type : 'BOT';
    this.BotMessages.push(
      new ChatMessage({ message: msg, type: msgType })
    );
    setTimeout(() => {
      this.ScrollHeight = this.messageContainer.nativeElement.scrollHeight;
    }, 100);
  }

  public StartTourByLookup(tourButton: ChatTourButton) {
    this.guideBotEventService.EmitChatTourStartedEvent(tourButton.Lookup);
    if (tourButton.OpenAction) {
      tourButton.OpenAction();
    }
  }

  protected anchorChatToBotLogo(milliSeconds: number = 0): void {
    setTimeout(() => {
      if (this.ChatEnabled && this.IsChatVisible) {
        const selectedDomItem = document.querySelector('.thinky-guide');

        if (selectedDomItem) {
          const selectedDomItemPos = (selectedDomItem.getBoundingClientRect() as DOMRect);
          const logoSideDimision: number = 100;
          const chatWidth: number = 365;
          const topPos = (selectedDomItemPos.y);
          let leftPos = (selectedDomItemPos.x + logoSideDimision);

          if (window.innerWidth < (leftPos + chatWidth)) {
            leftPos = selectedDomItemPos.x - chatWidth - 10;
          }

          this.renderer.setStyle(this.chat.nativeElement, 'top', topPos + 'px');
          this.renderer.setStyle(this.chat.nativeElement, 'left', leftPos + 'px');
          this.renderer.removeStyle(this.chat.nativeElement, 'bottom');
          this.renderer.removeStyle(this.chat.nativeElement, 'right');

        }
      }
    }, milliSeconds);
  }

  /**
   * Little Easter Egg :D
   */
  protected customMessage(): void {
    this.PublishMessage(``);
    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'height', '100');
    this.renderer.setAttribute(img, 'width', '100');
    this.renderer.setAttribute(img, 'src', 'https://d17zbv0kd7tyek.cloudfront.net/wp-content/uploads/2015/06/leonardo-dicaprio-fb.jpg');

    setTimeout(() => {
      const parent = this.customMsgs.last;
      this.renderer.appendChild(parent.nativeElement, img);
    }, 500);
  }

  protected parseMessage(message: string): void {
    const msg = message.toLowerCase();
    if (msg.includes('kim') && msg.includes('actor')) {
      setTimeout(() => {
        this.customMessage();
        this.IsBotThinking = false;
      }, 2000);
    } else {
      setTimeout(() => {
        this.PublishMessage(`Hmmmmmm... Looks like Thinky can't find what you're looking for. Please try asking a different question.`);
        this.IsBotThinking = false;
      }, 5000);
    }
  }
}
