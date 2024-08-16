import axios from 'axios';

export interface IAccount {
  id: string;
  sessionBalance: number;
  accountBalance: number;
  createdAt: string;
  updatedAt: string;
}

export const getAccount = (accountId: string) => {
  return axios.get<IAccount>(`http://localhost:4000/accounts/${accountId}`);
};
