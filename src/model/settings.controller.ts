import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export type State = {
  slippage: number
  advanced: boolean
  enhancement: boolean
}

const NAME = 'settings'
const initialState: State = {
  slippage: 0.01,
  advanced: false,
  enhancement: false,
}

/**
 * Actions
 */

export const updateSettings = createAsyncThunk(
  `${NAME}/updateSettings`,
  async (settings: Partial<State>) => ({ ...settings }),
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
      updateSettings.fulfilled,
      (state, { payload }) => void Object.assign(state, payload),
    ),
})

export default slice.reducer
