import { createSlice } from "@reduxjs/toolkit"

const videoSlice = createSlice({
    name: 'video',
    initialState: { user: null, isCalling: false },
    reducers: {
        detectIsCallingVideo: (state, action) => {
            const { name, isCalling } = action.payload;
            // console.log('check action:', action, 'state:', state)
            // console.log('check videoSlice:', name, 'detect:', isCalling)
            state.user = name
            state.isCalling = isCalling
        },
        detectDataFrom: (state, action) => {
            const { dataFrom } = action.payload;
            state.dataFrom = dataFrom
        },
        detectDataTo: (state, action) => {
            const { dataTo } = action.payload;
            state.dataTo = dataTo
        },
    },
})

export const { detectIsCallingVideo, detectDataFrom, detectDataTo } = videoSlice.actions

export default videoSlice.reducer

export const selectCallingUser = (state) => state.video.user
export const selectCallingDetect = (state) => state.video.isCalling
export const selectDataFromDetect = (state) => state.video.dataFrom
export const selectDataToDetect = (state) => state.video.dataTo