import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { JourneyContentTypes, JourneyOption } from '../../../state/journeys/journeys.state';

@Component({
  selector: 'lcu-journey-card',
  templateUrl: './journey-card.component.html',
  styleUrls: ['./journey-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JourneyCardComponent implements OnInit {
  //  Fields

  //  Properties
  public Columns: string;

  public DetailsSpan: string;

  @Input('highlight')
  public Highlight: boolean;

  @Input('journey')
  public Journey: JourneyOption;

  public get JourneyContentTypes(): any {
    return JourneyContentTypes;
  }

  @Output('more-details')
  public MoreDetailsClicked: EventEmitter<JourneyOption>;

  //  Constructors
  constructor() {
    this.MoreDetailsClicked = new EventEmitter();
  }

  //  Life Cycle
  public ngOnInit(): void {
    this.Columns = this.Highlight ? '33% 66%' : '100%';

    this.DetailsSpan = this.Highlight ? 'auto / span 2' : null;

    console.log("JOURNEY: ", this.Journey);
  }

  //  API Methods
  public MoreDetails() {
    this.MoreDetailsClicked.emit(this.Journey);
  }

  // Helpers
  public JourneyAction(url: string): void {
    if (!url) {
      return;
    }

    window.open(url);
  }
}
