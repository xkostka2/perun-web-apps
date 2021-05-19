import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Author,
  CabinetManagerService,
  Category, PublicationForGUI,
  ThanksForGUI, UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { Moment } from 'moment-timezone';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { FilterPublication } from '../../../components/publication-filter/publication-filter.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatTabGroup } from '@angular/material/tabs';

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
  selector: 'perun-web-apps-create-single-publication-page',
  templateUrl: './create-single-publication-page.component.html',
  styleUrls: ['./create-single-publication-page.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS}
  ]
})
export class CreateSinglePublicationPageComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private cabinetService: CabinetManagerService,
              private dialog: MatDialog,
              private router: Router,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private storeService: StoreService,
              private userService: UsersManagerService) { }

  publicationControl: FormGroup;
  similarPublications: PublicationForGUI[] = [];
  filteredPublications: PublicationForGUI[] =[];
  categories: Category[] = [];

  publication: PublicationForGUI = null;

  authorsSelection: SelectionModel<Author> = new SelectionModel<Author>(true, []);
  thanksSelection: SelectionModel<ThanksForGUI> = new SelectionModel<ThanksForGUI>(true, []);

  innerLoading = false;

  maxYear: Moment;

  loading = false;
  duplicateCheck = false;

  selectedPubId = null;
  selectedPubTitle = '';

  ngOnInit(): void {
    this.loading = true;
    this.publicationControl = this.formBuilder.group({
      addAuthor: [false],
      title: ['', Validators.required],
      year: ['', Validators.required],
      category: ['', Validators.required],
      ISBN: [''],
      DOI: [''],
      cite: ['', Validators.required],
      }
    );

    this.maxYear = moment();

    this.cabinetService.getCategories().subscribe(categories => {
      this.categories = categories;
        this.loading = false;
    });
  }

  chosenYearHandler(normalizedYear: Moment, datepicker: any) {
    this.publicationControl.get('year').setValue(normalizedYear);
    datepicker.close();
  }


  createTimeout() {
    setTimeout(() => {
      this.notificator.showSuccess(this.translate.instant('CREATE_SINGLE_PUBLICATION.SUCCESS'));
      this.duplicateCheck = true;
      this.innerLoading = false;
    }, 1000);
  }

  createPublication(){
    this.innerLoading = true;
    this.duplicateCheck = true;
    const publicationInput: any = {
      publication: {
        title: this.publicationControl.get("title").value,
        categoryId: this.publicationControl.get("category").value.id,
        year: this.publicationControl.get("year").value.year(),
        isbn: this.publicationControl.get("ISBN").value,
        doi: this.publicationControl.get("DOI").value,
        main: this.publicationControl.get("cite").value
      }
    };
    this.userService.getRichUserWithAttributes(this.storeService.getPerunPrincipal().userId).subscribe(user => {
      const mailAtt = user.userAttributes.filter(att => att.friendlyName === "preferredMail")
      if (mailAtt.length !== 0){
        publicationInput.publication.createdBy = mailAtt[0].value
      }

      this.cabinetService.createPublication(publicationInput).subscribe(publication => {
        this.publication = publication;
        if(this.publicationControl.get("addAuthor").value){
          this.cabinetService.createAutorship({authorship:
              {id: 0, beanName: 'Authorship', publicationId: this.publication.id, userId: user.id}}).subscribe(() => {
                this.createTimeout();
            }
          , ()=> this.innerLoading = false);
        } else {
          this.createTimeout();
        }

      }, () => this.innerLoading = false);
    }, () => this.innerLoading = false);
  }

  similarCheck(){
    this.innerLoading = true;
    const title: string = !!this.publicationControl.get('title').value ? this.publicationControl.get('title').value : null;
    const doi: string = !!this.publicationControl.get('DOI').value ? this.publicationControl.get('DOI').value : null;
    const isbn: string = !!this.publicationControl.get('ISBN').value ? this.publicationControl.get('ISBN').value : null;
    this.cabinetService.findSimilarPublications(title, doi, isbn).subscribe(similarPubs => {
      this.similarPublications = similarPubs;
      this.filteredPublications = similarPubs;
      setTimeout(() => {
        this.duplicateCheck = similarPubs.length === 0;
        this.innerLoading = false;}, 2000);
    });
  }

  stepChanged(event: StepperSelectionEvent) {
    if(event.selectedIndex === 1){
      this.similarCheck();
    }
    if(event.selectedIndex === 2 && this.publication === null){
      this.createPublication();
    }
  }

  redirect(commands) {
    this.router.navigate(commands)
  }

  loadPublicationDetail(publication: PublicationForGUI, tabGroup: MatTabGroup) {
    this.selectedPubId = publication.id;
    this.selectedPubTitle = publication.title;
    tabGroup.selectedIndex = 1;
  }
}
