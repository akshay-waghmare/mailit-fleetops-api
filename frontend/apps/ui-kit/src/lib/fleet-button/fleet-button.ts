import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fleet-button',
  imports: [CommonModule],
  templateUrl: './fleet-button.html',
  styleUrl: './fleet-button.css'
})
export class FleetButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() onClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
      secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 disabled:bg-slate-300',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
    };
    
    const disabled = this.disabled || this.loading ? 'cursor-not-allowed' : 'cursor-pointer';
    
    return `${base} ${sizes[this.size]} ${variants[this.variant]} ${disabled}`;
  }

  onButtonClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
