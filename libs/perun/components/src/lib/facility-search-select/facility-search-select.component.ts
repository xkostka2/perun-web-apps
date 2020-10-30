import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Facility } from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-facility-search-select',
  templateUrl: './facility-search-select.component.html',
  styleUrls: ['./facility-search-select.component.css']
})
export class FacilitySearchSelectComponent implements OnInit, OnChanges, OnDestroy {


  constructor() { }

  @Input()
  facilities: Facility[];

  @Output()
  facilitySelected = new EventEmitter<Facility>();

  facilityCtrl: FormControl = new FormControl();
  facilityFilterCtrl: FormControl = new FormControl();
  filteredFacilities = new ReplaySubject<Facility[]>(1);

  protected _onDestroy = new Subject<void>();

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredFacilities.next(this.facilities.slice());

    this.facilityCtrl.setValue(this.facilities[0]);

    this.facilityCtrl.valueChanges.subscribe(resource => this.facilitySelected.emit(resource));

    this.facilityFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterFacilities();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterFacilities() {
    if (!this.facilities) {
      return;
    }
    // get the search keyword
    let search = this.facilityFilterCtrl.value;
    if (!search) {
      this.filteredFacilities.next(this.facilities.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredFacilities.next(
      this.facilities.filter(option => option.name.toLowerCase().indexOf(search) >=0)
    );
  }
}
