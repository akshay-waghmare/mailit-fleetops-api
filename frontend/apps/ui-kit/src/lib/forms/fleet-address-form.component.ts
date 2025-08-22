import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'fleet-address-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="address-form" [formGroup]="parentForm">
      <h4 class="text-lg font-medium text-slate-700 mb-4">
        {{getAddressTitle()}} Address
      </h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Contact Name</mat-label>
          <input matInput 
                 [formControlName]="getControlName('Name')"
                 placeholder="Full Name"
                 [required]="isRequired">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Contact Number</mat-label>
          <input matInput 
                 [formControlName]="getControlName('Contact')"
                 placeholder="Mobile Number"
                 [required]="isRequired">
        </mat-form-field>
        
        <div class="md:col-span-2">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{getAddressTitle()}} Address</mat-label>
            <input matInput 
                   [formControlName]="getControlName('Address')"
                   placeholder="Street address, city, pincode"
                   [required]="isRequired">
          </mat-form-field>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .fleet-address-form {
      .mat-mdc-form-field-outline {
        border-radius: 8px;
      }
    }
  `]
})
export class FleetAddressFormComponent {
  @Input() addressType: 'pickup' | 'delivery' | 'sender' | 'receiver' = 'pickup';
  @Input() isRequired: boolean = true;
  @Input() parentForm!: FormGroup;
  
  getAddressTitle(): string {
    switch(this.addressType) {
      case 'pickup': return 'Pickup';
      case 'delivery': return 'Delivery';
      case 'sender': return 'Sender';
      case 'receiver': return 'Receiver';
      default: return 'Address';
    }
  }
  
  getControlName(suffix: string): string {
    return `${this.addressType}${suffix}`;
  }
}