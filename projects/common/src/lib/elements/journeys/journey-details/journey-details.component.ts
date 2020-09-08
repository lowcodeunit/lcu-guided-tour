import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { JourneysIoTDetails } from '../../../state/journeys/journeys.state';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { JourneyOption } from './../../../state/journeys/journeys.state';

@Component({
  selector: 'lcu-journey-details',
  templateUrl: './journey-details.component.html',
  styleUrls: ['./journey-details.component.scss'],
})
export class JourneyDetailsComponent implements OnInit {
  //  Fields

  //  Properties
  @Output('close')
  public CloseClicked: EventEmitter<boolean>;

  @Input('iot-data')
  public IoTData?: JourneysIoTDetails[];

  @Input('journey')
  public Journey?: JourneyOption;

  public get SupportConfigContext() {
    return {
      State: {
        IoTData: this.IoTData,
        Journey: this.Journey,
      },
    };
  }

  //  Constructors
  constructor() {
    this.CloseClicked = new EventEmitter();
  }

  public ngOnInit(): void {
    // this.Journey.Details.SupportConfig = {
    //   Assets: [
    //     'https://mike-97d.fathym-int.com/_lcu/lcu-data-apps-lcu/wc/lcu-data-apps.lcu.js',
    //   ],
    //   ElementName: 'lcu-data-apps-config-manager-element',
    // };
  }

  //  API Methods
  public Close() {
    this.CloseClicked.emit(true);
  }

  public Keys(value: {}) {
    return Object.keys(value);
  }

  //  Helpers
}
