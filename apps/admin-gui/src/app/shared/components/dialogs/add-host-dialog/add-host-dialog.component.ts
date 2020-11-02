import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FacilitiesManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';

export interface AddHostDialogData {
  theme: string;
  facilityId: number;
  facilityName: string;
}

@Component({
  selector: 'app-add-host-dialog',
  templateUrl: './add-host-dialog.component.html',
  styleUrls: ['./add-host-dialog.component.scss']
})

export class AddHostDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AddHostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddHostDialogData,
    public facilitiesManager: FacilitiesManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService) { }

  theme: string;
  facilityName: string;
  loading = false;
  hostsCtrl: FormControl;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.facilityName= this.data.facilityName;
    this.hostsCtrl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
    this.hostsCtrl.markAllAsTouched();
  }

  onAdd(){
    this.loading = true;
    const hostNames = this.hostsCtrl.value.split("\n");
    let generatedHostNames: string[] = [];

    for (const name of hostNames){
      generatedHostNames = generatedHostNames.concat(this.parseHostName(name));
    }

    this.facilitiesManager.addHosts(this.data.facilityId, generatedHostNames).subscribe(() =>{
      this.notificator.showSuccess(this.translate.instant('DIALOGS.ADD_HOST.SUCCESS'));
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  parseHostName(name: string){
    const rangeRegex = new RegExp('\[[0-9]+-[0-9]+\]','g');
    const prefixes = name.split(rangeRegex);
    const suffixes = name.match(rangeRegex);

    if(suffixes == null){
      if (name === ""){
        return []
      }
      return [name];
    }

    let nameParts: string[][]= [];

    for(let i = 0; i < prefixes.length - 1; i++) {
      const [from, to] = this.parseRange(suffixes[i]);
      let parts = [];

      for(let j = from; j <= to; j++){
        parts = parts.concat(prefixes[i].concat(j.toString()));
      }
      nameParts = nameParts.concat([parts]);
    }
    nameParts = nameParts.concat([prefixes[prefixes.length - 1]]);

    return this.joinHostNames(nameParts, 0);
  }

  parseRange(range: string){
    const [lower, upper] = range.split("-");

    const from = parseInt(lower.substring(1, lower.length), 10);
    const to = parseInt(upper.substring(0, upper.length), 10);

    return [from, to];
  }

  joinHostNames(nameParts: string[][], position: number){
    if (position === nameParts.length - 1){
      return [nameParts[position]];
    }

    const suffixes = this.joinHostNames(nameParts, position + 1);
    const joinedNames = [];

    for (const name of nameParts[position]){
      for(const suffix of suffixes){
        joinedNames.push(name.concat(suffix));
      }
    }
    return joinedNames
  }

}
