import { Injectable, Injector } from '@angular/core';
import { StateManagerContext } from '@lcu/common';
import { GuidedTour } from '../models/guided-tour.model';

@Injectable({
    providedIn: 'root'
})
export class GuidedTourManagerContext extends StateManagerContext<GuidedTour> {

    protected State: GuidedTour;

    constructor(protected injector: Injector) {
        super(injector);
    }

    public GetTourById(id: number): void {
        this.Execute({
            Arguments: {
                TourId: id
            },
            Type: 'get-tour-by-id'
        });
    }

    protected async loadStateKey() {
        return 'main';
    }

    protected async loadStateName() {
        return 'lcu';
    }
}
