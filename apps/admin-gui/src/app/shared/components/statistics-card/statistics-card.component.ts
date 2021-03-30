import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-statistics-card',
  templateUrl: './statistics-card.component.html',
  styleUrls: ['./statistics-card.component.scss']
})
export class StatisticsCardComponent implements OnInit {

  constructor() { }

  @Input()
  rowNames: string[] = [];

  @Input()
  title = '';

  @Input()
  statistics: Map<string, any> = new Map<string, any>();

  dataSource: MatTableDataSource<string> = null;
  displayedColumns = ['name', 'value'];


  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<string>(this.rowNames);

  }

}
