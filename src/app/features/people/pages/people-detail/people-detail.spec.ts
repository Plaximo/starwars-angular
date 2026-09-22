import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeopleDetail } from './people-detail';

describe('PeopleDetail', () => {
  let component: PeopleDetail;
  let fixture: ComponentFixture<PeopleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeopleDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
