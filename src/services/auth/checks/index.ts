export { checkUserRecords } from './userRecords';
export interface UserRecordsCheck {
  users: boolean;
  sales: boolean;
  hasAuth: boolean;
  uid?: string;
}