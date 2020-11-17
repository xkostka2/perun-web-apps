import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { User } from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { parseFullName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-user-search-select',
  templateUrl: './user-search-select.component.html',
  styleUrls: ['./user-search-select.component.css']
})
export class UserSearchSelectComponent implements OnInit, OnChanges, OnDestroy {


  constructor() { }

  @Input()
  users: User[];

  @Output()
  userSelected = new EventEmitter<User>();

  userCtrl: FormControl = new FormControl();
  userFilterCtrl: FormControl = new FormControl();
  filteredUsers = new ReplaySubject<User[]>(1);

  protected _onDestroy = new Subject<void>();

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredUsers.next(this.users.slice());

    this.userCtrl.setValue(this.users[0]);

    this.userCtrl.valueChanges.subscribe(resource => this.userSelected.emit(resource));

    this.userFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterUsers();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterUsers() {
    if (!this.users) {
      return;
    }
    // get the search keyword
    let search = this.userFilterCtrl.value;
    if (!search) {
      this.filteredUsers.next(this.users.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredUsers.next(
      this.users.filter(option => parseFullName(option).toLowerCase().indexOf(search) >=0)
    );
  }
}
