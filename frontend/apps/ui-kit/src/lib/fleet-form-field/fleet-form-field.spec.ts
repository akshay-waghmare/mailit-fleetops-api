import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetFormField } from './fleet-form-field';

describe('FleetFormField', () => {
  let component: FleetFormField;
  let fixture: ComponentFixture<FleetFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetFormField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetFormField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
