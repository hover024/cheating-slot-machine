import axios from 'axios';

export const createSession = (accountId: string, balance: number) => {
  return axios.post<{
    id: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
  }>(`http://localhost:4000/accounts/${accountId}/session`, {
    id: accountId,
    balance,
  });
};
