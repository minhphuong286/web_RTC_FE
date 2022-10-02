import { apiSlice } from "../../app/api/apiSlice"

export const friendListApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getFriendList: builder.query({
            query: () => `/relationship/list-friends`,
            // keepUnusedDataFor: 5,
        }),
        getRequestList: builder.query({
            query: () => `/relationship/list-request-friends`,
            // keepUnusedDataFor: 5,
        }),
    })
})

export const {
    useGetFriendListQuery,
    useGetRequestListQuery
} = friendListApiSlice 