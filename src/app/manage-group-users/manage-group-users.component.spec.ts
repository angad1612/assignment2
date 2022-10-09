import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGroupUsersComponent } from './manage-group-users.component';

describe('ManageGroupUsersComponent', () => {
  let component: ManageGroupUsersComponent;
  let fixture: ComponentFixture<ManageGroupUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageGroupUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGroupUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
