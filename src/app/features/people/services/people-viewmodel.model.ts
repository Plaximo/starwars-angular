import { People } from "../../../core/models";

export interface PeopleListVm {
  people: People[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  totalCount: number;
}