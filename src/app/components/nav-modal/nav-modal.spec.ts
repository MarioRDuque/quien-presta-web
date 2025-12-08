import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavModal } from './nav-modal';

describe('NavModal', () => {
  let component: NavModal;
  let fixture: ComponentFixture<NavModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
