import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Group, GroupsManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FormControl } from '@angular/forms';
import { parseFullName } from '@perun-web-apps/perun/utils';

export interface MemberTreeViewDialogData {
  member: RichMember;
  groupId: number;
}

interface GroupNode {
  name: string;
  id: number;
  direct: boolean;
  description: string;
  include: boolean;
  level: number;
  children?: GroupNode[];
}

@Component({
  selector: 'perun-web-apps-member-tree-view-dialog',
  templateUrl: './member-tree-view-dialog.component.html',
  styleUrls: ['./member-tree-view-dialog.component.scss']
})
export class MemberTreeViewDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MemberTreeViewDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: MemberTreeViewDialogData,
              private groupsManagerService: GroupsManagerService) {
  }

  treeControl = new NestedTreeControl<GroupNode>(node => node.children);
  loading: boolean;
  dataSource = new MatTreeNestedDataSource<GroupNode>();
  groupTree: GroupNode[] = [];
  paths: Group[][] = [];
  formControl = new FormControl('');
  userName = '';

  recursiveSearch(currentTree: GroupNode[], path: Group[], index: number): GroupNode[] {
    for (let i = 0; i < currentTree.length; i++) {
      if (currentTree[i].name === path[index].name) {
        if (path.length === index + 1) {
          currentTree[i].direct = true;
          return currentTree;
        }
        index++;
        if (!path[index].name.includes(path[index - 1].name)) {
          const newNode: GroupNode = {
            name: path[index].name,
            id: path[index - 1].id,
            description: path[index].description,
            direct: false,
            include: true,
            level: index,
            children: []
          };
          currentTree[i].children = [newNode].concat(currentTree[i].children);
        } else {
          currentTree[i].children = this.recursiveSearch(currentTree[i].children, path, index);
        }
        return currentTree;
      }
    }

    const newNode: GroupNode = {
      name: path[index].name,
      id: path[index].id,
      description: path[index].description,
      direct: false,
      include: false,
      level: index,
      children: []
    };
    currentTree.push(newNode);
    return this.recursiveSearch(currentTree, path, index);
  }

  createGroupTree(paths: Group[][]) {
    this.groupTree = [];
    paths.forEach(path => {
      this.groupTree = this.recursiveSearch(this.groupTree, path, 0);
    });
    if (this.groupTree.length){
      this.groupTree = this.groupTree[0].children;
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.groupsManagerService.getIndirectMembershipPaths(this.data.member.id, this.data.groupId).subscribe(paths => {
      this.paths = paths;
      this.createGroupTree(this.paths);
      this.dataSource.data = this.groupTree;
      this.loading = false;
    });
    this.formControl.valueChanges.subscribe(value => {
      const filterValue = value.trim().toLowerCase();
      const filteredPaths = this.paths.filter(p => p.filter(g => g.name.includes(filterValue)).length);
      this.createGroupTree(filteredPaths);
      this.dataSource.data = this.groupTree;
    });
    this.userName = parseFullName(this.data.member.user);
  }

  hasChild = (_: number, node: GroupNode) => !!node.children && node.children.length > 0;

  onCancel() {
    this.dialogRef.close();
  }

  navigate(groupId: number, isInclude = false) {
    window.open(`/organizations/${this.data.member.voId}/groups/${groupId}${isInclude ? '/settings/relations' : ''}`, '_blank');
  }

  getMinWidth(level: number): string {
    return 400 - level * 40 + 'px';
  }
}
