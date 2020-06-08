import { debounceTime } from 'rxjs/internal/operators';
import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { Observable, Subject, fromEvent, timer } from 'rxjs';
import { cloneDeep } from 'lodash';
import { DOCUMENT } from '@angular/common';
import { WindowRefService } from './windowref.service';
import { TourStep } from '../models/guided-tour/tour-step.model';
import { GuidedTour } from '../models/guided-tour/guided-tour.model';
import { OrientationConfiguration } from '../models/guided-tour/orientation-configuration.model';
import { OrientationTypes } from '../models/guided-tour/orientation-types.enum';
import { GuidedTourStepRecord } from '../models/guided-tour/guided-tour-step-record.model';

@Injectable()
export class GuidedTourService {
    public guidedTourCurrentStepStream: Observable<TourStep>;
    public guidedTourOrbShowingStream: Observable<boolean>;
    public isTourOpenStream: Observable<string>;
    public onTourCompleteStream: Observable<any>;
    public onTourSkippedStream: Observable<any>;
    public onStepChangedActionStream: Observable<TourStep>;
    public LoadingTourStepStream: Observable<boolean>;
    public WaitUntilSelectorFoundStream: Observable<boolean>;

    private _guidedTourCurrentStepSubject = new Subject<TourStep>();
    private _guidedTourOrbShowingSubject = new Subject<boolean>();
    private _isTourOpenSubject = new Subject<string>();
    private _loadingTourStepStream = new Subject<boolean>();
    private _waitUntilSelectorFoundSubject = new Subject<boolean>();
    private _currentTourStepIndex = 0;
    private _currentTour: GuidedTour = null;
    private _onFirstStep = true;
    private _onLastStep = true;
    private _onResizeMessage = false;
    private _onTourOpen = false;

    private _onTourComplete = new Subject<GuidedTour>();
    private _onTourSkipped = new Subject<GuidedTour>();
    private _onStepChangedAction = new Subject<TourStep>();

    constructor(
        public errorHandler: ErrorHandler,
        private windowRef: WindowRefService,
        @Inject(DOCUMENT) private dom: any
    ) {
        this.guidedTourCurrentStepStream = this._guidedTourCurrentStepSubject.asObservable();
        this.guidedTourOrbShowingStream = this._guidedTourOrbShowingSubject.asObservable();
        this.isTourOpenStream = this._isTourOpenSubject.asObservable();
        this.onTourCompleteStream = this._onTourComplete.asObservable();
        this.onTourSkippedStream = this._onTourSkipped.asObservable();
        this.onStepChangedActionStream = this._onStepChangedAction.asObservable();
        this.LoadingTourStepStream = this._loadingTourStepStream.asObservable();
        this.WaitUntilSelectorFoundStream = this._waitUntilSelectorFoundSubject.asObservable();

        fromEvent(this.windowRef.nativeWindow, 'resize').pipe(debounceTime(200)).subscribe(() => {
            if (this._currentTour && this._currentTourStepIndex > -1) {
                if (this._currentTour.MinimumScreenSize && this._currentTour.MinimumScreenSize >= this.windowRef.nativeWindow.innerWidth) {
                    this._onResizeMessage = true;
                    const dialog = this._currentTour.ResizeDialog || {
                        Title: 'Please resize',
                        Content: 'You have resized the tour to a size that is too small to continue. Please resize the browser to a larger size to continue the tour or close the tour.'
                    };

                    this._guidedTourCurrentStepSubject.next(dialog);
                } else {
                    this._onResizeMessage = false;
                    this._guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this._currentTourStepIndex));
                }
            }
        });
    }

    public nextStep(): void {
      this._loadingTourStepStream.next(true);

      if (this._currentTour.Steps[this._currentTourStepIndex + 1]) {
        this.processStep();
      } else {
        this._onTourComplete.next(this._currentTour);
        this.resetTour();
      }
    }

    public backStep(): void {
        this._loadingTourStepStream.next(true);

        if (this._currentTour.Steps[this._currentTourStepIndex - 1]) {
          this.processStep(true);
        }
        else {
          this.resetTour();
        }
    }

    protected processStep(isBack: boolean = false): void {
      isBack ? this._currentTourStepIndex-- : this._currentTourStepIndex++;
      this._setFirstAndLast();

      this._onStepChangedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
      this.WaitUntilSelectorFound();
    }

    public PrepareNextStep(isFound: boolean, isBack?: boolean): void {
      if (isFound) {
        this._guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this._currentTourStepIndex));
      } else {
        this._guidedTourCurrentStepSubject.next(this.getErrorTourStep(this._currentTour.Steps[this._currentTourStepIndex].Selector));
      }
      this._loadingTourStepStream.next(false);
    }


    public WaitUntilSelectorFound(): void {
      const selector = this._currentTour.Steps[this._currentTourStepIndex].Selector;
      const lookup = this._currentTour.Steps[this._currentTourStepIndex].Lookup;
      if (selector) {
        let timeElapsed = 0;
        const timeInt = 100;
        const maxTimeElapsed = 10000;

        const visiblePoller$ = timer(0, timeInt).subscribe(
          (_: any) => {
            timeElapsed += timeInt;

            const selectedElement = this.dom.querySelector(selector);

            if (selectedElement) {
              this.checkIfElementIsMoving(selectedElement);
              visiblePoller$.unsubscribe();
            } else if (!selectedElement && timeElapsed >= maxTimeElapsed) {
              this._waitUntilSelectorFoundSubject.next(false);
              visiblePoller$.unsubscribe();
              this.errorHandler.handleError(
                new Error(`Error finding selector ${selector} on step: '${lookup}', during guided tour: '${this._currentTour.Lookup}'`)
              );
            }
          }
        );
      } else {
        this.PrepareNextStep(true);
      }
    }

    protected checkIfElementIsMoving(el: any): void {
      let timeElapsed = 0;
      const timeInt = 50;
      const maxTimeElapsed = 5000;

      let offLeft = el.getBoundingClientRect().left;
      let offTop = el.getBoundingClientRect().top;

      const poller$ = timer(50, timeInt).subscribe(
        (_: any) => {
          timeElapsed += timeInt;

          if (el.getBoundingClientRect().left !== offLeft || el.getBoundingClientRect().top !== offTop) {
            offLeft = el.getBoundingClientRect().left;
            offTop = el.getBoundingClientRect().top;
          } else {
            this._waitUntilSelectorFoundSubject.next(true);
            poller$.unsubscribe();
          }

          if (timeElapsed >= maxTimeElapsed) {
            // console.error(`checkIfElementIsMoving() poller$ TIME HAS ELAPSED!`);
            this._waitUntilSelectorFoundSubject.next(false);
            poller$.unsubscribe();
          }
        }
      );
    }

    public skipTour(): void {
        this._onTourSkipped.next(this._currentTour);
        this.resetTour();
    }

    public resetTour(): void {
        this._isTourOpenSubject.next(null);
        this.dom.body.classList.remove('tour-open');
        this._currentTour = null;
        this._currentTourStepIndex = 0;
        this._onTourOpen = false;
        this._guidedTourCurrentStepSubject.next(null);
    }

    public startTour(tour: GuidedTour): void {
        this._currentTour = cloneDeep(tour);
        this._currentTour.Steps = this._currentTour.Steps.filter((step: TourStep) => !step.SkipStep);
        this._onTourOpen = true;
        this._setFirstAndLast();
        this._guidedTourOrbShowingSubject.next(this._currentTour.UseOrb);
        this._isTourOpenSubject.next(tour.Lookup);
        if (
            this._currentTour.Steps.length > 0
            && (!this._currentTour.MinimumScreenSize
                || (this.windowRef.nativeWindow.innerWidth >= this._currentTour.MinimumScreenSize))
        ) {
            if (!this._currentTour.UseOrb) {
                this.dom.body.classList.add('tour-open');
            }
            this._onStepChangedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
            this.WaitUntilSelectorFound();
        }
    }

    public SetCurrentStepIndex(tourHistory: { [tourLookup: string]: GuidedTourStepRecord }, tour: GuidedTour): void {
      let currentIndex: number = 0;

      if (tourHistory && tourHistory[tour.Lookup]) {
        const lastIndex = tourHistory[tour.Lookup].StepHistory.length - 1;

        currentIndex = tour.Steps.findIndex((step: TourStep) => {
          return step.Lookup === tourHistory[tour.Lookup].StepHistory[lastIndex];
        });
      }

      this._currentTourStepIndex = currentIndex;
    }

    public activateOrb(): void {
        this._guidedTourOrbShowingSubject.next(false);
        this.dom.body.classList.add('tour-open');
    }

    private _setFirstAndLast(): void {
        this._onLastStep = (this._currentTour.Steps.length - 1) === this._currentTourStepIndex;
        this._onFirstStep = this._currentTourStepIndex === 0;
    }

    private _checkSelectorValidity(): boolean {
        if (this._currentTour.Steps[this._currentTourStepIndex].Selector) {
            const selectedElement = this.dom.querySelector(this._currentTour.Steps[this._currentTourStepIndex].Selector);
            if (!selectedElement) {
                this.errorHandler.handleError(
                    // If error handler is configured this should not block the browser.
                    new Error(`Error finding selector ${this._currentTour.Steps[this._currentTourStepIndex].Selector}
                      on step ${this._currentTourStepIndex + 1} during guided tour: ${this._currentTour.ID}`)
                );
                return false;
            }
        }
        return true;
    }

    public get onLastStep(): boolean {
        return this._onLastStep;
    }

    public get onFirstStep(): boolean {
        return this._onFirstStep;
    }

    public get onResizeMessage(): boolean {
        return this._onResizeMessage;
    }

    public get onTourOpen(): boolean {
        return this._onTourOpen;
    }

    public get currentTourStepDisplay(): number {
        return this._currentTourStepIndex + 1;
    }

    public get currentTourStepCount(): number {
        return this._currentTour && this._currentTour.Steps ? this._currentTour.Steps.length : 0;
    }

    public get preventBackdropFromAdvancing(): boolean {
        return this._currentTour && this._currentTour.PreventBackdropFromAdvancing;
    }

    private getPreparedTourStep(index: number): TourStep {
        return this.setTourOrientation(this._currentTour.Steps[index]);
    }

    private getErrorTourStep(missingSelector: string): TourStep {
      const errorStep: TourStep = {
        Lookup: 'step-error',
        Content: `Ooops. It appears that this tour has encountered an issue. Thinky could not find the element named <b>${missingSelector}</b>
        anywhere on the screen. Here are some possible reasons:
        <ul>
          <li>The element Thinky is looking for isn't on the screen</li>
          <li>The targeted element didn't render in time, possibly indicating a loss of network connectivity, or a problem with the application</li>
          <li>Something else happened! Visit <a href="https://support.fathym.com" target="_blank">https://support.fathym.com</a>
              for additional documentation and support</li>
        </ul>`,
        Title: 'Error',
        Subtitle: 'Error Finding Step',
      }
      return this.setTourOrientation(errorStep);
    }

    private setTourOrientation(step: TourStep): TourStep {
        const convertedStep = cloneDeep(step);
        if (
            convertedStep.OrientationConfiguration
            && convertedStep.OrientationConfiguration.length
        ) {
            convertedStep.OrientationConfiguration.sort((a: OrientationConfiguration, b: OrientationConfiguration) => {
                if (!b.MaximumSize) {
                    return 1;
                }
                if (!a.MaximumSize) {
                    return -1;
                }
                return b.MaximumSize - a.MaximumSize;
            });

            let currentOrientation: OrientationTypes = OrientationTypes.Top;
            convertedStep.OrientationConfiguration.forEach(
              (orientationConfig: OrientationConfiguration) => {
                if (!orientationConfig.MaximumSize || this.windowRef.nativeWindow.innerWidth <= orientationConfig.MaximumSize) {
                    currentOrientation = orientationConfig.OrientationDirection;
                }
              }
            );

            convertedStep.Orientation = currentOrientation;
        }
        return convertedStep;
    }
}
