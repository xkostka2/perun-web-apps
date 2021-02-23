import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTokenInfoDialogComponent } from './add-token-info-dialog.component';

describe('AddTokenInfoDialogComponent', () => {
  let component: AddTokenInfoDialogComponent;
  let fixture: ComponentFixture<AddTokenInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTokenInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTokenInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
