import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { PeopleList } from './people-list';

describe('PeopleList', () => {
  let component: PeopleList;
  let fixture: ComponentFixture<PeopleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeopleList],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
