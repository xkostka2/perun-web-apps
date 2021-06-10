import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-create-publication-page',
  templateUrl: './create-publication-page.component.html',
  styleUrls: ['./create-publication-page.component.scss']
})
export class CreatePublicationPageComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  importPublications() {
    this.router.navigate(["create-publication", "import"]);
  }

  createPublication() {
    this.router.navigate(["create-publication", "create"]);
  }
}
