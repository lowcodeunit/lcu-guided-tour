import { Injectable, Injector } from '@angular/core';
import { StateManagerContext } from '@lcu/common';
import { LcuModel } from '../models/lcu.model';

@Injectable({
    providedIn: 'root'
})
export class LcuManagerContext extends StateManagerContext<LcuModel> {

    protected State: LcuModel;

    constructor(protected injector: Injector) {
        super(injector);
    }

    public GetLcuById(id: number): void {
        this.State.Loading = true;

        this.Execute({
            Arguments: {
                LcuId: id
            },
            Type: 'get-lcu-by-id'
        });
    }
    
    protected async loadStateKey() {
        return 'main';
    }

    protected async loadStateName() {
        return 'lcu';
    }
}
