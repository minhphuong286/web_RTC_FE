import { apiSlice } from "../../app/api/apiSlice"

export const roomApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        createRoom: builder.mutation({
            query: (credentials) => ({
                url: `/private-chat/create`,
                method: 'POST',
                body: { ...credentials }
            })
            // keepUnusedDataFor: 5,
        }),
        callingVideo: builder.mutation({
            query: (credentials) => ({
                url: `/private-chat/${credentials.roomId}/video-call`,
                method: 'POST',
                body: { ...credentials }
            })
            // keepUnusedDataFor: 5,
        }),
        rejectCallingVideo: builder.mutation({
            query: (credentials) => ({
                url: `/private-chat/${credentials.roomId}/video-call-reject`,
                method: 'POST',
                body: { ...credentials }
            })
            // keepUnusedDataFor: 5,
        }),
    })
})

export const {
    useCreateRoomMutation,
    useCallingVideoMutation,
    useRejectCallingVideoMutation
} = roomApiSlice

