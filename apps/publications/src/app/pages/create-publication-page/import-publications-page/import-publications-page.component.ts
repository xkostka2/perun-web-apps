import { Component, OnInit } from '@angular/core';
import {
  CabinetManagerService,
  Publication,
  PublicationForGUI,
  PublicationSystem
} from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import {
  TABLE_IMPORT_PUBLICATIONS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { UniversalConfirmationDialogComponent } from '@perun-web-apps/perun/dialogs';

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
  selector: 'perun-web-apps-import-publications-page',
  templateUrl: './import-publications-page.component.html',
  styleUrls: ['./import-publications-page.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS}
  ]
})
export class ImportPublicationsPageComponent implements OnInit {

  constructor(private cabinetService: CabinetManagerService,
              private storeService: StoreService,
              private tableConfigService: TableConfigService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private router: Router,
              private dialog: MatDialog,
              ) { }

  loading = false;
  publicationSystems: PublicationSystem[] = [];
  pubSystem = new FormControl();
  pubSystemNamespace: string;
  publications: PublicationForGUI[] = [];

  selected = new SelectionModel<PublicationForGUI>(true, []);
  pageSize: number;
  tableId = TABLE_IMPORT_PUBLICATIONS;
  displayedColumns = ['select', 'id', 'lock', 'title', 'reportedBy', 'year', 'category'];
  firstSearchDone: boolean;

  startYear: FormControl;
  endYear: FormControl;

  userId: number;
  userAsAuthor = true;

  importedPublications: Publication[] = [];
  importDone = false;
  indexExpanded: number;
  completePublications: number[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.firstSearchDone = false;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.userId = this.storeService.getPerunPrincipal().user.id;

    this.startYear = new FormControl(moment().subtract(1, 'year'));
    this.endYear = new FormControl(moment());

    this.cabinetService.getPublicationSystems().subscribe(publicationSystems => {
      this.publicationSystems = publicationSystems.filter(ps => ps.friendlyName !== "INTERNAL");
      this.pubSystem.setValue(this.publicationSystems[0]);
      this.pubSystemNamespace = this.pubSystem.value.loginNamespace;
      this.loading = false;
    });
  }

  selectPubSystem() {
    this.pubSystemNamespace = this.pubSystem.value.loginNamespace;
  }

  searchPublications() {
    this.loading = true;
    this.firstSearchDone = true;

    this.cabinetService.findExternalPublications(
      this.storeService.getPerunPrincipal().user.id,
      this.startYear.value.year(),
      this.endYear.value.year(),
      this.pubSystemNamespace
    ).subscribe(publications => {
      this.publications = publications;
      this.loading = false;
    }, () => this.loading = false);
  }

  importPublications(publications: PublicationForGUI[]) {
    this.loading = true;
    if (publications.length === 0) {
      this.notificator.showSuccess(this.translate.instant('IMPORT_PUBLICATIONS.SUCCESS'));
      this.importDone = true;
      this.indexExpanded = 0;
      this.loading = false;
      return;
    }
    const publication = publications.shift();
    const publicationInput: any = {
      publication: {
        title: publication.title,
        categoryId: publication.categoryId,
        year: publication.year,
        isbn: publication.isbn,
        doi: publication.doi,
        main: publication.main
      }
    };

    this.cabinetService.createPublication(publicationInput).subscribe(pub => {
      if(this.userAsAuthor){
        this.cabinetService.createAutorship({authorship:
            {id: 0, beanName: 'Authorship', publicationId: pub.id, userId: this.userId}}).subscribe(() => {
          this.importedPublications.push(pub);
          this.importPublications(publications);
        }, ()=> this.loading = false);
      } else {
        this.importedPublications.push(pub);
        this.importPublications(publications);
      }
    }, () => this.loading = false);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  editPublication(index: number) {
    this.indexExpanded = index === this.indexExpanded ? -1 : index;
  }

  completePublication(publicationId: number, indexExpanded: number) {
    if (!this.completePublications.includes(publicationId)) {
      this.completePublications.push(publicationId);
    }
    if (indexExpanded !== this.importedPublications.length - 1) {
      this.indexExpanded = indexExpanded + 1;
    } else {
      this.indexExpanded = -1;
    }
  }

  incompletePublication(publicationId: number) {
    if (this.completePublications.includes(publicationId)) {
      this.completePublications = this.completePublications.filter(pubId => pubId !== publicationId);
    }
    this.indexExpanded = -1;
  }

  completeAllPublications() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'user-theme',
      message: this.translate.instant('IMPORT_PUBLICATIONS.CHECK_ALL_MESSAGE')
    };

    const dialogRef = this.dialog.open(UniversalConfirmationDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onSubmit();
      }
    });
  }

  onSubmit() {
    this.notificator.showSuccess(this.translate.instant('IMPORT_PUBLICATIONS.SHOW_FINISH'));
    this.router.navigate(['/my-publications'])
  }

}
