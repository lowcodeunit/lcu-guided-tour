import { Component, OnInit, Input } from '@angular/core';
import { JourneyContentTypes, JourneyOption } from '../../../state/journeys/journeys.state';

@Component({
  selector: 'lcu-journey-card',
  templateUrl: './journey-card.component.html',
  styleUrls: ['./journey-card.component.scss']
})
export class JourneyCardComponent implements OnInit {

  /**
   * the individual journey data to be displayed in the card
   */

  public Columns: string;

  public DetailsSpan: string;

  @Input('highlight')
  public Highlight: boolean;

  @Input('journey')
  public Journey: JourneyOption;

  get JourneyContentTypes(): any {
    return JourneyContentTypes;
  }

  constructor() {
  }

  public ngOnInit(): void {
    this.Columns = this.Highlight ? '25% 25% 25% 25%' : '100%';

    this.DetailsSpan = this.Highlight ? 'auto / span 2' : null;
  }

}
