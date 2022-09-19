import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: null, username: null },
    reducers: {
        setCredentials: (state, action) => {
            const { phone } = action.payload;

            const accessToken = action.payload.data.access_token;
            console.log('check authSlice:', phone, 'tokennnn:', action.payload.data.access_token)
            state.user = phone
            state.token = accessToken
        },
        logOut: (state, action) => {
            state.user = null
            state.token = null
        }
    },
})

export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token