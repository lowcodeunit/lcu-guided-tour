import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDataChartComponent } from './iot-data-chart.component';

describe('IotDataChartComponent', () => {
  let component: IotDataChartComponent;
  let fixture: ComponentFixture<IotDataChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDataChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDataChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
