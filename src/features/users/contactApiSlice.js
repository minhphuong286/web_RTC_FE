import { apiSlice } from "../../app/api/apiSlice"

export const contactApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        findUser: builder.mutation({
            query: (credentials) => ({
                url: `/find-user`,
                method: 'POST',
                body: { ...credentials }
            })
            // keepUnusedDataFor: 5,
        }),
        requestContact: builder.mutation({
            query: (credentials) => ({
                url: `/relationship/friend-request`,
                method: 'POST',
                body: { ...credentials }
            })
        }),
        refuseOrAcceptContact: builder.mutation({
            query: (credentials) => ({
                url: `/relationship/friend-accept`,
                method: 'POST',
                body: { ...credentials }
            })
        }),
    })
})

export const {
    useFindUserMutation,
    useRequestContactMutation,
    useRefuseOrAcceptContactMutation
} = contactApiSlice

