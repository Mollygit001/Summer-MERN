import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  userDetails: null 
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.userDetails = action.payload
    },
    clearUserDetails: (state) => {
      state.userDetails = null
    }
  }
})
export const { setUserDetails, clearUserDetails } = userSlice.actions

const formReducer = userSlice.reducer
export default formReducer