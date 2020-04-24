import { debounceTime } from 'rxjs/internal/operators';
import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { Observable, Subject, fromEvent } from 'rxjs';
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

    private _guidedTourCurrentStepSubject = new Subject<TourStep>();
    private _guidedTourOrbShowingSubject = new Subject<boolean>();
    private _isTourOpenSubject = new Subject<boolean>();
    private _currentTourStepIndex = 0;
    private _currentTour: GuidedTour = null;
    private _onFirstStep = true;
    private _onLastStep = true;
    private _onResizeMessage = false;

    private _onTourComplete = new Subject<any>();
    private _onTourSkipped = new Subject<any>();
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
        this._onStepClosedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
        if (this._currentTour.Steps[this._currentTourStepIndex + 1]) {
            this._currentTourStepIndex++;
            this._setFirstAndLast();


            this._onStepOpenedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
            // Usually an action is opening something so we need to give it time to render.
            setTimeout(() => {
              if (this._checkSelectorValidity()) {
                  this._guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this._currentTourStepIndex));
              } else {
                  this.nextStep();
              }
          }, this._currentTour.Steps[this._currentTourStepIndex].ActionDelay);
        } else {
            this._onTourComplete.next();
            this.resetTour();
        }
    }

    public backStep(): void {
        this._onStepClosedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
        if (this._currentTour.Steps[this._currentTourStepIndex - 1]) {
            this._currentTourStepIndex--;
            this._setFirstAndLast();

            this._onStepOpenedAction.next(this._currentTour.Steps[this._currentTourStepIndex]);
            setTimeout(() => {
                if (this._checkSelectorValidity()) {
                    this._guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this._currentTourStepIndex));
                } else {
                    this.backStep();
                }
            }, this._currentTour.Steps[this._currentTourStepIndex].ActionDelay);
        } else {
            this.resetTour();
        }
    }

    public skipTour(): void {
        this._onTourSkipped.next();
        this.resetTour();
    }

    public resetTour(): void {
        console.log('TOUR ----- resetTour()');
        this._isTourOpenSubject.next(false);
        this.dom.body.classList.remove('tour-open');
        this._currentTour = null;
        this._currentTourStepIndex = 0;
        this._guidedTourCurrentStepSubject.next(null);
    }

    public startTour(tour: GuidedTour): void {
        console.log('TOUR ----- startTour()');
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
            if (this._checkSelectorValidity()) {
                this._guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this._currentTourStepIndex));
            } else {
                this.nextStep();
            }
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
