import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, ViewEncapsulation, TemplateRef, Inject } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { ProgressIndicatorLocation } from '../../models/guided-tour/progress-indictator.enum';
import { GuidedTourService } from '../../services/guided-tour.service';
import { WindowRefService } from '../../services/windowref.service';
import { TourStep } from '../../models/guided-tour/tour-step.model';
import { OrientationTypes } from '../../models/guided-tour/orientation-types.enum';
import { kebabCase } from 'lodash';

@Component({
    selector: 'lcu-guided-tour',
    templateUrl: './guided-tour.component.html',
    styleUrls: ['./guided-tour.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GuidedTourComponent implements AfterViewInit, OnDestroy {
    @Input() public topOfPageAdjustment ?= 0;
    @Input() public tourStepWidth ?= 350;
    @Input() public minimalTourStepWidth ?= 200;
    @Input() public skipText ?= 'Skip';
    @Input() public nextText ?= 'Next';
    @Input() public doneText ?= 'Finish';
    @Input() public closeText ?= 'Close';
    @Input() public backText ?= 'Back';
    @Input() public progressIndicatorLocation?: ProgressIndicatorLocation = ProgressIndicatorLocation.InsideNextButton;
    @Input() public progressIndicator?: TemplateRef<any> = undefined;
    @ViewChild('tourStep', { static: false }) public tourStep: ElementRef;
    public KebabCase = kebabCase;
    public currentTourStep: TourStep = null;
    public highlightPadding = 4;
    public isOrbShowing = false;
    public progressIndicatorLocations = ProgressIndicatorLocation;
    public selectedElementRect: DOMRect = null;
    public CurrentSelectedElement: any;
    public LoadingNextStep: boolean = false;
    public IsStepError: boolean = false;
    public ErrorStepIndices: number[] = [];

    private resizeSubscription: Subscription;
    private scrollSubscription: Subscription;

    constructor(
        public guidedTourService: GuidedTourService,
        protected windowRef: WindowRefService,
        @Inject(DOCUMENT) protected dom: any
    ) { }

    protected get maxWidthAdjustmentForTourStep(): number {
        return this.tourStepWidth - this.minimalTourStepWidth;
    }

    protected get widthAdjustmentForScreenBound(): number {
        if (!this.tourStep) {
            return 0;
        }
        let adjustment = 0;
        if (this.calculatedLeftPosition < 0) {
            adjustment = -this.calculatedLeftPosition;
        }
        if (this.calculatedLeftPosition > this.windowRef.nativeWindow.innerWidth - this.tourStepWidth) {
            adjustment = this.calculatedLeftPosition - (this.windowRef.nativeWindow.innerWidth - this.tourStepWidth);
        }

        return Math.min(this.maxWidthAdjustmentForTourStep, adjustment);
    }

    public get calculatedTourStepWidth() {
        return this.tourStepWidth - this.widthAdjustmentForScreenBound;
    }

    public ngAfterViewInit(): void {
        this.guidedTourService.guidedTourCurrentStepStream.subscribe((step: TourStep) => {
            this.currentTourStep = step;
            if (step) {
              if (step.Selector) {
                if (step.IframeSelector) {
                    this.CurrentSelectedElement = this.guidedTourService.findElementInIframe(step.IframeSelector, step.Selector);
                } else {
                    this.CurrentSelectedElement = this.dom.querySelector(step.Selector);
                }

                if (this.CurrentSelectedElement) {
                    this.scrollToAndSetElement();
                } else {
                    this.selectedElementRect = null;
                }
              } else {
                  this.selectedElementRect = null;
              }

              if (step.Lookup === 'step-error') {
                this.IsStepError = true;
                this.ErrorStepIndices.push(this.guidedTourService.currentTourStepDisplay - 1);
              } else {
                this.IsStepError = false;
                const removeIndex = this.ErrorStepIndices.indexOf(this.guidedTourService.currentTourStepDisplay - 1);
                if (removeIndex !== -1) {
                  this.ErrorStepIndices.splice(removeIndex, 1);
                }
              }
            }
        });

        this.guidedTourService.guidedTourOrbShowingStream.subscribe((value: boolean) => {
            this.isOrbShowing = value;
        });

        this.guidedTourService.LoadingTourStepStream.subscribe((isLoading: boolean) => {
          this.LoadingNextStep = isLoading;
        });

        this.guidedTourService.WaitUntilSelectorFoundStream.subscribe((isDoneWaiting: boolean) => {
          // console.warn('ngAfterViewInit() - WaitUntilSelectorFoundStream', isDoneWaiting);
          this.guidedTourService.PrepareNextStep(isDoneWaiting);
        });

        this.resizeSubscription = fromEvent(this.windowRef.nativeWindow, 'resize').subscribe(() => {
            this.updateStepLocation();
        });

        this.scrollSubscription = fromEvent(this.windowRef.nativeWindow, 'scroll').subscribe(() => {
            this.updateStepLocation();
        });
    }

    public ngOnDestroy(): void {
        this.resizeSubscription.unsubscribe();
        this.scrollSubscription.unsubscribe();
    }

    public scrollToAndSetElement(): void {
      this.updateStepLocation();
      // Allow things to render to scroll to the correct location
      setTimeout(() => {
          if (!this.isOrbShowing && !this.isTourOnScreen()) {
              if (this.selectedElementRect && this.isBottom()) {
                  // Scroll so the element is on the top of the screen.
                  const topPos = ((this.windowRef.nativeWindow.scrollY + this.selectedElementRect.top) - this.topOfPageAdjustment)
                      - (this.currentTourStep.ScrollAdjustment ? this.currentTourStep.ScrollAdjustment : 0)
                      + this.getStepScreenAdjustment();
                  try {
                      this.windowRef.nativeWindow.scrollTo({
                          left: null,
                          top: topPos,
                          behavior: 'smooth'
                      });
                  } catch (err) {
                      if (err instanceof TypeError) {
                          this.windowRef.nativeWindow.scroll(0, topPos);
                      } else {
                          throw err;
                      }
                  }
              } else {
                  // Scroll so the element is on the bottom of the screen.
                  const topPos = (this.windowRef.nativeWindow.scrollY + this.selectedElementRect.top + this.selectedElementRect.height)
                      - this.windowRef.nativeWindow.innerHeight
                      + (this.currentTourStep.ScrollAdjustment ? this.currentTourStep.ScrollAdjustment : 0)
                      - this.getStepScreenAdjustment();
                  try {
                      this.windowRef.nativeWindow.scrollTo({
                          left: null,
                          top: topPos,
                          behavior: 'smooth'
                      });
                  } catch (err) {
                      if (err instanceof TypeError) {
                          this.windowRef.nativeWindow.scroll(0, topPos);
                      } else {
                          throw err;
                      }
                  }
              }
          }
      });
  }

    public handleOrb(): void {
        this.guidedTourService.activateOrb();
        if (this.currentTourStep && this.currentTourStep.Selector) {
            this.scrollToAndSetElement();
        }
    }

    protected isTourOnScreen(): boolean {
        return this.tourStep
            && this.elementInViewport(this.CurrentSelectedElement)
            && this.elementInViewport(this.tourStep.nativeElement);
    }

    // Modified from https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    protected elementInViewport(element: HTMLElement): boolean {
        let top = element.offsetTop;
        const height = element.offsetHeight;

        while (element.offsetParent) {
            element = (element.offsetParent as HTMLElement);
            top += element.offsetTop;
        }
        if (this.isBottom()) {
            return (
                top >= (this.windowRef.nativeWindow.pageYOffset
                    + this.topOfPageAdjustment
                    + (this.currentTourStep.ScrollAdjustment ? this.currentTourStep.ScrollAdjustment : 0)
                    + this.getStepScreenAdjustment())
                && (top + height) <= (this.windowRef.nativeWindow.pageYOffset + this.windowRef.nativeWindow.innerHeight)
            );
        } else {
            return (
                top >= (this.windowRef.nativeWindow.pageYOffset + this.topOfPageAdjustment - this.getStepScreenAdjustment())
                && (top + height + (this.currentTourStep.ScrollAdjustment ? this.currentTourStep.ScrollAdjustment : 0)) <= (this.windowRef.nativeWindow.pageYOffset + this.windowRef.nativeWindow.innerHeight)
            );
        }
    }

    public backdropClick(event: Event): void {
        if (this.guidedTourService.preventBackdropFromAdvancing) {
            event.stopPropagation();
        } else {
            this.guidedTourService.nextStep();
        }
    }

    public updateStepLocation(): void {
        if (this.currentTourStep && this.currentTourStep.Selector) {
            if (this.currentTourStep.IframeSelector) {
              this.selectedElementRect = this.calcElementRect(this.CurrentSelectedElement, this.currentTourStep.IframeSelector);
            } else {
              this.selectedElementRect = this.calcElementRect(this.CurrentSelectedElement);
            }
        } else {
            this.selectedElementRect = null;
        }
    }

    protected calcElementRect(element: any, IframeSelector?: string): any {
      let totalTop: number = 0;
      let totalLeft: number = 0;
      let totalRight: number = 0;
      let height: number = 0;
      let width: number = 0;

      const iframe = this.dom.querySelector(IframeSelector);

      if (iframe && typeof iframe.getBoundingClientRect === 'function') {
        const iframeRect = (iframe.getBoundingClientRect() as DOMRect);
        totalTop += iframeRect.top;
        totalLeft += iframeRect.left;
        totalRight += iframeRect.right;
      }

      if (element && typeof element.getBoundingClientRect === 'function') {
        const elementRect = (element.getBoundingClientRect() as DOMRect);
        totalTop += elementRect.top;
        totalLeft += elementRect.left;
        totalRight += elementRect.right;
        height = elementRect.height;
        width = elementRect.width;
      }

      return new DOMRect(totalLeft, totalTop, width, height);
    }

    protected isBottom(): boolean {
        return this.currentTourStep.Orientation
            && (this.currentTourStep.Orientation === OrientationTypes.Bottom
            || this.currentTourStep.Orientation === OrientationTypes.BottomLeft
            || this.currentTourStep.Orientation === OrientationTypes.BottomRight);
    }

    public get topPosition(): number {
      const paddingAdjustment = this.getHighlightPadding();

      if (this.isBottom()) {
          return this.selectedElementRect.top + this.selectedElementRect.height + paddingAdjustment;
      }

      return this.selectedElementRect.top - this.getHighlightPadding();
  }

  public get orbTopPosition(): number {
      if (this.isBottom()) {
          return this.selectedElementRect.top + this.selectedElementRect.height;
      }

      if (
          this.currentTourStep.Orientation === OrientationTypes.Right
          || this.currentTourStep.Orientation === OrientationTypes.Left
      ) {
          return (this.selectedElementRect.top + (this.selectedElementRect.height / 2));
      }

      return this.selectedElementRect.top;
  }

    protected get calculatedLeftPosition(): number {
      const paddingAdjustment = this.getHighlightPadding();

      if (
          this.currentTourStep.Orientation === OrientationTypes.TopRight
          || this.currentTourStep.Orientation === OrientationTypes.BottomRight
      ) {
          return (this.selectedElementRect.right - this.tourStepWidth);
      }

      if (
          this.currentTourStep.Orientation === OrientationTypes.TopLeft
          || this.currentTourStep.Orientation === OrientationTypes.BottomLeft
      ) {
          return (this.selectedElementRect.left);
      }

      if (this.currentTourStep.Orientation === OrientationTypes.Left) {
          return this.selectedElementRect.left - this.tourStepWidth - paddingAdjustment;
      }

      if (this.currentTourStep.Orientation === OrientationTypes.Right) {
          return (this.selectedElementRect.left + this.selectedElementRect.width + paddingAdjustment);
      }

      return (this.selectedElementRect.right - (this.selectedElementRect.width / 2) - (this.tourStepWidth / 2));
  }

    public get leftPosition(): number {
        if (this.calculatedLeftPosition >= 0) {
            return this.calculatedLeftPosition;
        }
        const adjustment = Math.max(0, -this.calculatedLeftPosition)
        const maxAdjustment = Math.min(this.maxWidthAdjustmentForTourStep, adjustment);
        return this.calculatedLeftPosition + maxAdjustment;
    }

    public get orbLeftPosition(): number {
      if (
          this.currentTourStep.Orientation === OrientationTypes.TopRight
          || this.currentTourStep.Orientation === OrientationTypes.BottomRight
      ) {
          return this.selectedElementRect.right;
      }

      if (
          this.currentTourStep.Orientation === OrientationTypes.TopLeft
          || this.currentTourStep.Orientation === OrientationTypes.BottomLeft
      ) {
          return this.selectedElementRect.left;
      }

      if (this.currentTourStep.Orientation === OrientationTypes.Left) {
          return this.selectedElementRect.left;
      }

      if (this.currentTourStep.Orientation === OrientationTypes.Right) {
          return (this.selectedElementRect.left + this.selectedElementRect.width);
      }

      return (this.selectedElementRect.right - (this.selectedElementRect.width / 2));
  }

    public get transform(): string {
        if (
            !this.currentTourStep.Orientation
            || this.currentTourStep.Orientation === OrientationTypes.Top
            || this.currentTourStep.Orientation === OrientationTypes.TopRight
            || this.currentTourStep.Orientation === OrientationTypes.TopLeft
        ) {
            return 'translateY(-100%)';
        }
        return null;
    }

    public get orbTransform(): string {
        if (
            !this.currentTourStep.Orientation
            || this.currentTourStep.Orientation === OrientationTypes.Top
            || this.currentTourStep.Orientation === OrientationTypes.Bottom
            || this.currentTourStep.Orientation === OrientationTypes.TopLeft
            || this.currentTourStep.Orientation === OrientationTypes.BottomLeft
        ) {
            return 'translateY(-50%)';
        }

        if (
            this.currentTourStep.Orientation === OrientationTypes.TopRight
            || this.currentTourStep.Orientation === OrientationTypes.BottomRight
        ) {
            return 'translate(-100%, -50%)';
        }

        if (
            this.currentTourStep.Orientation === OrientationTypes.Right
            || this.currentTourStep.Orientation === OrientationTypes.Left
        ) {
            return 'translate(-50%, -50%)';
        }

        return null;
    }

    public get overlayTop(): number {
        if (this.selectedElementRect) {
          return this.selectedElementRect.top - this.getHighlightPadding();
        }
        return 0;
    }

    public get overlayLeft(): number {
        if (this.selectedElementRect) {
          return this.selectedElementRect.left - this.getHighlightPadding();
        }
        return 0;
    }

    public get overlayHeight(): number {
        if (this.selectedElementRect) {
          return this.selectedElementRect.height + (this.getHighlightPadding() * 2);
        }
        return 0;
    }

    public get overlayWidth(): number {
        if (this.selectedElementRect) {
          return this.selectedElementRect.width + (this.getHighlightPadding() * 2);
        }
        return 0;
    }

    protected getHighlightPadding(): number {
        let paddingAdjustment = this.currentTourStep.UseHighlightPadding ? this.highlightPadding : 0;
        if (this.currentTourStep.HighlightPadding) {
            paddingAdjustment = this.currentTourStep.HighlightPadding;
        }
        return paddingAdjustment;
    }

    // This calculates a value to add or subtract so the step should not be off screen.
    protected getStepScreenAdjustment(): number {
        if (
            this.currentTourStep.Orientation === OrientationTypes.Left
            || this.currentTourStep.Orientation === OrientationTypes.Right
        ) {
            return 0;
        }

        const scrollAdjustment = this.currentTourStep.ScrollAdjustment ? this.currentTourStep.ScrollAdjustment : 0;
        const tourStepHeight = typeof this.tourStep.nativeElement.getBoundingClientRect === 'function' ? this.tourStep.nativeElement.getBoundingClientRect().height : 0;
        const elementHeight = this.selectedElementRect.height + scrollAdjustment + tourStepHeight;

        if ((this.windowRef.nativeWindow.innerHeight - this.topOfPageAdjustment) < elementHeight) {
            return elementHeight - (this.windowRef.nativeWindow.innerHeight - this.topOfPageAdjustment);
        }
        return 0;
    }
}
