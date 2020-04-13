import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnChanges,
  HostListener,
  SimpleChanges,
  SimpleChange,
  Output,
  EventEmitter,
} from '@angular/core';
import { GuideBotEventService } from '../../../services/guide-bot-event.service';
import { GuideBotScreenPosition } from '../../../models/guide-bot-position.enum';
import { GuideBotSubItem } from '../../../models/guide-bot-sub-item.model';
import { GuidedTourService } from '../../../services/guided-tour.service';
import { TourStep } from '../../../models/tour-step.model';

@Component({
  selector: 'lcu-guide-bot-logo',
  templateUrl: './bot-logo.component.html',
  styleUrls: ['./bot-logo.component.scss']
})
export class GuideBotLogoComponent implements OnInit, AfterViewInit, OnChanges {
  public IsTourOpen: boolean = false;
  public ScrollHeight: number = null;
  public ShowBotSubItems: boolean = false;

  private boundingElementRect: DOMRect;

  @Input('bot-logo-position') public BotLogoPosition: GuideBotScreenPosition = GuideBotScreenPosition.BottomLeft;
  @Input('bot-padding') public BotPadding: number = 5;
  @Input('bot-sub-items') public BotSubItems: GuideBotSubItem[];
  @Input('bounding-element-selector') public BoundingElementSelector: string = '#boundingBox';

  @Output('tour-started-event') public TourStartedEvent: EventEmitter<boolean>;

  @ViewChild('bounce', { static: false }) public bounce: ElementRef;
  @ViewChild('bubbles', { static: false }) public bubbles: ElementRef;
  @ViewChild('guide', { static: false }) public guide: ElementRef;

  constructor(
    private guideBotEventService: GuideBotEventService,
    private guidedTourService: GuidedTourService,
    private renderer: Renderer2
  ) {
    this.TourStartedEvent = new EventEmitter<boolean>();
    this.guidedTourService.isTourOpenStream.subscribe(
      (isTourOpen: boolean) => {
        this.IsTourOpen = isTourOpen;
      }
    );
    this.guidedTourService.guidedTourCurrentStepStream.subscribe(
      (currentStep: TourStep) => {
        if (currentStep) {
          this.calculateBotTourPosition();
        } else {
          this.anchorBotToSelector();
        }
      }
    );
  }

  public ngOnInit(): void { }

  public ngOnChanges(changes: SimpleChanges): void {
    const isFirstChange = Object.values(changes).some((change: SimpleChange) => change.isFirstChange());
    if (!isFirstChange) {
      console.log('BOT ------ ngOnChanges: ', changes);
      this.boundingElementRect = document.querySelector(this.BoundingElementSelector).getBoundingClientRect() as DOMRect;
      this.setScreenPosition();
    }
  }

  public ngAfterViewInit(): void {
    console.log('BOT ------ ngAfterViewInit()');
    this.anchorBotToSelector();
    this.boundingElementRect = document.querySelector(this.BoundingElementSelector).getBoundingClientRect() as DOMRect;
  }

  @HostListener('window:resize', ['$event'])
  public onResize(_: any) {
    this.boundingElementRect = document.querySelector(this.BoundingElementSelector).getBoundingClientRect() as DOMRect;
    this.setScreenPosition(); // TODO: Make responsive with the Tour on
  }

  @HostListener('window:scroll', ['$event'])
  public onScroll(_: any) {
    /** TODO: Need to configure whether the bot is in a 'fixed' and a 'relative' position when scrolling */
    // this.boundingElementRect = document.querySelector(this.BoundingElementSelector).getBoundingClientRect() as DOMRect;
    // this.setScreenPosition();
  }

  public ToggleBotSubItems(): void {
    this.ShowBotSubItems = !this.ShowBotSubItems;
    this.guideBotEventService.EmitBotToggledEvent(this.ShowBotSubItems);
    this.anchorBotToSelector();
  }

  private anchorBotToSelector(): void {
    console.log('BOT ------ anchorBotToSelector()');
    if (!this.IsTourOpen) {
      setTimeout(() => {
        this.triggerBotBounceAnim();
        this.renderer.removeClass(this.guide.nativeElement, 'play');

        if (this.ShowBotSubItems) {
          for (const child of this.bubbles.nativeElement.children) {
            this.renderer.addClass(child, 'play-bubble');
          }
          this.renderer.addClass(this.guide.nativeElement, 'play');
        }

        this.setScreenPosition();
      }, 100);
    }
  }

  private calculateBotTourPosition(): void {
    console.log('BOT ------ calculateBotTourPosition()');
    setTimeout(() => {
      this.renderer.removeClass(this.guide.nativeElement, 'play');
      const selectedTourItem = document.querySelector('.tour-step');
      if (selectedTourItem) {
        const selectedTourItemPos = (selectedTourItem.getBoundingClientRect() as DOMRect);

        const botWidth: number = 100;
        const centerPos: number = ((selectedTourItemPos.right + selectedTourItemPos.left) / 2) - (botWidth / 2);

        this.renderer.setStyle(this.guide.nativeElement, 'top', (selectedTourItemPos.top - 75) + 'px');
        this.renderer.setStyle(this.guide.nativeElement, 'left', centerPos + 'px');
        this.renderer.addClass(this.guide.nativeElement, 'play');
        this.triggerBotBounceAnim();
      }
    }, 100);
  }

  private triggerBotBounceAnim(): void {
    this.renderer.removeClass(this.bounce.nativeElement, 'play');
    void this.bounce.nativeElement.offsetWidth; // Resets the animation properly (i.e. Magic)
    this.renderer.addClass(this.bounce.nativeElement, 'play');
  }

  private setScreenPosition(x: number = this.BotPadding, y: number = this.BotPadding): void {
    console.log('BOT ------ setScreenPosition()');
    if (this.boundingElementRect) {
      let pos1 = x ? x : this.BotPadding;
      let pos2 = y ? y : this.BotPadding;
      const logoSideDimension: number = 100;
      const logoContainerHeight: number = 220;
      if (this.ShowBotSubItems) {
        pos1 += logoContainerHeight;
      } else {
        pos1 += logoSideDimension;
      }

      let topPos = 0;
      let leftPos = 0;

      switch (this.BotLogoPosition) {
        case GuideBotScreenPosition.BottomLeft:
          topPos = (this.boundingElementRect.y + this.boundingElementRect.height) - pos1;
          leftPos = (this.boundingElementRect.x + x);
          this.renderer.setStyle(this.guide.nativeElement, 'top', topPos + 'px');
          this.renderer.setStyle(this.guide.nativeElement, 'left', leftPos + 'px');
          this.renderer.removeStyle(this.guide.nativeElement, 'bottom');
          this.renderer.removeStyle(this.guide.nativeElement, 'right');
          break;
        case GuideBotScreenPosition.BottomRight:
          topPos = (this.boundingElementRect.y + this.boundingElementRect.height) - pos1;
          leftPos = (this.boundingElementRect.x + this.boundingElementRect.width) - logoSideDimension - x;
          this.renderer.setStyle(this.guide.nativeElement, 'top', topPos + 'px');
          this.renderer.setStyle(this.guide.nativeElement, 'left', leftPos + 'px');
          this.renderer.removeStyle(this.guide.nativeElement, 'bottom');
          this.renderer.removeStyle(this.guide.nativeElement, 'right');
          break;
        case GuideBotScreenPosition.TopLeft:
          topPos = (this.boundingElementRect.y + y);
          leftPos = (this.boundingElementRect.x + x);
          this.renderer.setStyle(this.guide.nativeElement, 'top', topPos + 'px');
          this.renderer.setStyle(this.guide.nativeElement, 'left', leftPos + 'px');
          this.renderer.removeStyle(this.guide.nativeElement, 'bottom');
          this.renderer.removeStyle(this.guide.nativeElement, 'right');
          break;
        case GuideBotScreenPosition.TopRight:
          topPos = (this.boundingElementRect.y + y);
          leftPos = (this.boundingElementRect.x + this.boundingElementRect.width) - logoSideDimension - x;
          this.renderer.setStyle(this.guide.nativeElement, 'top', topPos + 'px');
          this.renderer.setStyle(this.guide.nativeElement, 'left', leftPos + 'px');
          this.renderer.removeStyle(this.guide.nativeElement, 'bottom');
          this.renderer.removeStyle(this.guide.nativeElement, 'right');
          break;
        default:
          break;
      }
      this.guideBotEventService.EmitBotMovedEvent();
    } else {
      console.error(`ERROR: Couldn't find DOM element with selector: ${this.BoundingElementSelector}`);
    }
  }
}
