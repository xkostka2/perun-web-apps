import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Group, GroupsManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

export interface MemberTreeViewDialogData {
  member: RichMember;
  groupId: number;
}

interface GroupNode {
  name: string;
  id: number;
  direct: boolean;
  children?: GroupNode[];
  includes?: string[];
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

  recursiveSearch(currentTree: GroupNode[], path: Group[], index: number): GroupNode[]{
    for (let i = 0; i < currentTree.length; i++) {
      if(currentTree[i].name === path[index].name){
        if(path.length === index+1){
          currentTree[i].direct = true;
          return currentTree;
        }
        index++;
        if(!path[index].name.includes(path[index-1].name)){
          currentTree[i].includes.push(path[index].name)
        }else {
          currentTree[i].children = this.recursiveSearch(currentTree[i].children, path, index);
        }
        return currentTree;
      }
    }

    const newNode: GroupNode = {
      name: path[index].name,
      id: path[index].id,
      direct: false,
      children: [],
      includes: []
    }
    currentTree.push(newNode)
    return this.recursiveSearch(currentTree, path, index)
  }

  ngOnInit(): void {
    this.loading = true;
    this.groupsManagerService.getIndirectMembershipPaths(this.data.member.id, this.data.groupId).subscribe(paths => {
      paths.forEach(path => {
        this.groupTree = this.recursiveSearch(this.groupTree, path, 0)
      });
      this.dataSource.data = this.groupTree;
      this.loading = false;
    });
  }

  hasChild = (_: number, node: GroupNode) => !!node.children && node.children.length > 0;

  onCancel() {
    this.dialogRef.close();
  }

  navigate(groupId: number, isInclude = false) {
    window.open(`/organizations/${this.data.member.voId}/groups/${groupId}${isInclude ? '/settings/relations' : ''}`, '_blank');
  }
}
