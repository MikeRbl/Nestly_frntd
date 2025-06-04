import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroLateralComponent } from './filtro-lateral.component';

describe('FiltroLateralComponent', () => {
  let component: FiltroLateralComponent;
  let fixture: ComponentFixture<FiltroLateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltroLateralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroLateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
