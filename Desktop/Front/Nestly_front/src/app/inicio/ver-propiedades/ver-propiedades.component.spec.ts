import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPropiedadesComponent } from './ver-propiedades.component';

describe('VerPropiedadesComponent', () => {
  let component: VerPropiedadesComponent;
  let fixture: ComponentFixture<VerPropiedadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerPropiedadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerPropiedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
