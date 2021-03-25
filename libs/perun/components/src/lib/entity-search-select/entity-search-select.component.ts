import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationFormItem, PerunBean } from '@perun-web-apps/perun/openapi';
import { stringify } from 'querystring';

@Component({
  selector: 'perun-web-apps-entity-search-select',
  templateUrl: './entity-search-select.component.html',
  styleUrls: ['./entity-search-select.component.css']
})
export class EntitySearchSelectComponent<T extends PerunBean> implements OnInit, OnChanges, OnDestroy {

  constructor(
    public cd: ChangeDetectorRef,
  ) { }

  @Input()
  entities: T[];

  @Input()
  selectPlaceholder = 'Select';

  @Input()
  findPlaceholder = 'Find...';

  @Input()
  noEntriesText = 'Nothing found';

  @Input()
  disableAutoSelect = false;

  @Input()
  entity: T = null;

  @Output()
  entitySelected = new EventEmitter<T>();

  @ViewChild('scrollViewport', {static: false})
  scrollViewport: CdkVirtualScrollViewport;

  entitiesCtrl: FormControl = new FormControl();
  entityFilterCtrl: FormControl = new FormControl();
  filteredEntities = new ReplaySubject<T[]>(1);

  private entitiesLen = 0;

  protected _onDestroy = new Subject<void>();

  @Input()
  searchFunction: (entity: T) => string;

  @Input()
  mainTextFunction: (entity: T) => string = entity => stringify(entity);

  @Input()
  secondaryTextFunction: (entity: T) => string = entity => '#' + entity.id;


  ngOnInit(): void {
    this.entitiesCtrl.valueChanges.subscribe(entity => this.entitySelected.emit(entity));

    if (!this.disableAutoSelect && this.entity === null) {
      this.entitiesCtrl.setValue(this.entities[0]);
    }

    this.filteredEntities.subscribe((entities) => this.entitiesLen = entities.length);

    this.entityFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterEntites();
      });

    if (this.entity !== null) {
      this.entitiesCtrl.setValue(this.entity);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['entities']) {

      this.filteredEntities.next(this.entities.slice());
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterEntites() {
    if (!this.entities) {
      return;
    }
    // get the search keyword
    let search = this.entityFilterCtrl.value;
    if (!search) {
      this.filteredEntities.next(this.entities.slice());
      this.cd.detectChanges();
      return;
    } else {
      search = this.normalize(search);
    }
    // filter the banks
    this.filteredEntities.next(
      this.entities.filter(entity => this.normalize(this.searchFunction(entity)).indexOf(search) >=0)
    );
    this.cd.detectChanges();
  }

  /**
   * Transforms given string to ASCII and lower case
   * @param data
   */
  normalize(data: string): string {
    return data.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  openChange($event: boolean) {
    this.scrollViewport.scrollToIndex(0);
    this.scrollViewport.checkViewportSize();
  }

  getViewportHeight() {
    let height = this.entitiesLen * 48;
    if (height > 192) {
      height = 192;
    }
    if (!!this.scrollViewport) {
      this.scrollViewport.checkViewportSize();
    }
    return height;
  }
}
