import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PickupService } from './pickup.service';
import { ConfigService } from './config.service';
import { PickupRecord } from './pickup.interface';

describe('PickupService', () => {
  let service: PickupService;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PickupService, ConfigService]
    });
    service = TestBed.inject(PickupService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch pickups (happy path)', () => {
    const mockResponse = {
      content: [
        { id: '1', pickupId: 'PKP1', clientName: 'Acme', clientCompany: 'Acme Inc', clientId: 'c1', pickupAddress: 'Addr', contactNumber: '123', itemCount: 1, totalWeight: 1, pickupType: 'direct', assignedStaff: 'John', staffId: 's1', staffDepartment: 'Ops', pickupDate: new Date(), pickupTime: '10:00', status: 'scheduled', statusUpdatedAt: new Date(), statusUpdatedBy: 'admin', createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin' }
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 20
    } as any;

    service.getPickups({ page: 0, limit: 20 }).subscribe(res => {
      expect(res.content.length).toBe(1);
      expect(res.content[0].pickupId).toBe('PKP1');
    });

    const expectedUrl = `${configService.apiBaseUrl}/pickups`;
    const req = httpMock.expectOne(r => r.url === expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

});
