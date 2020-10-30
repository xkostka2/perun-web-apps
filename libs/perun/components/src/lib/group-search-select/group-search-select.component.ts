import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-group-search-select',
  templateUrl: './group-search-select.component.html',
  styleUrls: ['./group-search-select.component.css']
})
export class GroupSearchSelectComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  groups: Group[];

  @Output()
  groupSelected = new EventEmitter<Group>();

  groupCtrl: FormControl = new FormControl();
  groupFilterCtrl: FormControl = new FormControl();
  filteredGroups = new ReplaySubject<Group[]>(1);

  protected _onDestroy = new Subject<void>();

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredGroups.next(this.groups.slice());

    this.groupCtrl.setValue(this.groups[0]);

    this.groupCtrl.valueChanges.subscribe(grp => this.groupSelected.emit(grp));

    this.groupFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterGroups();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterGroups() {
    if (!this.groups) {
      return;
    }
    // get the search keyword
    let search = this.groupFilterCtrl.value;
    if (!search) {
      this.filteredGroups.next(this.groups.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredGroups.next(
      this.groups.filter(option => option.name.toLowerCase().indexOf(search) >=0)
    );
  }

}
