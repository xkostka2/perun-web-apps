import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Author, CabinetManagerService, Category, PublicationForGUI } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { Moment } from 'moment';
import { FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { parseFullName } from '@perun-web-apps/perun/utils';

const moment =  _moment;

export const YEAR_MODE_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'perun-web-apps-publication-detail-list',
  templateUrl: './publication-detail-list.component.html',
  styleUrls: ['./publication-detail-list.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS},
  ],
})
export class PublicationDetailListComponent implements OnInit {

  constructor(private cabinetService: CabinetManagerService) { }

  @Input()
  publication: PublicationForGUI
  @Input()
  categories: Category[] = [];

  @Output()
  edited: EventEmitter<boolean> = new EventEmitter<boolean>();

  loading = false;

  dataSource: MatTableDataSource<{key, value}> = null;
  displayedColumns = ['key', 'value'];
  isChanging = new SelectionModel<{key: string, value: string}>(true, []);

  keys: string[];
  values: string[];
  map: { key: string, value: string}[] = [];

  yearControl: FormControl;
  categoryControl: FormControl;
  rankControl: FormControl;
  titleControl: FormControl;
  editing = false;

  maxYear: Moment;


  ngOnInit(): void {
    this.loading = true;
    this.keys = ['Id / Origin', 'Year', 'Category', 'Rank', 'ISBN / ISSN', "DOI", 'Full cite', 'Created by', 'Create date'];
    this.values = [this.publication.id.toString(), this.publication.year.toString(), this.publication.categoryName,
      this.publication.rank.toString(), this.publication.isbn, this.publication.doi, this.publication.main,
      this.publication.createdBy, this.publication.createdDate]

    for(let i = 0; i < this.keys.length; ++i) {
      this.map.push({key: this.keys[i], value: this.values[i]});
    }
    this.dataSource = new MatTableDataSource<{key, value}>(this.map);

    this.titleControl = new FormControl(this.publication.title, Validators.required);
    this.yearControl = new FormControl(moment().year(this.publication.year));
    this.categoryControl = new FormControl(this.publication.categoryName);
    this.rankControl = new FormControl(this.publication.rank,
      [Validators.pattern(/^[0-9]+(\.[0-9])?$/), Validators.required]);

    this.maxYear = moment();

    this.loading = false;
  }

  edit() {
    this.editing = true;
  }

  save() {
    this.loading = true;
    this.editing = false;

    const categoryId = this.categories.find(cat => cat.name === this.categoryControl.value).id;

    const updatedPublication: any = {
      id: this.publication.id,
      externalId: this.publication.externalId,
      publicationSystemId: this.publication.publicationSystemId,
      title: this.titleControl.value,
      year: this.yearControl.value.year(),
      main: this.publication.main,
      isbn: this.publication.isbn,
      doi: this.publication.doi,
      categoryId: categoryId,
      rank: this.rankControl.value,
      locked: this.publication.locked,
      createdBy: this.publication.createdBy,
      createdDate: this.publication.createdDate,
    };

    this.cabinetService.updatePublication({publication: updatedPublication}).subscribe(() => {
      this.edited.emit(true);
      this.loading = false;
    }, () => this.loading = false);
  }

  chosenYearHandler(normalizedYear: Moment, datepicker: any) {
    const ctrlValue = this.yearControl.value;
    ctrlValue.year(normalizedYear.year());
    this.yearControl.setValue(ctrlValue);
    datepicker.close();
  }
}
