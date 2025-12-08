import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sponsors } from './sponsors';

describe('Sponsors', () => {
  let component: Sponsors;
  let fixture: ComponentFixture<Sponsors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sponsors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sponsors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
