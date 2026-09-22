import { Injectable, computed, inject, signal } from '@angular/core';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { IPeopleRepository } from '../../../core/api/repository.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { People } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class PeopleViewmodel {
  // TODO add viewmodel class
  // can be swapped to a MockRepository or a different api can be integrated
  private peopleRepository: IPeopleRepository = inject(SwapiPeopleRepository);

  readonly search = signal('');
  readonly people = toSignal(this.peopleRepository.getAll(), { initialValue: [] });

  readonly filteredPeople = computed(() => {
    const query = this.search().toLowerCase();
    return this.people().filter((p: People) => p.name.toLowerCase().includes(query));
  });
}
