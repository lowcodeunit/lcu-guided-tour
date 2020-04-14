import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ThemeColorPickerService } from '@lcu/common';
import { GuidedTourService, GuidedTour, TourStep, Orientation, GuideBotScreenPosition, GuideBotSubItem, GuideBotEventService } from '@lowcodeunit/lcu-guided-tour-common';
import { AppEventService } from './app-event.service';

@Component({
  selector: 'lcu-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public BotBoundingContainer: string = '#boundingBox';
  public BotPadding: number = 5;
  public BotScreenPosition: GuideBotScreenPosition = GuideBotScreenPosition.BottomLeft;
  public BotSubItems: GuideBotSubItem[];
  public DemoTour: GuidedTour;
  public EnableChat: boolean = true;
  public ThemeClass: BehaviorSubject<string>;
  public Themes: Array<any>;
  public Title = 'LCU-Guided-Tour';

  constructor(
    private appEventService: AppEventService,
    private guideBotEventService: GuideBotEventService,
    private guidedTourService: GuidedTourService,
    private themeService: ThemeColorPickerService
  ) {
    this.BotSubItems = this.setBotSubItems();
    this.DemoTour = {
      tourId: 'demo-tour',
      useOrb: false,
      steps: this.setupTourSteps()
    };
    this.appEventService.GetPositionChangedEvent().subscribe(
      (position: GuideBotScreenPosition) => {
        this.BotScreenPosition = position;
      }
    );
    this.appEventService.GetBoundsContainerChangedEvent().subscribe(
      (container: string) => {
        this.BotBoundingContainer = container;
      }
    );
    this.appEventService.GetBotPaddingChangedEvent().subscribe(
      (padding: number) => {
        this.BotPadding = padding;
      }
    );
    this.appEventService.GetStartTourEvent().subscribe(
      () => {
        this.startTour();
      }
    );
  }

  public ngOnInit(): void {
    this.resetTheme();
    this.setThemes();
  }

  /** THEME PICKER */
  public PickTheme(color: string): void {
    this.themeService.SetColorClass(`fathym-${color}-theme`);
  }

  protected resetTheme(): void {
    this.ThemeClass = this.themeService.GetColorClass();
  }

  protected setThemes(): void {
    this.Themes = [
      { ColorSwatch: 'color-swatch-arctic', Icon: 'brightness_1', Label: 'Arctic Theme', Value: 'arctic-theme', Color: 'arctic' },
      { ColorSwatch: 'color-swatch-contrast', Icon: 'brightness_1', Label: 'Contrast Theme', Value: 'contrast-theme', Color: 'contrast' },
      { ColorSwatch: 'color-swatch-cool-candy', Icon: 'brightness_1', Label: 'Cool Candy Theme', Value: 'cool-candy-theme', Color: 'cool-candy' },
      { ColorSwatch: 'color-swatch-flipper', Icon: 'brightness_1', Label: 'Flipper Theme', Value: 'flipper-theme', Color: 'flipper' },
      { ColorSwatch: 'color-swatch-ice', Icon: 'brightness_1', Label: 'Ice Theme', Value: 'ice-theme', Color: 'ice' },
      { ColorSwatch: 'color-swatch-sea-green', Icon: 'brightness_1', Label: 'Sea Green Theme', Value: 'sea-green-theme', Color: 'sea-green' },
      { ColorSwatch: 'color-swatch-white-mint', Icon: 'brightness_1', Label: 'White Mint Theme', Value: 'white-mint-theme', Color: 'white-mint' },
      { ColorSwatch: 'color-swatch-ivy', Icon: 'brightness_1', Label: 'Ivy Theme', Value: 'ivy-theme', Color: 'ivy' }
    ];
  }

  /** GUIDED TOUR */
  private startTour(): void {
    this.guidedTourService.startTour(this.DemoTour);
  }

  private setupTourSteps(): TourStep[] {
    return [
      {
        title: 'LCU-Guided-Tour',
        subtitle: 'Guided Tour',
        content: `Welcome to the LCU-Guided-Tour library! This library provides the functionality to do your own guided tour
        of an application. Click the 'Next' button to get started with an example Tour!`
      },
      {
        title: 'Title',
        subtitle: 'Guided Tour',
        selector: '#guidedTourHeader',
        content: `With the LCU-Guided-Tour, you can select anything that is on the screen that has a valid CSS selector.
        For example, you can select this title, which as an id of #guidedTourHeader.
        Valid selectors are as follows: .class, #id, element`,
        orientation: Orientation.Bottom
      },
      {
        title: 'First Paragraph',
        subtitle: 'Guided Tour',
        selector: 'p',
        content: `Here, we are selecting the first paragraph element on the screen with 'p'.`,
        orientation: Orientation.BottomRight
      },
      {
        title: 'Second Paragraph',
        subtitle: 'Guided Tour',
        selector: '#p2',
        content: `Here, we are selecting the second paragraph, with has an id of #p2, in which we are targeting.`,
        orientation: Orientation.Top
      },
      {
        title: 'Complex Selectors',
        subtitle: 'Guided Tour',
        selector: '.section:nth-of-type(2) .mat-radio-button:nth-child(3)',
        content: `You can even target more specific, complex elements, by using various built-in CSS selectors. In
        this case, we are targeting the third radio item in the second section with the selector of:
        .section:nth-of-type(2) .mat-radio-button:nth-child(3)`,
        orientation: Orientation.Right
      },
      {
        title: 'Modifiers',
        subtitle: 'Guided Tour',
        selector: '#formBox',
        content: `As for the bot, you can modify certain properties of it in order to customize it to your needs.
        Here we can change the position it lives on the screen, the container it should position itself in, as well
        as the amount of padding we would like to have between the bot and the container.`,
        orientation: Orientation.Right
      },
      {
        title: 'Bounding Container',
        subtitle: 'Guided Tour',
        selector: '#boundingBox',
        content: `As an example, you can set the Bot to be positioned inside this box by setting the container to
        the #boundingBox selector.`,
        orientation: Orientation.Left
      },
      {
        title: 'Start Tour',
        subtitle: 'Guided Tour',
        selector: '.mat-stroked-button:first-of-type',
        content: `Whenever you want to start the tour again, you can press this button or the 'tour' button on Thinky!`,
        orientation: Orientation.BottomLeft
      }
    ];
  }

  private setBotSubItems(): GuideBotSubItem[] {
    return [
      new GuideBotSubItem({ label: 'Start Tour', icon: 'all_out', action: () => this.startTour() }),
      new GuideBotSubItem({ label: 'Toggle Chat', icon: 'chat_bubble_outline', action: () => this.toggleChat() })
    ];
  }

  private toggleChat(): void {
    this.guideBotEventService.EmitChatToggledEvent();
  }
}
