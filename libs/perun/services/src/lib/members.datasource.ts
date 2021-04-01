import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize} from "rxjs/operators";
import { MembersOrderColumn, PaginatedRichMembers, RichMember, SortingOrder } from '@perun-web-apps/perun/openapi';
import { DynamicPaginatingService } from './dynamic-paginating.service';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';



export class MembersDataSource implements DataSource<RichMember> {

  private membersSubject = new BehaviorSubject<RichMember[]>([]);

  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  public allMemberCount = 0;

  public routeAuth = true;

  constructor(private dynamicPaginatingService: DynamicPaginatingService,
              private authzService: GuiAuthResolver) {}

  loadMembers(voId: number,
              attrNames: string[],
              sortOrder: SortingOrder,
              pageIndex: number,
              pageSize: number,
              sortColumn: MembersOrderColumn) {

    this.loadingSubject.next(true);

    this.dynamicPaginatingService.getMembers(voId, attrNames, sortOrder, pageIndex, pageSize, sortColumn).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(paginatedRichMembers => {
      const data: RichMember[] = (<PaginatedRichMembers>paginatedRichMembers).data;
      if(data !== null && data.length !== 0){
        this.routeAuth = this.authzService.isAuthorized('getMemberById_int_policy', [{beanName: 'Vo', id: voId}, data[0]]);
      }
      this.allMemberCount = (<PaginatedRichMembers>paginatedRichMembers).totalCount;
      this.membersSubject.next((<PaginatedRichMembers>paginatedRichMembers).data);
    });

  }

  connect(collectionViewer: CollectionViewer): Observable<RichMember[]> {
    return this.membersSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.membersSubject.complete();
    this.loadingSubject.complete();
  }

  getData(): RichMember[] {
    return this.membersSubject.value;
  }
}
