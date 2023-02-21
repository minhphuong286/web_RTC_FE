import { apiSlice } from "../../app/api/apiSlice"

export const groupApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        createGroup: builder.mutation({
            query: (credentials) => ({
                url: `/group-chat/create`,
                method: 'POST',
                body: { ...credentials }
            }),
            keepUnusedDataFor: 5,
        }),
        addGroupMember: builder.mutation({
            query: (credentials) => ({
                url: `/group-chat/add-member`,
                method: 'POST',
                body: { ...credentials }
            }),
            keepUnusedDataFor: 5,
        }),
        deleteGroupMember: builder.mutation({
            query: (credentials) => ({
                url: `/group-chat/${credentials.roomId}/kick-user/${credentials.memberId}`,
                method: 'DELETE',
                body: { ...credentials }
            }),
            keepUnusedDataFor: 5,
        }),
        deleteGroup: builder.mutation({
            query: (credentials) => ({
                url: `/group-chat/${credentials.roomId}/delete-room`,
                method: 'DELETE',
                body: { ...credentials }
            }),
            keepUnusedDataFor: 5,
        }),
        updateHistoryGroup: builder.mutation({
            query: (credentials) => ({
                url: `/group-chat/upload-history`,
                method: 'POST',
                body: { ...credentials }
            }),
            keepUnusedDataFor: 5,
        }),
        getGroupList: builder.query({
            query: () => `/group-chat/list-rooms`,
            keepUnusedDataFor: 5,
        }),
        getGroupMemberList: builder.query({
            query: (byId) => `/group-chat/${byId}/members`,
            keepUnusedDataFor: 5,
        }),
        getGroupStatus: builder.query({
            query: (groupId) => `/group-chat/${groupId}`,
            keepUnusedDataFor: 5,
        }),
    })
})

export const {
    useCreateGroupMutation,
    useAddGroupMemberMutation,
    useDeleteGroupMemberMutation,
    useDeleteGroupMutation,
    useUpdateHistoryGroupMutation,
    useGetGroupListQuery,
    useGetGroupMemberListQuery,
    useGetGroupStatusQuery
} = groupApiSlice

