import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ThemeColorPickerService } from '@lcu/common';
import {
  GuidedTourService,
  TourStep,
  OrientationTypes,
  GuideBotScreenPosition,
  GuideBotSubItem,
  GuideBotEventService,
  GuidedTourManagementStateContext,
  GuidedTourManagementState
} from '@lowcodeunit/lcu-guided-tour-common';
import { AppEventService } from './app-event.service';

@Component({
  selector: 'lcu-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public BotBoundingContainer: string = '#boundingBox';
  public BotPadding: number = 5;
  public BotScale: number = 1;
  public BotScreenPosition: GuideBotScreenPosition = GuideBotScreenPosition.BottomLeft;
  public BotSubItems: GuideBotSubItem[];
  public EnableChat: boolean = true;
  public EnableFirstTimePopup: boolean = true;
  public State: GuidedTourManagementState;
  public ThemeClass: BehaviorSubject<string>;
  public Themes: Array<any>;
  public Title = 'LCU-Guided-Tour';

  constructor(
    protected appEventService: AppEventService,
    protected guideBotEventService: GuideBotEventService,
    protected guidedTour: GuidedTourManagementStateContext,
    protected guidedTourService: GuidedTourService,
    protected themeService: ThemeColorPickerService
  ) {
    this.BotSubItems = this.setBotSubItems();
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
    this.appEventService.GetBotScaleChangedEvent().subscribe(
      (scale: number) => {
        this.BotScale = scale;
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

    this.guidedTour.Context.subscribe((state: GuidedTourManagementState) => {
      this.State = state;

      this.stateChanged();
    });
  }

  public OnComplete(): void {
    console.log('Tour is Complete!');
  }

  public OnSkipped(): void {
    console.log('Skipping the tour.');
  }

  public OnStepClosed(step: TourStep): void {
    if (step.Selector === '#boxLogoForm') {
      this.appEventService.EmitTabIndexEvent(0);
    }
  }

  public OnStepOpened(step: TourStep): void {
    if (step.Selector === '#boxLogoForm') {
      this.appEventService.EmitTabIndexEvent(1);
    }
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
      {
        ColorSwatch: 'color-swatch-arctic',
        Icon: 'brightness_1',
        Label: 'Arctic Theme',
        Value: 'arctic-theme',
        Color: 'arctic',
      },
      {
        ColorSwatch: 'color-swatch-contrast',
        Icon: 'brightness_1',
        Label: 'Contrast Theme',
        Value: 'contrast-theme',
        Color: 'contrast',
      },
      {
        ColorSwatch: 'color-swatch-cool-candy',
        Icon: 'brightness_1',
        Label: 'Cool Candy Theme',
        Value: 'cool-candy-theme',
        Color: 'cool-candy',
      },
      {
        ColorSwatch: 'color-swatch-flipper',
        Icon: 'brightness_1',
        Label: 'Flipper Theme',
        Value: 'flipper-theme',
        Color: 'flipper',
      },
      {
        ColorSwatch: 'color-swatch-ice',
        Icon: 'brightness_1',
        Label: 'Ice Theme',
        Value: 'ice-theme',
        Color: 'ice',
      },
      {
        ColorSwatch: 'color-swatch-sea-green',
        Icon: 'brightness_1',
        Label: 'Sea Green Theme',
        Value: 'sea-green-theme',
        Color: 'sea-green',
      },
      {
        ColorSwatch: 'color-swatch-white-mint',
        Icon: 'brightness_1',
        Label: 'White Mint Theme',
        Value: 'white-mint-theme',
        Color: 'white-mint',
      },
      {
        ColorSwatch: 'color-swatch-ivy',
        Icon: 'brightness_1',
        Label: 'Ivy Theme',
        Value: 'ivy-theme',
        Color: 'ivy',
      },
    ];
  }

  /** GUIDED TOUR */
  protected startTour(): void {
    this.guidedTourService.startTour(this.State.CurrentTour);
  }

  protected setupTourSteps(): TourStep[] {
    return [
      {
        Title: 'LCU-Guided-Tour',
        Subtitle: 'Guided Tour',
        Content: `Welcome to the LCU-Guided-Tour library! This library provides the functionality to do your own guided tour
        of an application. <br/><br/> Click the <b>Next</b> button to get started with an example Tour!`,
      },
      {
        Title: 'Title',
        Subtitle: 'Guided Tour',
        Selector: '#guidedTourHeader',
        Content: `With the LCU-Guided-Tour, you can select anything that is on the screen that has a valid CSS selector.
        For example, you can select this title, which as an id of <b>#guidedTourHeader</b>. <br/><br/>
        Valid selectors are as follows:
        <ul>
          <li>.class</li>
          <li>#id</li>
          <li>element</li>
        </ul>`,
        Orientation: OrientationTypes.Bottom,
      },
      {
        Title: 'First Paragraph',
        Subtitle: 'Guided Tour',
        Selector: 'p',
        Content: `Here, we are selecting the first paragraph element on the screen with <b>p</b>.`,
        Orientation: OrientationTypes.BottomRight,
      },
      {
        Title: 'Second Paragraph',
        Subtitle: 'Guided Tour',
        Selector: '#p2',
        Content: `Now we are selecting the second paragraph, that has an id of <b>#p2</b>, in which we are targeting.`,
        Orientation: OrientationTypes.Top,
      },
      {
        Title: 'Complex Selectors',
        Subtitle: 'Guided Tour',
        Selector: '.section:nth-of-type(2) .mat-radio-button:nth-child(3)',
        Content: `You can even target more specific, complex elements, by using various built-in CSS selectors. In
        this case, we are targeting the third radio item in the second section with the selector of: <br/>
        <b>.section:nth-of-type(2) .mat-radio-button:nth-child(3)</b>`,
        Orientation: OrientationTypes.Right,
      },
      {
        Title: 'Modifiers',
        Subtitle: 'Guided Tour',
        Selector: '#formBox',
        Content: `As for the bot, you can modify certain properties of it in order to customize it to your needs.
        Here we can change the position it lives on the screen, the container it should position itself in, as well
        as the amount of padding we would like to have between the bot and the container.`,
        Orientation: OrientationTypes.Right,
      },
      {
        Title: 'Bounding Container',
        Subtitle: 'Guided Tour',
        Selector: '#boundingBox',
        Content: `As an example, you can set the Bot to be positioned inside this box by setting the container to
        the <b>#boundingBox</b> selector.`,
        Orientation: OrientationTypes.Left,
      },
      {
        Title: 'Assigning Actions',
        Subtitle: 'Guided Tour',
        Selector: '.mat-tab-label:nth-of-type(2)',
        Content: `You can assign each step an action as well, in case you want to run logic before or after a step is displayed.
        Click <b>Next</b> to see this in action!`,
        Orientation: OrientationTypes.BottomLeft,
      },
      {
        Title: 'Tab Movement',
        Subtitle: 'Guided Tour',
        Selector: '#boxLogoForm',
        Content: `As you can see, this tab was selected so that the Tour could continue after the DOM has rendered a different view.
        You can also use the <b>actionDelay</b> property to specify a time delay before showing the next step, in order to properly
        render the next view.`,
        Orientation: OrientationTypes.BottomLeft,
        ActionDelay: 500,
      }
    ];
  }

  protected setBotSubItems(): GuideBotSubItem[] {
    return [
      new GuideBotSubItem({
        label: 'Start Tour',
        icon: 'all_out',
        action: () => this.startTour(),
      }),
      new GuideBotSubItem({
        label: 'Toggle Chat',
        icon: 'chat_bubble_outline',
        action: () => this.toggleChat(),
      }),
    ];
  }

  protected toggleChat(): void {
    this.guideBotEventService.EmitChatToggledEvent();
  }

  protected stateChanged() {
    console.log(this.State);
  }
}
