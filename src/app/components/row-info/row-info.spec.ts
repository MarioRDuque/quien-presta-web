import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowInfo } from './row-info';

describe('RowInfo', () => {
  let component: RowInfo;
  let fixture: ComponentFixture<RowInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
