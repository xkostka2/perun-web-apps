import {ActivatedRoute} from '@angular/router';
import {Component, HostBinding, OnInit} from '@angular/core';

@Component({
  selector: 'app-vo-attributes',
  templateUrl: './vo-attributes.component.html',
  styleUrls: ['./vo-attributes.component.scss']
})
export class VoAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private route: ActivatedRoute) { }

  voId: number;

  ngOnInit() {
    this.route.parent.params.subscribe(parentParams => {
      this.voId = parentParams['voId'];
    });
  }
}
