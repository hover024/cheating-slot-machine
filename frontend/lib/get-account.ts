import axios from 'axios'

export const getAccount = (accountId: string) => {
  return axios.get<{
    id: string
    balance: number
    createdAt: string
    updatedAt: string
  }>(`http://localhost:4000/accounts/${accountId}`)
}
