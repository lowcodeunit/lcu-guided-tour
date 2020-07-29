import { Component, OnInit, Input } from '@angular/core';
import { ChartDataSets, ChartType, ChartOptions } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { JourneysIoTDetails } from '../../../state/journeys/journeys.state';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'lcu-journey-details',
  templateUrl: './journey-details.component.html',
  styleUrls: ['./journey-details.component.scss'],
})
export class JourneyDetailsComponent implements OnInit {
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

  @Input('iot-data')
  public IoTData?: JourneysIoTDetails[];

  //  Constructors
  constructor(protected formBldr: FormBuilder, protected http: HttpClient) {}

  public ngOnInit(): void {
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
    this.IoTDataLabels = !this.IoTData ? [] : Object.keys(this.IoTData[0].Data);

    // this.IoTDataResults = [
    //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Device 1' },
    //   { data: [65, 55, 40, 59, 80, 81, 56], label: 'Device 2' },
    // ];
    this.IoTDataResults = !this.IoTData
      ? []
      : this.IoTData.map((data) => {
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
