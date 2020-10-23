import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAuthenticationComponent } from './settings-authentication.component';

describe('SettingsAuthorizationComponent', () => {
  let component: SettingsAuthenticationComponent;
  let fixture: ComponentFixture<SettingsAuthenticationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsAuthenticationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
