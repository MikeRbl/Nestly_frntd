import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlquilarCasaComponent } from './alquilar-casa.component';

describe('AlquilarCasaComponent', () => {
  let component: AlquilarCasaComponent;
  let fixture: ComponentFixture<AlquilarCasaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlquilarCasaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlquilarCasaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
