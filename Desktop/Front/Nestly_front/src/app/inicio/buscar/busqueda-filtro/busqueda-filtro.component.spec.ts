import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaFiltroComponent } from './busqueda-filtro.component';

describe('BusquedaFiltroComponent', () => {
  let component: BusquedaFiltroComponent;
  let fixture: ComponentFixture<BusquedaFiltroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusquedaFiltroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaFiltroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
