import { createCustomers } from '../../prospective-students/v1/model';
import { students } from '../../students/v1/model';

/** Both detail pages use stable, disjoint IDs in the local communication store. */
export function communicationPerson(id: string | null | undefined) {
  return students.find(person => person.id === id) ?? createCustomers().find(person => person.id === id);
}
