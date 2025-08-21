import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetButton } from './fleet-button';

describe('FleetButton', () => {
  let component: FleetButton;
  let fixture: ComponentFixture<FleetButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
