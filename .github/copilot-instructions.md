<!-- FleetOps Full-Stack Monorepo - Angular Frontend Setup Instructions -->

# 🚀 FleetOps UI Enhancement Plan: Angular Material + Tailwind CSS Hybrid

## 🎯 Current Sprint: Orders Page UI Upgrade with Hybrid Framework

### ✅ Current State Analysis
- **Angular 20** with standalone components ✅
- **Existing SCSS** styling foundation ✅
- **MapLibre GL JS** for spatial features ✅
- **Professional design** already implemented ✅
- **Responsive layout** needs enhancement ⚠️
- **Form UX** needs Material components ⚠️
### 🛠️ Technology Stack - UI Enhancement
- **Base Framework**: Angular 20 + Standalone Components
- **UI Components**: Angular Material 20.2.0 (Forms, Cards, Steppers)
- **Styling Framework**: Tailwind CSS 3.4+ (Utilities, Layout, Responsiveness)
- **Component Library**: Custom FleetOps UI Kit (libs/ui-kit/)
- **Icons**: Material Icons + Custom Fleet Icons
- **Theme**: FleetOps Brand Colors + Material Design System

## 📋 Implementation Phases

### Phase 1: Foundation Setup (Day 1-2)
**Goal**: Install and configure hybrid framework

#### 1.1 Install Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install Angular Material
npm install @angular/material@^20.2.0 @angular/cdk@^20.2.0

# Install Tailwind CSS
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
npx tailwindcss init -p

# Install Tailwind plugins
npm install -D @tailwindcss/forms @tailwindcss/typography
```

#### 1.2 Configure Tailwind CSS
- [ ] Update `tailwind.config.js` with FleetOps brand colors
- [ ] Configure content paths for Angular workspace
- [ ] Add FleetOps custom utility classes
- [ ] Set up component layer for reusable styles

#### 1.3 Update Global Styles
- [ ] Replace existing SCSS with Tailwind base
- [ ] Preserve MapLibre GL CSS imports
- [ ] Add FleetOps custom component classes
- [ ] Configure Material theme with Tailwind colors

#### 1.4 Angular Material Setup
- [ ] Add Material theme to `styles.scss`
- [ ] Configure typography scale
- [ ] Set up custom Material palette
- [ ] Test basic Material components

**Deliverables**: ✅ Working Tailwind + Material setup

---

### Phase 2: UI Kit Library Enhancement (Day 3-5)
**Goal**: Create reusable FleetOps components

#### 2.1 Enhanced Form Components
```typescript
// libs/ui-kit/components/
fleet-form-field.component.ts     // Material + Tailwind hybrid input
fleet-button.component.ts         // Consistent button styles
fleet-card.component.ts           // Enhanced card component
fleet-badge.component.ts          // Status badges
fleet-stepper.component.ts        // Custom stepper component
```

#### 2.2 FleetOps Form Field Component
```typescript
@Component({
  selector: 'fleet-form-field',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" 
                    class="w-full fleet-form-field"
                    [class]="fieldClasses">
      <mat-label class="text-slate-700 font-medium">{{label}}</mat-label>
      
      <!-- Text Input -->
      <input *ngIf="type !== 'select'" 
             matInput 
             [placeholder]="placeholder"
             [formControlName]="controlName"
             [type]="type"
             class="text-slate-900">
      
      <!-- Select Input -->
      <mat-select *ngIf="type === 'select'" 
                  [formControlName]="controlName"
                  class="text-slate-900">
        <mat-option *ngFor="let option of options" [value]="option.value">
          {{option.label}}
        </mat-option>
      </mat-select>
      
      <mat-error class="text-red-600 text-sm" *ngIf="hasError">
        {{errorMessage}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [`
    ::ng-deep .fleet-form-field {
      .mat-mdc-form-field-outline {
        @apply border-slate-300 rounded-lg;
      }
      
      .mat-mdc-form-field-focus-overlay {
        @apply border-blue-500;
      }
      
      &.mat-focused .mat-mdc-form-field-outline {
        @apply border-blue-500 border-2;
      }
    }
  `]
})
```

#### 2.3 FleetOps Button Component
```typescript
@Component({
  selector: 'fleet-button',
  standalone: true,
  template: `
    <button [type]="type" 
            [disabled]="disabled"
            [class]="buttonClasses"
            (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `
})
export class FleetButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Output() onClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-blue-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    
    const disabled = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return `${base} ${sizes[this.size]} ${variants[this.variant]} ${disabled}`;
  }
}
```

**Deliverables**: ✅ Reusable UI Kit components

---

### Phase 3: Orders Page Enhancement (Day 6-8)
**Goal**: Transform orders page with hybrid components

#### 3.1 Enhanced Orders Layout Structure
```typescript
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatStepperModule, MatCardModule, MatChipsModule,
    FleetFormFieldComponent, FleetButtonComponent, FleetCardComponent
  ],
  template: `
    <!-- Modern Layout with Tailwind + Material -->
    <div class="min-h-screen bg-slate-50">
      <!-- Header Section -->
      <header class="bg-white border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold text-slate-900 flex items-center">
              📦 <span class="ml-2">New Order</span>
            </h1>
            <fleet-button variant="outline" size="sm">
              🧪 Demo Mode
            </fleet-button>
          </div>
        </div>
      </header>

      <!-- Enhanced Stepper Layout -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <mat-stepper linear="false" class="bg-transparent mb-8" #stepper>
          
          <!-- Step 1: Client Selection -->
          <mat-step label="Client Selection" [completed]="selectedClient !== null">
            <!-- Enhanced client selection with search -->
          </mat-step>

          <!-- Step 2: Shipment Details -->
          <mat-step label="Shipment Details" [completed]="orderForm.get('weight')?.valid">
            <!-- Material form fields with Tailwind styling -->
          </mat-step>

          <!-- Step 3: Carrier Selection -->
          <mat-step label="Carrier Selection" [completed]="selectedCarrier !== null">
            <!-- Material cards for carrier options -->
          </mat-step>

        </mat-stepper>
      </main>

      <!-- Booking Summary Sidebar -->
      <aside class="fixed top-20 right-8 w-80 z-10" *ngIf="selectedClient">
        <!-- Sticky sidebar with booking summary -->
      </aside>
    </div>
  `
})
```

**Deliverables**: ✅ Enhanced orders page with stepper navigation

---

### Phase 4: Responsive & Polish (Day 9-10)
**Goal**: Mobile optimization and final polish

#### 4.1 Mobile Responsiveness
- [ ] Test on mobile devices (320px - 768px)
- [ ] Adjust sidebar to bottom sheet on mobile
- [ ] Optimize touch targets (44px minimum)
- [ ] Test landscape orientation

#### 4.2 Accessibility Enhancements
- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader testing
- [ ] Color contrast validation (WCAG AA)

#### 4.3 Performance Optimization
- [ ] Lazy load non-critical components
- [ ] Optimize bundle size with tree-shaking
- [ ] Add loading states and skeletons
- [ ] Implement error boundaries

**Deliverables**: ✅ Production-ready orders page

---

## 🎯 Success Criteria

### Technical Metrics
- [ ] **Bundle Size**: < 2MB initial load (Tailwind tree-shaking)
- [ ] **Performance**: Lighthouse score > 90
- [ ] **Accessibility**: WCAG AA compliance
- [ ] **Mobile**: Responsive on all devices (320px+)
- [ ] **Browser**: Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

### User Experience Metrics
- [ ] **Form Completion**: Reduced steps and validation errors
- [ ] **Navigation**: Intuitive stepper flow
- [ ] **Visual Hierarchy**: Clear information architecture
- [ ] **Loading States**: No flash of unstyled content
- [ ] **Error Handling**: Graceful error recovery

### Developer Experience
- [ ] **Component Reusability**: UI Kit components used across app
- [ ] **Type Safety**: Full TypeScript coverage
- [ ] **Documentation**: Storybook for UI Kit components
- [ ] **Testing**: Unit tests for all components
- [ ] **Maintainability**: Clean separation of concerns

## 🚀 Implementation Commands

### Setup Commands
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install @angular/material@^20.2.0 @angular/cdk@^20.2.0
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography

# Initialize Tailwind
npx tailwindcss init -p

# Generate Angular Material theme
ng add @angular/material

# Create UI Kit library
ng generate library ui-kit --prefix=fleet

# Generate components
ng generate component fleet-form-field --project=ui-kit
ng generate component fleet-button --project=ui-kit
ng generate component fleet-card --project=ui-kit
```

### Development Commands
```bash
# Start development server
ng serve --port 4200

# Build for production
ng build --configuration=production

# Run tests
ng test

# Lint code
ng lint

# Build library
ng build ui-kit
```

This comprehensive plan provides a roadmap for implementing the Angular Material + Tailwind CSS hybrid approach for the FleetOps orders page enhancement.
