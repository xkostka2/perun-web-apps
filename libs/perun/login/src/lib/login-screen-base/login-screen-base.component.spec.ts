import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginScreenBaseComponent } from './login-screen-base.component';

describe('LoginScreenBaseComponent', () => {
  let component: LoginScreenBaseComponent;
  let fixture: ComponentFixture<LoginScreenBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginScreenBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginScreenBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
