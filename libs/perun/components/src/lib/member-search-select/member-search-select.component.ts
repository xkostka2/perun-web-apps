import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { parseFullName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-member-search-select',
  templateUrl: './member-search-select.component.html',
  styleUrls: ['./member-search-select.component.css']
})
export class MemberSearchSelectComponent implements OnInit, OnChanges, OnDestroy {


  constructor() { }

  @Input()
  members: RichMember[];

  @Output()
  memberSelected = new EventEmitter<RichMember>();

  memberCtrl: FormControl = new FormControl();
  memberFilterCtrl: FormControl = new FormControl();
  filteredMembers = new ReplaySubject<RichMember[]>(1);

  protected _onDestroy = new Subject<void>();

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredMembers.next(this.members.slice());

    this.memberCtrl.setValue(this.members[0]);

    this.memberCtrl.valueChanges.subscribe(member => this.memberSelected.emit(member));

    this.memberFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterMembers();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterMembers() {
    if (!this.members) {
      return;
    }
    // get the search keyword
    let search = this.memberFilterCtrl.value;
    if (!search) {
      this.filteredMembers.next(this.members.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredMembers.next(
      this.members.filter(option => parseFullName(option.user).toLowerCase().indexOf(search) >=0)
    );
  }

}
