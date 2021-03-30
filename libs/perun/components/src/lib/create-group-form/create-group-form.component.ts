import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { StoreService } from '@perun-web-apps/perun/services';
import { Group } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-create-group-form',
  templateUrl: './create-group-form.component.html',
  styleUrls: ['./create-group-form.component.css']
})
export class CreateGroupFormComponent implements OnInit {

  constructor(private store: StoreService) { }

  @Input()
  parentGroup: Group = null;

  @Input()
  voGroups: Group[] = [];

  isNotSubGroup: boolean;
  asSubgroup = false;
  invalidNameMessage = this.store.get('groupNameErrorMessage');
  secondaryRegex = this.store.get('groupNameSecondaryRegex');
  nameControl: FormControl;
  descriptionControl: FormControl;
  selectedParent: Group;

  @Output()
  nameChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  descriptionChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  parentGroupChanged: EventEmitter<Group> = new EventEmitter<Group>();
  @Output()
  asSubgroupChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.isNotSubGroup = (this.parentGroup === null);
    this.nameControl = new FormControl('', [Validators.required, Validators.pattern(this.secondaryRegex ? this.secondaryRegex : ''), Validators.pattern('.*[\\S]+.*')]);
    this.descriptionControl = new FormControl('', [Validators.required, Validators.maxLength(129)]);
    this.selectedParent = null;
    this.voGroups = this.voGroups.filter(grp => grp.name !== 'members');
  }

  emitName() {
    if (this.nameControl.invalid) {
      this.nameChanged.emit('');
    } else {
      this.nameChanged.emit(this.nameControl.value);
    }
  }

  emitDescription() {
    if (this.descriptionControl.invalid) {
      this.descriptionChanged.emit('');
    } else {
      this.descriptionChanged.emit(this.descriptionControl.value);
    }
  }

  emitParentGroup(parent: Group) {
    this.selectedParent = parent;

    this.parentGroupChanged.emit(parent);
  }

  emitAsSubGroup() {
    if (!this.asSubgroup) {
      this.emitParentGroup(null);
    }
    this.asSubgroupChanged.emit(this.asSubgroup);
  }
}
