import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import { AuthzResolverService, Facility, Group, GroupsManagerService, Vo } from '@perun-web-apps/perun/openapi';
import { Role } from '@perun-web-apps/perun/models';
import { VoService } from '@perun-web-apps/perun/services';

export interface AddGroupManagerDialogData {
  complementaryObject: Vo | Group | Facility;
  availableRoles: Role[];
  theme: string;
  selectedRole: Role;
}

@Component({
  selector: 'app-add-group-manager-dialog',
  templateUrl: './add-group-manager-dialog.component.html',
  styleUrls: ['./add-group-manager-dialog.component.scss']
})
export class AddGroupManagerDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AddGroupManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddGroupManagerDialogData,
    private voService: VoService,
    private authzService: AuthzResolverService,
    private groupService: GroupsManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    protected route: ActivatedRoute,
    protected router: Router
  ) {
    translate.get('DIALOGS.ADD_GROUPS.TITLE').subscribe(value => this.title = value);
    translate.get('DIALOGS.ADD_GROUPS.SUCCESS').subscribe(value => this.successMessage = value);
  }

  title: string;
  searchString = '';
  successMessage: string;

  selection = new SelectionModel<Group>(true, []);
  loading: boolean;
  groups: Group[] = [];
  selected: number;
  vos: Vo[] = [];

  selectedRole: Role;
  filteredOptions: Observable<Vo[]>;
  myControl = new FormControl();
  firstSearchDone = false;

  availableRoles: Role[];
  theme: string;

  displayFn(vo?: Vo): string | undefined {
    return vo ? vo.name : null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.loading = true;
    this.authzService.setRoleWithGroupComplementaryObject({ role: this.selectedRole, authorizedGroups: this.selection.selected.map(group => group.id), complementaryObject: this.data.complementaryObject})
      .subscribe(() => {
        this.notificator.showSuccess(this.successMessage);
        this.loading = false;
        this.dialogRef.close();
    }, () => this.loading = false);
  }

  ngOnInit() {
    this.availableRoles = this.data.availableRoles;
    this.selectedRole = this.data.selectedRole;
    this.theme = this.data.theme;
    this.voService.getVos().subscribe(vos => {
      this.filteredOptions = this.myControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );

      this.vos = vos;
    });
  }

  private _filter(value: string | Vo): Vo[] {
    const filterValue = typeof (value) === 'string' ? value.toLowerCase() : value.name.toLowerCase;
    return this.vos.filter(option => option.name.toLowerCase().includes(<string>filterValue));
  }

  showVoGroups() {
    this.loading = true;
    this.filteredOptions.subscribe( values => {
      if ( values.length !== 0) {
        this.selected = values[0].id;

        this.groupService.getAllGroups(this.selected).subscribe(groups => {
          this.groups = groups;
          this.loading = false;
          this.firstSearchDone = true;
        }, () => this.loading = false);
      }
    }, () => this.loading = false);
  }
}
