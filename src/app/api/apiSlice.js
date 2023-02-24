import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'https://webrtc-project-2-video-call.herokuapp.com/',
    // baseUrl: 'https://t29webrtc.000webhostapp.com/',
    // baseUrl: 'https://e9d4-14-165-81-124.ap.ngrok.io',
    // baseUrl: 'http://127.0.0.1:8000',
    // credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        if (token) {
            headers.set("authorization", `Bearer ${token}`)
            headers.set('Access-Control-Allow-Origin', '*')
            headers.set('Access-Control-Allow-Credentials', 'true')
            headers.set('Access-Control-Allow-Headers', 'origin, content-type, accept, authorization')
            headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD')
        }
        // delete headers['Content-Type'];

        // if (!headers.has("Content-Type")) {
        //     headers.set("Content-Type", "application/json");
        // }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result?.error?.originalStatus === 403) {
        // console.log('sending refresh token')
        // send refresh token to get new access token 
        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
        // console.log(refreshResult)
        if (refreshResult?.data) {
            const user = api.getState().auth.user
            // store the new token 
            api.dispatch(setCredentials({ ...refreshResult.data, user }))
            // retry the original query with new access token 
            result = await baseQuery(args, api, extraOptions)
        } else {
            api.dispatch(logOut())
        }
    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({})
})