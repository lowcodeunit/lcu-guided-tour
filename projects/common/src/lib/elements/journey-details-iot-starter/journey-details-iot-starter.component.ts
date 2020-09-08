import { Component, OnInit, Injector } from '@angular/core';
import { LCUElementContext, LcuElementComponent } from '@lcu/common';
import { ChartDataSets, ChartType, ChartOptions } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { JourneysIoTDetails, JourneyOption } from '../../state/journeys/journeys.state';
import { throwError } from 'rxjs';

export class LcuGuidedTourJourneyDetailsIotStarterElementState {
  public IoTData?: JourneysIoTDetails[];

  public Journey?: JourneyOption;
}

export class LcuGuidedTourJourneyDetailsIotStarterContext extends LCUElementContext<
  LcuGuidedTourJourneyDetailsIotStarterElementState
> {}

export const SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_STARTER_ELEMENT =
  'lcu-guided-tour-journey-details-iot-starter-element';

@Component({
  selector: SELECTOR_LCU_GUIDED_TOUR_JOURNEY_DETAILS_IOT_STARTER_ELEMENT,
  templateUrl: './journey-details-iot-starter.component.html',
  styleUrls: ['./journey-details-iot-starter.component.scss'],
})
export class LcuGuidedTourJourneyDetailsIotStarterElementComponent
  extends LcuElementComponent<LcuGuidedTourJourneyDetailsIotStarterContext>
  implements OnInit {
  //  Fields
  protected httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  //  Properties
  public ChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Device 1' },
    { data: [65, 55, 40, 59, 80, 81, 56], label: 'Device 2' },
  ];

  public ChartLabels: Label[] = [
    'Friday',
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
  ];

  public ChartLegend = true;

  public ChartType: ChartType = 'line';

  public ChartPlugins: any[] = [];

  public IoTChartColors: Color[];

  public IoTChartOptions: ChartOptions;

  public IoTDataForm: FormGroup;

  public IoTDataLabels: Label[];

  public IoTDataResults: ChartDataSets[];

  //  Constructors
  constructor(protected injector: Injector, protected formBldr: FormBuilder, protected http: HttpClient) {
    super(injector);
  }

  //  Life Cycle
  public ngOnInit() {
    super.ngOnInit();

    this.IoTDataForm = this.formBldr.group({
      deviceId: ['', Validators.required],
      deviceType: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      temp: ['', Validators.required],
      windHeading: ['', Validators.required],
    });

    this.configureCharts();
  }

  //  API Methods
  public SendDeviceData() {
    const data = {
      deviceid: this.IoTDataForm.controls.deviceId.value,
      DeviceType: this.IoTDataForm.controls.deviceType.value,
      Version: '1',
      Timestamp: new Date(),
      DeviceData: {
        Latitude: this.IoTDataForm.controls.latitude.value,
        Longitude: this.IoTDataForm.controls.longitude.value,
      },
      SensorReadings: {
        Temperature: this.IoTDataForm.controls.temp.value,
        WindHeading: this.IoTDataForm.controls.windHeading.value,
      },
    };

    this.http
      .post('/api/data-flow/iot/data-stream', data, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  //  Helpers
  protected configureCharts() {
    this.IoTChartOptions = { responsive: true, maintainAspectRatio: false };

    this.IoTChartColors = [
      { borderColor: 'black', backgroundColor: 'rgba(255,0,0,0.3)' },
    ];

    // this.IoTDataLabels = [
    //   'January',
    //   'February',
    //   'March',
    //   'April',
    //   'May',
    //   'June',
    //   'July',
    // ];
    this.IoTDataLabels = !this.context.State.IoTData ? [] : Object.keys(this.context.State.IoTData[0].Data);

    // this.IoTDataResults = [
    //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Device 1' },
    //   { data: [65, 55, 40, 59, 80, 81, 56], label: 'Device 2' },
    // ];
    this.IoTDataResults = !this.context.State.IoTData
      ? []
      : this.context.State.IoTData.map((data) => {
          return {
            label: data.Name,
            data: Object.keys(data.Data).map((dk) => {
              return data.Data[dk];
            }),
          };
        });
  }

  protected handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }
}
