import { TestBed } from '@angular/core/testing';
import { PeopleViewmodel } from './people-viewmodel.service';

describe('PeopleViewmodel', () => {
  let service: PeopleViewmodel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeopleViewmodel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
