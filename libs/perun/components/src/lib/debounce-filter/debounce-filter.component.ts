import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-debounce-filter',
  templateUrl: './debounce-filter.component.html',
  styleUrls: ['./debounce-filter.component.scss']
})
export class DebounceFilterComponent implements OnInit {

  constructor() { }

  @Input()
  placeholder: string;

  @Output()
  filter = new EventEmitter<string>();

  @ViewChild('groupFilterInput', {static: true}) groupFilterInput: ElementRef;

  ngOnInit() {
    fromEvent(this.groupFilterInput.nativeElement, 'keyup').pipe(
      map((event: any) => {
        return event.target.value;
      })
      , debounceTime(500)
      , distinctUntilChanged()
    ).subscribe((text: string) => {
      this.filter.emit(text);
    });
  }

}
