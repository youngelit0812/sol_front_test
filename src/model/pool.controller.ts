import { AccountInfo, PublicKey } from '@solana/web3.js'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { util } from '@sentre/senhub'

import configs from 'configs'

const {
  sol: { taxmanAddress, swap },
} = configs

/**
 * Interface & Utility
 */

export type PoolData = {
  owner: string
  state: number
  mint_lpt: string
  taxman: string
  mint_a: string
  treasury_a: string
  reserve_a: bigint
  mint_b: string
  treasury_b: string
  reserve_b: bigint
  fee_ratio: bigint
  tax_ratio: bigint
}
export type PoolsState = Record<string, PoolData>

/**
 * Store constructor
 */

const NAME = 'pools'
const initialState: PoolsState = {}

/**
 * Actions
 */

export const getPools = createAsyncThunk(`${NAME}/getPools`, async () => {
  // Get all pools
  const value: ReadonlyArray<{ pubkey: PublicKey; account: AccountInfo<Buffer> }> =
    await swap.connection.getProgramAccounts(swap.swapProgramId, {
      filters: [
        { dataSize: 257 },
        { memcmp: { bytes: taxmanAddress, offset: 65 } },
      ],
    })
  const bulk: PoolsState = {}
  value.forEach(({ pubkey, account: { data: buf } }) => {
    const address = pubkey.toBase58()
    const data = swap.parsePoolData(buf)
    bulk[address] = data
  })
  return bulk
})

export const getPool = createAsyncThunk<
  PoolsState,
  { address: string },
  { state: any }
>(`${NAME}/getPool`, async ({ address }, { getState }) => {
  if (!util.isAddress(address)) throw new Error('Invalid pool address')
  const {
    pools: { [address]: data },
  } = getState()
  if (data) return { [address]: data }
  const raw = await swap.getPoolData(address)
  return { [address]: raw }
})

export const upsetPool = createAsyncThunk<
  PoolsState,
  { address: string; data: PoolData },
  { state: any }
>(`${NAME}/upsetPool`, async ({ address, data }) => {
  if (!util.isAddress(address)) throw new Error('Invalid pool address')
  if (!data) throw new Error('Data is empty')
  return { [address]: data }
})

/**
 * Usual procedure
 */

const slice = createSlice({
  name: NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    void builder
      .addCase(getPools.fulfilled, (state, { payload }) => payload)
      .addCase(
        getPool.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      )
      .addCase(
        upsetPool.fulfilled,
        (state, { payload }) => void Object.assign(state, payload),
      ),
})

export default slice.reducer
