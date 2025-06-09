import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPropiedadComponent } from './editar-propiedad.component';

describe('EditarPropiedadComponent', () => {
  let component: EditarPropiedadComponent;
  let fixture: ComponentFixture<EditarPropiedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarPropiedadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPropiedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
