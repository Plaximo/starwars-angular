import { Injectable, computed, inject, signal } from '@angular/core';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { IPeopleRepository } from '../../../core/api/repository.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { People } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class PeopleViewmodel {
  private peopleRepository: IPeopleRepository = inject(SwapiPeopleRepository);

  readonly search = signal('');
  readonly people = toSignal(this.peopleRepository.getAll(), { initialValue: [] });
  readonly isLoading = computed(() => this.people().length === 0);

  readonly filteredPeople = computed(() => {
    const query = this.search().toLowerCase().trim();
    return this.people().filter((p: People) => p.name.toLowerCase().includes(query));
  });

  setSearch(query: string): void {
    this.search.set(query);
  }
}
