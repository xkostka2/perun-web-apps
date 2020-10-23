import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAuthImgDialogComponent } from './add-auth-img-dialog.component';

describe('AddAuthImgDialogComponent', () => {
  let component: AddAuthImgDialogComponent;
  let fixture: ComponentFixture<AddAuthImgDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAuthImgDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAuthImgDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
