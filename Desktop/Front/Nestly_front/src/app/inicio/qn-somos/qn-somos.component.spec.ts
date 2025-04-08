import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QnSomosComponent } from './qn-somos.component';

describe('QnSomosComponent', () => {
  let component: QnSomosComponent;
  let fixture: ComponentFixture<QnSomosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QnSomosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QnSomosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
