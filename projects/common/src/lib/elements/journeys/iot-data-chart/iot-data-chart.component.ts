import { Component, OnInit, Input } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'lcu-iot-data-chart',
  templateUrl: './iot-data-chart.component.html',
  styleUrls: ['./iot-data-chart.component.scss'],
})
export class IotDataChartComponent implements OnInit {
  @Input('data-set')
  public ChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Device 1' },
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Device 2' },
  ];

  @Input('labels')
  public ChartLabels: Label[] = [
    'Friday',
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
  ];

  public ChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  public ChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];

  public ChartLegend = true;

  public ChartType: ChartType = 'line';

  public ChartPlugins: any[] = [];

  constructor() {}

  ngOnInit() {}
}
