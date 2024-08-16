import axios from 'axios';

export const createAccount = (accountId: string) => {
  return axios.post<{
    id: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
  }>(`http://localhost:4000/accounts`, {
    id: accountId,
  });
};
