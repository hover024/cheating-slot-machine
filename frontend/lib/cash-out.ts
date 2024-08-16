import axios from 'axios';

export const cashOutRequest = (accountId: string) => {
  return axios.post<{ balance: number }>(
    `http://localhost:4000/cashout/${accountId}`,
    {
      id: accountId,
    }
  );
};
