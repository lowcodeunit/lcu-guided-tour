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

@Injectable()
export class GuidedTourService {
    public guidedTourCurrentStepStream: Observable<TourStep>;
    public guidedTourOrbShowingStream: Observable<boolean>;
    public isTourOpenStream: Observable<boolean>;
    public onTourCompleteStream: Observable<any>;
    public onTourSkippedStream: Observable<any>;
    public onStepClosedActionStream: Observable<TourStep>;
    public onStepOpenedActionStream: Observable<TourStep>;
    public LoadingTourStepStream: Observable<boolean>;
    public WaitUntilSelectorFoundStream: Observable<boolean>;

    private _guidedTourCurrentStepSubject = new Subject<TourStep>();
    private _guidedTourOrbShowingSubject = new Subject<boolean>();
    private _isTourOpenSubject = new Subject<boolean>();
    private _loadingTourStepStream = new Subject<boolean>();
    private _waitUntilSelectorFoundSubject = new Subject<boolean>();
    private _currentTourStepIndex = 0;
    private _currentTour: GuidedTour = null;
    private _onFirstStep = true;
    private _onLastStep = true;
    private _onResizeMessage = false;

    private _onTourComplete = new Subject<GuidedTour>();
    private _onTourSkipped = new Subject<GuidedTour>();
    private _onStepClosedAction = new Subject<TourStep>();
    private _onStepOpenedAction = new Subject<TourStep>();

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
        this.onStepClosedActionStream = this._onStepClosedAction.asObservable();
        this.onStepOpenedActionStream = this._onStepOpenedAction.asObservable();
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
      this._onStepClosedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);

      if (this._currentTour.Steps[this._currentTourStepIndex + 1]) {
        this.processStep();
      } else {
        this._onTourComplete.next(this._currentTour);
        this.resetTour();
      }
    }

    public backStep(): void {
        this._loadingTourStepStream.next(true);
        this._onStepClosedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);

        if (this._currentTour.Steps[this._currentTourStepIndex - 1]) {
          this.processStep(true);
        }
        else {
          this.resetTour();
        }
    }

    protected processStep(isBack: boolean = false): void {
      isBack ? this._currentTourStepIndex-- : this._currentTourStepIndex++;
      console.log('processStep() currentStep: ', this._currentTourStepIndex);
      this._setFirstAndLast();

      this._onStepOpenedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
      this.WaitUntilSelectorFound();
    }

    public PrepareNextStep(isFound: boolean, isBack?: boolean): void {
      if (isFound) {
        this._guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this._currentTourStepIndex));
      } else {
        isBack ? this.backStep() : this.nextStep();
      }
      this._loadingTourStepStream.next(false);
    }


    public WaitUntilSelectorFound(): void {
      // console.log('WaitUntilSelectorFound() called...');
      if (this._currentTour.Steps[this._currentTourStepIndex].Selector) {
        let timeElapsed = 0;
        const timeInt = 100;
        const maxTimeElapsed = 10000;

        const visiblePoller$ = timer(0, timeInt).subscribe(
          (_: any) => {
            // console.log('WaitUntilSelectorFound() timeElapsed is: ', timeElapsed);
            timeElapsed += timeInt;

            const selectedElement = this.dom.querySelector(this._currentTour.Steps[this._currentTourStepIndex].Selector);

            if (selectedElement) {
              // console.warn('WaitUntilSelectorFound() WE FOUND THE ELEMENT!');
              this.checkIfElementIsMoving(selectedElement);
              visiblePoller$.unsubscribe();
            } else if (!selectedElement && timeElapsed >= maxTimeElapsed) {
              // console.error('WaitUntilSelectorFound() WE COULD NOT FIND THE ELEMENT :(');
              this._waitUntilSelectorFoundSubject.next(false);
              visiblePoller$.unsubscribe();
              this.errorHandler.handleError(
                // If error handler is configured this should not block the browser.
                new Error(`Error finding selector ${this._currentTour.Steps[this._currentTourStepIndex].Selector}
                  on step ${this._currentTourStepIndex + 1} during guided tour: ${this._currentTour.ID}`)
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
        this._isTourOpenSubject.next(false);
        this.dom.body.classList.remove('tour-open');
        this._currentTour = null;
        this._currentTourStepIndex = 0;
        this._guidedTourCurrentStepSubject.next(null);
    }

    public startTour(tour: GuidedTour): void {
        this._currentTour = cloneDeep(tour);
        this._currentTour.Steps = this._currentTour.Steps.filter((step: TourStep) => !step.SkipStep);
        this._currentTourStepIndex = 0;
        this._setFirstAndLast();
        this._guidedTourOrbShowingSubject.next(this._currentTour.UseOrb);
        this._isTourOpenSubject.next(true);
        if (
            this._currentTour.Steps.length > 0
            && (!this._currentTour.MinimumScreenSize
                || (this.windowRef.nativeWindow.innerWidth >= this._currentTour.MinimumScreenSize))
        ) {
            if (!this._currentTour.UseOrb) {
                this.dom.body.classList.add('tour-open');
            }
            this._onStepOpenedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
            this.WaitUntilSelectorFound();
        }
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
