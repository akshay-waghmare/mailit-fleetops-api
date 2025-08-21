import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'fleet-form-field',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule
  ],
  templateUrl: './fleet-form-field.html',
  styleUrl: './fleet-form-field.css'
})
export class FleetFormFieldComponent {
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() controlName!: string;
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'select' = 'text';
  @Input() hasError = false;
  @Input() errorMessage = '';
  @Input() options: SelectOption[] = [];
  @Input() required = false;
  @Input() disabled = false;

  get fieldClasses(): string {
    const base = 'w-full fleet-form-field';
    const error = this.hasError ? 'error' : '';
    return `${base} ${error}`.trim();
  }
}
