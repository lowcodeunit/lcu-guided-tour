import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LcuModel } from '../../models/lcu.model';

@Component({
  selector: 'lcu-lcu',
  templateUrl: './lcu.component.html',
  styleUrls: ['./lcu.component.scss']
})
export class LcuComponent implements OnInit {

  @Input() public card: LcuModel;

  @Output() public cardSelected: EventEmitter<any>;

  constructor() {
    this.cardSelected = new EventEmitter<any>();
  }

  public ngOnInit(): void { }

  public SelectCard(url?: string): void {
    this.cardSelected.emit();

    if (url) {
      window.open(url);
    }
  }

}
