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
import { GuideBotScreenPosition } from '../../../models/guide-bot/guide-bot-position.enum';
import { GuideBotSubItem } from '../../../models/guide-bot/guide-bot-sub-item.model';
import { GuidedTourService } from '../../../services/guided-tour.service';
import { TourStep } from '../../../models/guided-tour/tour-step.model';

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
  private logoInitialWidth: number;

  @Input('bot-logo-position') public BotLogoPosition: GuideBotScreenPosition;
  @Input('bot-padding') public BotPadding: number;
  @Input('bot-sub-items') public BotSubItems: GuideBotSubItem[];
  @Input('bot-scale') public BotScale: number;
  @Input('bounding-element-selector') public BoundingElementSelector: string;
  @Input('bot-z-index') public BotZIndex: number = 1110;

  @Output('tour-started-event') public TourStartedEvent: EventEmitter<boolean>;

  @ViewChild('bounce', { static: false }) public bounce: ElementRef;
  @ViewChild('bubbles', { static: false }) public bubbles: ElementRef;
  @ViewChild('guide', { static: false }) public guide: ElementRef;

  constructor(
    protected guideBotEventService: GuideBotEventService,
    protected guidedTourService: GuidedTourService,
    protected renderer: Renderer2
  ) {
    this.TourStartedEvent = new EventEmitter<boolean>();
    this.guidedTourService.isTourOpenStream.subscribe(
      (tourLookup) => {
        this.IsTourOpen = tourLookup ? true : false;
        this.setBotScale();
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
      this.findBoundingElementRect();
      this.logoInitialWidth = this.guide.nativeElement.offsetWidth;
      this.setBotScale();
      this.setScreenPosition();
    }
  }

  public ngAfterViewInit(): void {
    this.setBotScale();
    this.logoInitialWidth = this.guide.nativeElement.offsetWidth;
    setTimeout(() => { // setTimeout queues this task to run later in the thread. Prevents trying to find the element before it's rendered.
      this.findBoundingElementRect();
      if (this.boundingElementRect) {
        this.anchorBotToSelector();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  public onResize(_: any) {
    this.findBoundingElementRect();
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
    this.setBotScale();
    this.anchorBotToSelector();
  }

  protected anchorBotToSelector(): void {
    if (!this.IsTourOpen) {
      setTimeout(() => {
        this.triggerBotBounceAnim();
        this.renderer.removeClass(this.guide.nativeElement, 'play');

        if (this.ShowBotSubItems) {
          let time: number = 0.5;
          for (const child of this.bubbles.nativeElement.children) {
            this.renderer.addClass(child, 'play-bubble');
            this.renderer.setStyle(child, 'transition', `top .5s cubic-bezier(0.175, 0.885, 0.320, 1.275) ${time}s,
                                                         opacity .5s ease-in ${time}s,
                                                         width .2s ease-in .1s`);
            time += 0.15;
          }
          this.renderer.addClass(this.guide.nativeElement, 'play');
        }

        this.setScreenPosition();
      }, 100);
    }
  }

  protected calculateBotTourPosition(): void {
    setTimeout(() => {
      this.renderer.removeClass(this.guide.nativeElement, 'play');
      const selectedTourItem = document.querySelector('.tour-logo');
      if (selectedTourItem) {
        const selectedTourItemPos = (selectedTourItem.getBoundingClientRect() as DOMRect);

        this.renderer.setStyle(this.guide.nativeElement, 'top', selectedTourItemPos.y + 'px');
        this.renderer.setStyle(this.guide.nativeElement, 'left', selectedTourItemPos.x + 'px');
        this.renderer.addClass(this.guide.nativeElement, 'play');
        this.triggerBotBounceAnim();
      }
    }, 100);
  }

  protected findBoundingElementRect() {
    const element = document.querySelector(this.BoundingElementSelector);
    if (element) {
      this.boundingElementRect = element.getBoundingClientRect() as DOMRect;
    } else {
      console.warn(`BOT ------ findBoundingElementRect() could not find '${this.BoundingElementSelector}', getting 'body' instead`);
      this.boundingElementRect = document.querySelector('body').getBoundingClientRect() as DOMRect;
    }
  }

  protected triggerBotBounceAnim(): void {
    this.renderer.removeClass(this.bounce.nativeElement, 'play');
    void this.bounce.nativeElement.offsetWidth; // Resets the animation properly (i.e. Magic)
    this.renderer.addClass(this.bounce.nativeElement, 'play');
  }

  protected setBotScale() {
    const parent: any = this.renderer.parentNode(this.bounce.nativeElement);
    const scale: number = (this.IsTourOpen || this.ShowBotSubItems) ? 1 : this.BotScale;

    this.renderer.setStyle(parent, 'transform', `scale(${scale})`);
    this.renderer.setStyle(parent, 'margin', `calc(-37px * (1 - ${scale}))`);

    if (this.ShowBotSubItems) {
      this.renderer.setStyle(parent, 'transition', 'all 0.5s cubic-bezier(0.6, -0.28, 0.74, 0.05) 0s');
    } else {
      this.renderer.removeStyle(parent, 'transition');
    }
  }

  protected setScreenPosition(x: number = this.BotPadding, y: number = this.BotPadding): void {
    if (this.boundingElementRect) {
      let pos1 = x ? x : this.BotPadding;
      let pos2 = y ? y : this.BotPadding;
      const logoMaxSize: number = 95; // Size of logo at full scale(1). TODO: Make more dynamic in future
      const logoDimension: number = this.ShowBotSubItems ? logoMaxSize : this.logoInitialWidth;
      const bubblesContainer: any = document.querySelector('.thinky-bubbles');
      const logoContainerHeight: number = bubblesContainer ? bubblesContainer.getBoundingClientRect().height : 220;
      if (this.ShowBotSubItems) {
        pos1 += logoContainerHeight + logoDimension;
      } else {
        pos1 += logoDimension;
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
          leftPos = (this.boundingElementRect.x + this.boundingElementRect.width) - logoDimension - x;
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
          leftPos = (this.boundingElementRect.x + this.boundingElementRect.width) - logoDimension - x;
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
