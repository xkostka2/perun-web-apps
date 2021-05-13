import { Injectable } from '@angular/core';
import {
  MembersManagerService,
  MembersOrderColumn,
  PaginatedRichMembers,
  SortingOrder, VoMemberStatuses
} from '@perun-web-apps/perun/openapi';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicPaginatingService {

  constructor(private membersService: MembersManagerService) { }

  getMembers(voId: number,
             attrNames: string[],
             sortOrder: SortingOrder,
             pageNumber: number,
             pageSize : number,
             sortColumn: MembersOrderColumn,
             statuses: VoMemberStatuses[],
             searchString?: string): Observable<PaginatedRichMembers> {
    return this.membersService.getMembersPage({
      vo: voId,
      attrNames: attrNames,
      query: {pageSize: pageSize,
        offset: pageNumber*pageSize,
        order: sortOrder,
        sortColumn: sortColumn,
        statuses: statuses,
        searchString: searchString}})

  }
}
