export interface FirebaseIndex {
  id: string;
  collection: string;
  fields: {
    fieldPath: string;
    mode: 'ASCENDING' | 'DESCENDING';
  }[];
}