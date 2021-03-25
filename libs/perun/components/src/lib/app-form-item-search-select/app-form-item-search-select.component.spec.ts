import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppFormItemSearchSelectComponent } from './app-form-item-search-select.component';

describe('AppFormItemSearchSelectComponent', () => {
  let component: AppFormItemSearchSelectComponent;
  let fixture: ComponentFixture<AppFormItemSearchSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppFormItemSearchSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppFormItemSearchSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
