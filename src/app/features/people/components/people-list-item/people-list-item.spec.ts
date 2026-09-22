import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeopleListItem } from './people-list-item';

describe('PeopleListItem', () => {
  let component: PeopleListItem;
  let fixture: ComponentFixture<PeopleListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeopleListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
