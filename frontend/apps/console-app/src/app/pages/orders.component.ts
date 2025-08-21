import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

interface CarrierOption {
  id: string;
  name: string;
  duration: string;
  price: number;
  serviceable: boolean;
  estimatedDelivery: string;
  logo?: string;
}

interface Client {
  id: string;
  date: string;
  subContractCode: string;
  clientName: string;
  accountNo: string;
  contactPerson: string;
  address: string;
  pincode: string;
  city: string;
  active: boolean;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="new-order-page">
      <div class="page-header">
        <h1>📦 New Order</h1>
        <div class="header-actions">
          <button type="button" class="btn btn-outline">Demo</button>
        </div>
      </div>

      <!-- Client Selection Section -->
      <div class="client-selection-section">
        <div class="client-section-header">
          <h2>Select Client</h2>
          <div class="search-controls">
            <button type="button" class="search-toggle-btn" (click)="toggleClientSearch()">
              🔍 {{showClientSearch ? 'Hide Search' : 'Search Clients'}}
            </button>
          </div>
        </div>
        
        <!-- Client Search -->
        <div class="client-search" *ngIf="showClientSearch">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search by client name, sub contract code, contact person, account no, city, or pincode..."
            [(ngModel)]="searchQuery"
            (input)="onSearchChange($event)">
          <div class="search-results-count" *ngIf="searchQuery">
            Found {{filteredClients.length}} client(s)
          </div>
        </div>

        <div class="client-grid">
          <div *ngFor="let client of filteredClients" 
               class="client-card" 
               [class.selected]="selectedClient?.id === client.id"
               [class.inactive]="!client.active"
               (click)="selectClient(client)">
            <div class="client-info">
              <div class="client-header">
                <span class="client-name">{{client.clientName}}</span>
                <span class="contract-code">{{client.subContractCode}}</span>
              </div>
              <div class="client-details">
                <div class="detail-row">
                  <span class="label">Contact:</span>
                  <span class="value">{{client.contactPerson}}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Account:</span>
                  <span class="value">{{client.accountNo}}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span>
                  <span class="value">{{client.city}} - {{client.pincode}}</span>
                </div>
              </div>
            </div>
            <div class="client-status" [class.active]="client.active">
              {{client.active ? 'Active' : 'Inactive'}}
            </div>
          </div>
        </div>
      </div>

      <div class="order-container" *ngIf="selectedClient">
        <div class="order-form">
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            
            <!-- Shipment Type -->
            <div class="form-section">
              <h3>Shipment Type</h3>
              <div class="shipment-type-tabs">
                <label class="tab-option">
                  <input type="radio" formControlName="shipmentType" value="domestic" checked>
                  <span>Domestic</span>
                </label>
                <label class="tab-option">
                  <input type="radio" formControlName="shipmentType" value="international">
                  <span>International</span>
                </label>
              </div>
            </div>

            <!-- Shipment Details -->
            <div class="form-section">
              <h3>Shipment Details</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" formControlName="weight" placeholder="10" step="0.1" min="0.1" (input)="onShipmentDetailsChange()">
                </div>
                <div class="form-group">
                  <label>Dimensions</label>
                  <div class="dimensions-input">
                    <input type="number" formControlName="length" placeholder="30" min="1" (input)="onShipmentDetailsChange()">
                    <span>×</span>
                    <input type="number" formControlName="width" placeholder="40" min="1" (input)="onShipmentDetailsChange()">
                    <span>×</span>
                    <input type="number" formControlName="height" placeholder="50" min="1" (input)="onShipmentDetailsChange()">
                    <span>cm</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Packages</label>
                  <input type="number" formControlName="packages" placeholder="1" min="1">
                </div>
                <div class="form-group">
                  <label>Commodity</label>
                  <select formControlName="commodity">
                    <option value="">Select Commodity</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="documents">Documents</option>
                    <option value="books">Books</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="food">Food Items</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Delivery Details -->
            <div class="form-section">
              <h3>Delivery Details</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Receiver</label>
                  <input type="text" formControlName="receiverName" placeholder="Naveen" (input)="onAddressChange()">
                </div>
                <div class="form-group">
                  <label>Contact</label>
                  <input type="tel" formControlName="receiverContact" placeholder="9878543210">
                </div>
                <div class="form-group full-width">
                  <label>Delivery Address</label>
                  <input type="text" formControlName="receiverAddress" placeholder="Delhi 110024" (input)="onAddressChange()">
                </div>
              </div>
            </div>

            <!-- Sender Details -->
            <div class="form-section">
              <h3>Sender Details</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Sender Name</label>
                  <input type="text" formControlName="senderName" placeholder="FleetOps India Pvt Ltd">
                </div>
                <div class="form-group">
                  <label>Contact</label>
                  <input type="tel" formControlName="senderContact" placeholder="9876543210">
                </div>
                <div class="form-group full-width">
                  <label>Pickup Address</label>
                  <input type="text" formControlName="senderAddress" placeholder="Mumbai, Maharashtra 400001">
                </div>
              </div>
            </div>

            <!-- Carrier Selection -->
            <div class="form-section">
              <h3>Carrier Selection & Serviceability</h3>
              <div class="carrier-selection">
                <div class="carrier-dropdown-section">
                  <label>Select Carrier</label>
                  <select formControlName="selectedCarrier" (change)="onCarrierChange()" class="carrier-dropdown">
                    <option value="">Check serviceability and get rates...</option>
                    <option *ngFor="let carrier of carrierOptions" [value]="carrier.id">
                      {{carrier.name}} - {{carrier.duration}}
                    </option>
                  </select>
                  <button type="button" class="btn btn-primary check-serviceability" 
                          (click)="checkServiceability()" 
                          [disabled]="!canCheckServiceability()">
                    🔍 Check Serviceability
                  </button>
                </div>

                <!-- Serviceability Results -->
                <div class="serviceability-results" *ngIf="serviceabilityChecked">
                  <div class="loading" *ngIf="checkingServiceability">
                    <div class="spinner"></div>
                    <span>Checking serviceability and fetching rates...</span>
                  </div>
                  
                  <div class="carrier-results" *ngIf="!checkingServiceability && availableCarriers.length > 0">
                    <h4>📦 Available Services</h4>
                    <div class="carrier-options-grid">
                      <div *ngFor="let carrier of availableCarriers" 
                           class="carrier-result-card" 
                           [class.selected]="selectedCarrier?.id === carrier.id"
                           [class.not-serviceable]="!carrier.serviceable"
                           (click)="carrier.serviceable && selectCarrier(carrier)">
                        <div class="carrier-header">
                          <div class="carrier-name">{{carrier.name}}</div>
                          <div class="serviceable-badge" [class.serviceable]="carrier.serviceable">
                            {{carrier.serviceable ? '✅ Serviceable' : '❌ Not Serviceable'}}
                          </div>
                        </div>
                        <div class="carrier-details" *ngIf="carrier.serviceable">
                          <div class="delivery-info">
                            <span class="duration">🚚 {{carrier.duration}}</span>
                            <span class="estimated-delivery">📅 Est: {{carrier.estimatedDelivery}}</span>
                          </div>
                          <div class="price-info">
                            <span class="price">💰 ₹{{carrier.price}}</span>
                          </div>
                        </div>
                        <div class="not-serviceable-reason" *ngIf="!carrier.serviceable">
                          <span>Service not available for this route</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="no-carriers" *ngIf="!checkingServiceability && availableCarriers.length === 0">
                    <div class="no-service-message">
                      <span>❌ No carriers serviceable for this route</span>
                      <p>Please check your pickup and delivery addresses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <!-- Booking Summary Sidebar -->
        <div class="booking-sidebar">
          <div class="booking-summary">
            <h3>Booking & Tracking</h3>
            
            <div class="client-summary">
              <div class="selected-client">
                <span class="label">Client:</span>
                <span class="value">{{selectedClient.clientName}}</span>
              </div>
              <div class="client-company">{{selectedClient.subContractCode}} - {{selectedClient.contactPerson}}</div>
              <div class="client-location">{{selectedClient.city}} - {{selectedClient.pincode}}</div>
            </div>
            
            <div class="tracking-number">
              <span class="tracking-label">Tracking ID:</span>
              <span class="tracking-id">{{trackingId}}</span>
            </div>

            <div class="summary-details">
              <div class="summary-item">
                <span>Weight:</span>
                <span>{{orderForm.get('weight')?.value || 0}} kg</span>
              </div>
              <div class="summary-item" *ngIf="getDimensions()">
                <span>Dimensions:</span>
                <span>{{getDimensions()}}</span>
              </div>
              <div class="summary-item">
                <span>Packages:</span>
                <span>{{orderForm.get('packages')?.value || 1}}</span>
              </div>
              <div class="summary-item" *ngIf="selectedCarrier">
                <span>Carrier:</span>
                <span>{{selectedCarrier.name}}</span>
              </div>
              <div class="summary-item" *ngIf="selectedCarrier">
                <span>Delivery:</span>
                <span>{{selectedCarrier.duration}}</span>
              </div>
              <div class="summary-item" *ngIf="selectedCarrier && selectedCarrier.serviceable">
                <span>Est. Delivery:</span>
                <span>{{selectedCarrier.estimatedDelivery}}</span>
              </div>
              <div class="summary-item total" *ngIf="selectedCarrier && selectedCarrier.serviceable">
                <span>Total Cost:</span>
                <span>₹{{selectedCarrier.price}}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button type="button" class="btn btn-outline" (click)="printLabel()" [disabled]="!selectedCarrier?.serviceable">
                🖨️ Print Label
              </button>
              <button type="button" class="btn btn-outline" (click)="downloadAWB()" [disabled]="!selectedCarrier?.serviceable">
                📄 Download AWB
              </button>
              <button type="button" class="btn btn-outline" (click)="sendTrackingEmail()" [disabled]="!selectedCarrier?.serviceable">
                📧 Send Tracking Email
              </button>
              <button type="button" class="btn btn-primary" (click)="bookShipment()" 
                      [disabled]="!orderForm.valid || !selectedCarrier?.serviceable">
                🚀 Book Shipment
              </button>
              <button type="button" class="btn btn-secondary" (click)="saveAsDraft()">
                💾 Save as Draft
              </button>
              <button type="button" class="btn btn-outline" (click)="cancelOrder()">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orderForm!: FormGroup;
  selectedCarrier: CarrierOption | null = null;
  selectedClient: Client | null = null;
  trackingId = '4619825878203';
  serviceabilityChecked = false;
  checkingServiceability = false;
  availableCarriers: CarrierOption[] = [];
  
  // Client search functionality
  searchQuery = '';
  filteredClients: Client[] = [];
  showClientSearch = false;

  clients: Client[] = [
    { 
      id: 'client1', 
      date: '21/08/2025', 
      subContractCode: 'SUC00425',
      clientName: 'First Promotional Clothing Co', 
      accountNo: 'FIRST', 
      contactPerson: 'Ms. Ruchira Naik', 
      address: 'Shop No. 24, Anusuya Enclave, Jagtap Chowk Wanowrie, Near Shinde Chhatri, Pune', 
      pincode: '411040', 
      city: 'Pune', 
      active: true 
    },
    { 
      id: 'client2', 
      date: '20/08/2025', 
      subContractCode: 'SUC00426',
      clientName: 'ABC Logistics Solutions Pvt Ltd', 
      accountNo: 'ABC001', 
      contactPerson: 'Mr. Rajesh Kumar', 
      address: 'Plot No. 15, Sector 18, Noida', 
      pincode: '201301', 
      city: 'Delhi', 
      active: true 
    },
    { 
      id: 'client3', 
      date: '19/08/2025', 
      subContractCode: 'SUC00427',
      clientName: 'XYZ Corporation Ltd', 
      accountNo: 'XYZ002', 
      contactPerson: 'Ms. Priya Sharma', 
      address: 'Tower B, IT Park, Electronic City', 
      pincode: '560100', 
      city: 'Bangalore', 
      active: true 
    },
    { 
      id: 'client4', 
      date: '18/08/2025', 
      subContractCode: 'SUC00428',
      clientName: 'Tech Innovations Pvt Ltd', 
      accountNo: 'TECH003', 
      contactPerson: 'Mr. Amit Patel', 
      address: 'Hinjewadi Phase 2, Rajiv Gandhi Infotech Park', 
      pincode: '411057', 
      city: 'Pune', 
      active: false 
    },
    { 
      id: 'client5', 
      date: '17/08/2025', 
      subContractCode: 'SUC00429',
      clientName: 'Global Traders LLC', 
      accountNo: 'GLB004', 
      contactPerson: 'Ms. Sneha Singh', 
      address: 'Anna Salai, T Nagar', 
      pincode: '600017', 
      city: 'Chennai', 
      active: true 
    }
  ];

  carrierOptions: CarrierOption[] = [
    { 
      id: 'dhl', 
      name: 'DHL Express', 
      duration: '1–2 days', 
      price: 2100, 
      serviceable: true, 
      estimatedDelivery: 'Aug 23, 2025' 
    },
    { 
      id: 'delhivery', 
      name: 'Delhivery', 
      duration: '2–3 days', 
      price: 1700, 
      serviceable: true, 
      estimatedDelivery: 'Aug 24, 2025' 
    },
    { 
      id: 'bluedart', 
      name: 'Blue Dart', 
      duration: '1–2 days', 
      price: 2000, 
      serviceable: true, 
      estimatedDelivery: 'Aug 23, 2025' 
    },
    { 
      id: 'dtdc', 
      name: 'DTDC Courier', 
      duration: '3–5 days', 
      price: 1300, 
      serviceable: false, 
      estimatedDelivery: 'Aug 26, 2025' 
    },
    { 
      id: 'ecom', 
      name: 'Ecom Express', 
      duration: '2–4 days', 
      price: 1400, 
      serviceable: true, 
      estimatedDelivery: 'Aug 25, 2025' 
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.generateTrackingId();
    this.filteredClients = this.clients.filter(client => client.active);
  }

  // Client search functionality
  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    this.searchClients();
  }

  searchClients() {
    if (!this.searchQuery.trim()) {
      this.filteredClients = this.clients.filter(client => client.active);
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredClients = this.clients.filter(client => {
      return client.active && (
        client.clientName.toLowerCase().includes(query) ||
        client.subContractCode.toLowerCase().includes(query) ||
        client.contactPerson.toLowerCase().includes(query) ||
        client.accountNo.toLowerCase().includes(query) ||
        client.city.toLowerCase().includes(query) ||
        client.pincode.includes(query)
      );
    });
  }

  toggleClientSearch() {
    this.showClientSearch = !this.showClientSearch;
    if (!this.showClientSearch) {
      this.searchQuery = '';
      this.filteredClients = this.clients.filter(client => client.active);
    }
  }

  initializeForm() {
    this.orderForm = this.fb.group({
      shipmentType: ['domestic', Validators.required],
      weight: ['10', [Validators.required, Validators.min(0.1)]],
      length: ['30', Validators.min(1)],
      width: ['40', Validators.min(1)],
      height: ['50', Validators.min(1)],
      packages: ['1', [Validators.required, Validators.min(1)]],
      commodity: ['electronics', Validators.required],
      receiverName: ['', Validators.required],
      receiverContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      receiverAddress: ['', Validators.required],
      senderName: ['', Validators.required],
      senderContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      senderAddress: ['', Validators.required],
      selectedCarrier: ['']
    });
  }

  selectClient(client: Client) {
    if (client.active) {
      this.selectedClient = client;
      this.loadSampleDataForClient(client);
      this.resetServiceability();
    }
  }

  loadSampleDataForClient(client: Client) {
    // Load sample data based on selected client
    this.orderForm.patchValue({
      weight: '10',
      length: '30',
      width: '40',
      height: '50',
      packages: '1',
      commodity: 'electronics',
      receiverName: 'Naveen Kumar',
      receiverContact: '9878543210',
      receiverAddress: 'Delhi 110024',
      senderName: client.contactPerson,
      senderContact: '9876543210',
      senderAddress: `${client.address}, ${client.city} - ${client.pincode}`
    });
  }

  onShipmentDetailsChange() {
    this.resetServiceability();
  }

  onAddressChange() {
    this.resetServiceability();
  }

  onCarrierChange() {
    const carrierId = this.orderForm.get('selectedCarrier')?.value;
    if (carrierId) {
      const carrier = this.carrierOptions.find(c => c.id === carrierId);
      if (carrier) {
        this.selectedCarrier = carrier;
      }
    }
  }

  canCheckServiceability(): boolean {
    const form = this.orderForm;
    return !!(
      form.get('weight')?.value &&
      form.get('receiverAddress')?.value &&
      form.get('senderAddress')?.value &&
      this.selectedClient
    );
  }

  checkServiceability() {
    if (!this.canCheckServiceability()) return;

    this.checkingServiceability = true;
    this.serviceabilityChecked = true;
    this.availableCarriers = [];

    // Simulate API call delay
    setTimeout(() => {
      // Simulate serviceability check based on addresses
      const pickupPin = this.extractPincode(this.orderForm.get('senderAddress')?.value || '');
      const deliveryPin = this.extractPincode(this.orderForm.get('receiverAddress')?.value || '');
      
      this.availableCarriers = this.carrierOptions.map(carrier => {
        // Simulate serviceability logic
        const isServiceable = this.isServiceableRoute(pickupPin, deliveryPin, carrier.id);
        const dynamicPrice = this.calculateDynamicPrice(carrier, this.orderForm.get('weight')?.value || 10);
        
        return {
          ...carrier,
          serviceable: isServiceable,
          price: dynamicPrice,
          estimatedDelivery: this.calculateEstimatedDelivery(carrier.duration)
        };
      });

      this.checkingServiceability = false;
    }, 2000);
  }

  private extractPincode(address: string): string {
    const pincodeMatch = address.match(/\b\d{6}\b/);
    return pincodeMatch ? pincodeMatch[0] : '';
  }

  private isServiceableRoute(pickupPin: string, deliveryPin: string, carrierId: string): boolean {
    // Simulate serviceability logic
    if (!pickupPin || !deliveryPin) return Math.random() > 0.3;
    
    // Some carriers might not service certain routes
    if (carrierId === 'dtdc' && deliveryPin.startsWith('11')) return false; // Delhi not serviceable for DTDC
    if (carrierId === 'ecom' && pickupPin.startsWith('40')) return Math.random() > 0.4; // Mumbai limited for Ecom
    
    return Math.random() > 0.2; // 80% serviceability rate
  }

  private calculateDynamicPrice(carrier: CarrierOption, weight: number): number {
    const basePrice = carrier.price;
    const weightMultiplier = Math.max(1, weight / 10);
    return Math.round(basePrice * weightMultiplier);
  }

  private calculateEstimatedDelivery(duration: string): string {
    const today = new Date();
    const daysToAdd = duration.includes('1–2') ? 2 : 
                     duration.includes('2–3') ? 3 :
                     duration.includes('2–4') ? 4 :
                     duration.includes('3–5') ? 5 : 3;
    
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysToAdd);
    
    return deliveryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  selectCarrier(carrier: CarrierOption) {
    if (carrier.serviceable) {
      this.selectedCarrier = carrier;
      this.orderForm.patchValue({ selectedCarrier: carrier.id });
    }
  }

  resetServiceability() {
    this.serviceabilityChecked = false;
    this.checkingServiceability = false;
    this.availableCarriers = [];
    this.selectedCarrier = null;
    this.orderForm.patchValue({ selectedCarrier: '' });
  }

  generateTrackingId() {
    this.trackingId = Math.floor(Math.random() * 9000000000000) + 1000000000000 + '';
  }

  getDimensions(): string {
    const length = this.orderForm.get('length')?.value;
    const width = this.orderForm.get('width')?.value;
    const height = this.orderForm.get('height')?.value;
    
    if (length && width && height) {
      return `${length} × ${width} × ${height} cm`;
    }
    return '';
  }

  printLabel() {
    alert('🖨️ Printing shipping label...');
  }

  downloadAWB() {
    alert('📄 Downloading AWB (Air Waybill)...');
  }

  sendTrackingEmail() {
    const receiverName = this.orderForm.get('receiverName')?.value;
    alert(`📧 Tracking email sent to ${receiverName} with tracking ID: ${this.trackingId}`);
  }

  bookShipment() {
    if (this.orderForm.valid && this.selectedCarrier?.serviceable) {
      const formData = this.orderForm.value;
      console.log('Booking shipment:', {
        ...formData,
        client: this.selectedClient,
        carrier: this.selectedCarrier,
        trackingId: this.trackingId
      });
      
      alert(`🚀 Shipment booked successfully!\nClient: ${this.selectedClient?.clientName}\nTracking ID: ${this.trackingId}\nCarrier: ${this.selectedCarrier.name}\nEstimated Delivery: ${this.selectedCarrier.estimatedDelivery}`);
      
      this.generateTrackingId();
    } else {
      alert('❌ Please fill all required fields, select a client, and choose a serviceable carrier.');
    }
  }

  saveAsDraft() {
    console.log('Saving draft:', {
      form: this.orderForm.value,
      client: this.selectedClient,
      carrier: this.selectedCarrier
    });
    alert('💾 Order saved as draft successfully!');
  }

  cancelOrder() {
    if (confirm('❌ Are you sure you want to cancel? All data will be lost.')) {
      this.orderForm.reset();
      this.selectedCarrier = null;
      this.selectedClient = null;
      this.resetServiceability();
      this.initializeForm();
    }
  }

  onSubmit() {
    this.bookShipment();
  }
}