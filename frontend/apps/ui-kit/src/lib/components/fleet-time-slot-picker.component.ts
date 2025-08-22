import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimeSlot {
  id: string;
  label: string;
  time: string;
  available: boolean;
  selected?: boolean;
}

@Component({
  selector: 'fleet-time-slot-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-slot-picker">
      <h4 class="text-lg font-medium text-slate-700 mb-4">
        🕐 Select Preferred Time Slot
      </h4>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div *ngFor="let slot of timeSlots" 
             class="time-slot-card p-3 border rounded-lg cursor-pointer transition-all"
             [class]="getSlotClasses(slot)"
             (click)="selectTimeSlot(slot)">
          
          <div class="text-center">
            <div class="font-semibold text-sm">{{slot.label}}</div>
            <div class="text-xs text-slate-600 mt-1">{{slot.time}}</div>
            <div class="mt-2">
              <span *ngIf="slot.available && !slot.selected" 
                    class="text-green-600 text-xs">✓ Available</span>
              <span *ngIf="!slot.available" 
                    class="text-red-600 text-xs">✗ Unavailable</span>
              <span *ngIf="slot.selected" 
                    class="text-blue-600 text-xs font-medium">★ Selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .time-slot-card {
      border: 2px solid #e2e8f0;
    }
    
    .time-slot-card.available:hover {
      border-color: #3b82f6;
      background-color: #f8fafc;
    }
    
    .time-slot-card.selected {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }
    
    .time-slot-card.unavailable {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class FleetTimeSlotPickerComponent {
  @Input() selectedSlot: TimeSlot | null = null;
  @Output() selectedSlotChange = new EventEmitter<TimeSlot | null>();
  
  timeSlots: TimeSlot[] = [
    { id: '1', label: 'Morning', time: '9:00 AM - 12:00 PM', available: true },
    { id: '2', label: 'Early Afternoon', time: '12:00 PM - 2:00 PM', available: true },
    { id: '3', label: 'Afternoon', time: '2:00 PM - 5:00 PM', available: true },
    { id: '4', label: 'Evening', time: '5:00 PM - 8:00 PM', available: false },
    { id: '5', label: 'Late Evening', time: '8:00 PM - 10:00 PM', available: false },
    { id: '6', label: 'Next Day Morning', time: 'Tomorrow 9:00 AM - 12:00 PM', available: true }
  ];

  selectTimeSlot(slot: TimeSlot) {
    if (slot.available) {
      // Update previous selection
      if (this.selectedSlot) {
        this.selectedSlot.selected = false;
      }
      
      // Update new selection
      slot.selected = true;
      this.selectedSlot = slot;
      this.selectedSlotChange.emit(slot);
    }
  }

  getSlotClasses(slot: TimeSlot): string {
    const baseClasses = 'time-slot-card';
    const availableClass = slot.available ? 'available' : 'unavailable';
    const selectedClass = slot.selected ? 'selected' : '';
    
    return `${baseClasses} ${availableClass} ${selectedClass}`.trim();
  }
}