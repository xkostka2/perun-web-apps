import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySearchSelectComponent } from './entity-search-select.component';

describe('EntitySearchSelectComponent', () => {
  let component: EntitySearchSelectComponent;
  let fixture: ComponentFixture<EntitySearchSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitySearchSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitySearchSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
