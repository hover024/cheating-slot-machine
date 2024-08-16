import axios from 'axios';
import { TFruitKey } from '../pages/main/data';

export interface ISpinResponse {
  rollResult: [TFruitKey, TFruitKey, TFruitKey];
  newBalance: number;
}

export const spin = (accountId: string) => {
  return axios.post<ISpinResponse>(`http://localhost:4000/roll/${accountId}`);
};
