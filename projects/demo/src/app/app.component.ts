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
        selector: '#guidedTourHeader',
        content: `Welcome to the tour! As you can see, you can highlight certain elements of an application
        and display more information here.`,
        orientation: Orientation.Bottom
      },
      {
        title: 'First Paragraph',
        selector: '#p1',
        content: `Here, we are selecting the first paragraph.`,
        orientation: Orientation.Bottom
      },
      {
        title: 'Second Paragraph',
        selector: '#p2',
        content: `Here, we are selecting the second paragraph.`,
        orientation: Orientation.Top
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
