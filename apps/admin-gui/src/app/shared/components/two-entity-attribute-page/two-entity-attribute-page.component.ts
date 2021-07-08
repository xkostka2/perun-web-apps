import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  Attribute,
  AttributesManagerService, FacilitiesManagerService,
  Facility, Group, GroupsManagerService, MembersManagerService,
  Resource,
  ResourcesManagerService, RichMember, User
} from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { AttributesListComponent } from '@perun-web-apps/perun/components';
import { SelectionModel } from '@angular/cdk/collections';
import { DeleteAttributeDialogComponent } from '../dialogs/delete-attribute-dialog/delete-attribute-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
import { CreateAttributeDialogComponent } from '../dialogs/create-attribute-dialog/create-attribute-dialog.component';
import { Urns } from '@perun-web-apps/perun/urns';

@Component({
  selector: 'app-two-entity-attribute-page',
  templateUrl: './two-entity-attribute-page.component.html',
  styleUrls: ['./two-entity-attribute-page.component.scss']
})
export class TwoEntityAttributePageComponent implements OnInit {

  constructor(private attributesManagerService: AttributesManagerService,
              private resourcesManagerService: ResourcesManagerService,
              private facilitiesManagerService: FacilitiesManagerService,
              private groupsManagerService: GroupsManagerService,
              private membersManager: MembersManagerService,
              private dialog: MatDialog) {
  }

  @ViewChild('list')
  list: AttributesListComponent;

  @Input()
  firstEntityId: number;

  @Input()
  firstEntity: string;

  @Input()
  secondEntity: string;

  entityValues: Resource[] | Facility[] | Group[] | RichMember[] | User[] = [];
  attributes: Attribute[] = [];
  selection = new SelectionModel<Attribute>(true, []);
  specificSecondEntity: Resource | Facility | Group | RichMember | User;
  allowedStatuses: string[] =  ['INVALID', 'VALID'];

  loading = false;
  innerLoading = false;

  noEntityMessage: string;

  ngOnInit(): void {
    this.loadEntityValues();
    this.setMessages(this.secondEntity.toLowerCase());
  }

  loadEntityValues() {
    this.loading = true;
    switch (this.firstEntity) {
      case 'member':
        switch (this.secondEntity) {
          case 'resource':
            this.resourcesManagerService.getAllowedResources(this.firstEntityId).subscribe(resources => {
              this.entityValues = resources;
              this.preselectEntity();
              this.loading = false;
            })
            break;
          case 'group':
            this.groupsManagerService.getMemberGroups(this.firstEntityId).subscribe(groups => {
              this.entityValues = groups;
              this.preselectEntity();
              this.loading = false;
            })
        }
        break;
      case 'group':
        switch (this.secondEntity){
          case 'resource':
            this.resourcesManagerService.getAssignedResourcesWithGroup(this.firstEntityId).subscribe(resources => {
              this.entityValues = resources;
              this.preselectEntity();
              this.loading = false;
            });
            break;
          case 'member':
            // return one attribute because if an empty list is passed, all attributes are returned
            this.membersManager.getCompleteRichMembersForGroup(this.firstEntityId, false, this.allowedStatuses, null, [Urns.MEMBER_CORE_ID]).subscribe(members => {
              this.entityValues = members;
              this.preselectEntity();
              this.loading = false;
            });
            break;
        }
        break;
      case 'user':
        this.facilitiesManagerService.getAssignedFacilitiesByUser(this.firstEntityId).subscribe(facilities => {
          this.entityValues = facilities;
          this.preselectEntity();
          this.loading = false;
        });
        break;
      case 'resource':
        switch (this.secondEntity){
          case 'member':
            this.resourcesManagerService.getAssignedRichMembers(this.firstEntityId).subscribe(members => {
              this.entityValues = members;
              this.preselectEntity();
              this.loading = false;
            })
            break;
          case 'group':
            this.resourcesManagerService.getAssignedGroups(this.firstEntityId).subscribe(groups => {
              this.entityValues = groups;
              this.preselectEntity();
              this.loading = false;
            })
            break;
        }
        break;
      case 'facility':
        this.facilitiesManagerService.getAssignedUsers(this.firstEntityId).subscribe(users => {
          this.entityValues = users;
          this.preselectEntity();
          this.loading = false;
        })
        break;
    }
  }

  preselectEntity() {
    if(this.entityValues.length !== 0){
      this.specifySecondEntity(this.entityValues[0]);
    }
  }

  getAttributes(entityId: number) {
    this.innerLoading = true;
    switch (this.firstEntity) {
      case 'member':
        switch (this.secondEntity) {
          case 'resource':
            this.attributesManagerService.getMemberResourceAttributes(this.firstEntityId, entityId).subscribe(attributes => {
              this.attributes = attributes;
              this.innerLoading = false;
            });
            break;
          case 'group':
            this.attributesManagerService.getMemberGroupAttributes(this.firstEntityId, entityId).subscribe(attributes => {
              this.attributes = attributes;
              this.innerLoading = false;
            });
        }
        break;
      case 'group':
        switch (this.secondEntity){
          case 'resource':
            this.attributesManagerService.getGroupResourceAttributes(this.firstEntityId, entityId).subscribe(attributes => {
              this.attributes = attributes;
              this.innerLoading = false;
            });
            break;
          case 'member':
            this.attributesManagerService.getMemberGroupAttributes(entityId, this.firstEntityId).subscribe(attributes => {
              this.attributes = attributes;
              this.innerLoading = false
            });
            break;
        }
        break;
      case 'user':
        this.attributesManagerService.getUserFacilityAttributes(this.firstEntityId, entityId).subscribe(attributes => {
          this.attributes = attributes;
          this.innerLoading = false;
        });
        break;
      case 'resource':
        switch (this.secondEntity){
          case 'member':
            this.attributesManagerService.getMemberResourceAttributes(entityId, this.firstEntityId).subscribe(attributes => {
              this.attributes = attributes;
              this.innerLoading = false;
            });
            break;
          case 'group':
            this.attributesManagerService.getGroupResourceAttributes(entityId, this.firstEntityId).subscribe(attributes => {
              this.attributes = attributes;
              this.innerLoading = false;
            });
            break;
        }
        break;
      case 'facility':
        this.attributesManagerService.getUserFacilityAttributes(entityId, this.firstEntityId).subscribe(attributes => {
          this.attributes = attributes;
          this.innerLoading = false;
        });
        break;
    }
  }

  setMessages(entity: string) {
    this.noEntityMessage = `No ${entity} assigned`
  }

  onSave(entityId: number) {
    // have to use this to update attribute with map in it, before saving it
    this.list.updateMapAttributes();

    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.firstEntityId,
      entity: this.firstEntity,
      secondEntity: this.secondEntity,
      secondEntityId: entityId,
      attributes: this.selection.selected,
    };

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selection.clear();
        this.getAttributes(entityId);
      }
    });
  }

  onDelete(entityId: number) {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.firstEntityId,
      entity: this.firstEntity,
      secondEntity: this.secondEntity,
      secondEntityId: entityId,
      attributes: this.selection.selected,
      theme: `${this.firstEntity}-theme`
    };

    const dialogRef = this.dialog.open(DeleteAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(didConfirm => {
      if (didConfirm) {
        this.selection.clear();
        this.getAttributes(entityId);
      }
    });
  }

  onAdd(entityId: number){
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.firstEntityId,
      entity: this.firstEntity,
      secondEntity: this.secondEntity,
      secondEntityId: entityId,
      notEmptyAttributes: this.attributes,
      style: `${this.firstEntity}-theme`
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selection.clear();
        this.getAttributes(entityId);
      }
    });
  }

  specifySecondEntity (entity: Group | Facility | Resource | RichMember | User){
    if(entity){
      this.specificSecondEntity = entity;
      this.getAttributes(this.specificSecondEntity.id);
    }
  }
}
