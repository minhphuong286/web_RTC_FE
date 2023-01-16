import { apiSlice } from "../../app/api/apiSlice"

export const groupApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        createGroup: builder.mutation({
            query: (credentials) => ({
                url: `/group-chat/create`,
                method: 'POST',
                body: { ...credentials }
            })
            // keepUnusedDataFor: 5,
        }),
        getGroupList: builder.query({
            query: () => `/group-chat/list-rooms`,
            // keepUnusedDataFor: 5,
        }),
        // requestContact: builder.mutation({
        //     query: (credentials) => ({
        //         url: `/relationship/friend-request`,
        //         method: 'POST',
        //         body: { ...credentials }
        //     })
        // }),
        // refuseOrAcceptContact: builder.mutation({
        //     query: (credentials) => ({
        //         url: `/relationship/friend-accept`,
        //         method: 'POST',
        //         body: { ...credentials }
        //     })
        // }),
    })
})

export const {
    useCreateGroupMutation,
    useGetGroupListQuery,
    // useRequestContactMutation,
    // useRefuseOrAcceptContactMutation
} = groupApiSlice

