import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPropiedadesComponent } from './gestion-propiedades.component';

describe('GestionPropiedadesComponent', () => {
  let component: GestionPropiedadesComponent;
  let fixture: ComponentFixture<GestionPropiedadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionPropiedadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPropiedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
