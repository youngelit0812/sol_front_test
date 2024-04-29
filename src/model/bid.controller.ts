import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { LiteMintInfo } from 'components/preview'

export type BidState = {
  amount: string // Desired amount
  accountAddress: string // Associated account to the selected token
  mintInfo: LiteMintInfo // Selected token
  poolAddresses: string[] // List of available pools
  priority: number
}

const NAME = 'bid'
const initialState: BidState = {
  amount: '',
  mintInfo: {
    address: '',
    decimals: 0,
  },
  accountAddress: '',
  poolAddresses: [],
  priority: 0,
}

/**
 * Actions
 */

export const updateBidData = createAsyncThunk<
  Partial<BidState>,
  Partial<BidState> & { prioritized?: boolean; reset?: boolean },
  { state: any }
>(
  `${NAME}/updateBidData`,
  async ({ prioritized, reset, ...bidData }, { getState }) => {
    const {
      bid: { priority: prevPriority },
      ask: { priority: refPriority },
    } = getState()
    if (Number(bidData.amount) < 0) bidData.amount = ''
    const priority = reset ? 0 : prioritized ? refPriority + 1 : prevPriority
    return { ...bidData, priority }
  },
)

/**
 * Usual procedure
 */

const slice = createSlice({
  name: NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    void builder.addCase(
      updateBidData.fulfilled,
      (state, { payload }) => void Object.assign(state, payload),
    ),
})

export default slice.reducer
