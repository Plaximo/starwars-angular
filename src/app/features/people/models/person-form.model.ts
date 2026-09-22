import { People } from '../../../core/models';

export type PersonFormPayload = Omit<People, 'id' | 'url'>;

export interface PersonFormData {
  name: string;
  gender: string;
  birthYear: string;
  heightRaw: string;
  massRaw: string;
  eyeColor: string;
  hairColor: string;
  skinColor: string;
}
