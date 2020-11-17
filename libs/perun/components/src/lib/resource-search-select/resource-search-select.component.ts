import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Resource } from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-resource-search-select',
  templateUrl: './resource-search-select.component.html',
  styleUrls: ['./resource-search-select.component.css']
})
export class ResourceSearchSelectComponent implements OnInit, OnChanges, OnDestroy {


  constructor() { }

  @Input()
  resources: Resource[];

  @Output()
  resourceSelected = new EventEmitter<Resource>();

  resourceCtrl: FormControl = new FormControl();
  resourceFilterCtrl: FormControl = new FormControl();
  filteredResources = new ReplaySubject<Resource[]>(1);

  protected _onDestroy = new Subject<void>();

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredResources.next(this.resources.slice());

    this.resourceCtrl.setValue(this.resources[0]);

    this.resourceCtrl.valueChanges.subscribe(resource => this.resourceSelected.emit(resource));

    this.resourceFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterResources();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterResources() {
    if (!this.resources) {
      return;
    }
    // get the search keyword
    let search = this.resourceFilterCtrl.value;
    if (!search) {
      this.filteredResources.next(this.resources.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredResources.next(
      this.resources.filter(option => option.name.toLowerCase().indexOf(search) >=0)
    );
  }
}
