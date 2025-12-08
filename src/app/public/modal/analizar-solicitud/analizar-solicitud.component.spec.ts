import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalizarSolicitud } from './analizar-solicitud.component';

describe('AnalizarSolicitud', () => {
  let component: AnalizarSolicitud;
  let fixture: ComponentFixture<AnalizarSolicitud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalizarSolicitud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalizarSolicitud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
