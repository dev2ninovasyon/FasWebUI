import React, { PropsWithChildren } from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { baselightTheme } from '@/utils/theme/DefaultColors'
import userReducer from '@/store/user/UserSlice'
import customizerReducer from '@/store/customizer/CustomizerSlice'

// Create a default theme instance
const theme = createTheme(baselightTheme)

// Configure a test store
const createTestStore = (preloadedState = {}) => {
    return configureStore({
        reducer: {
            userReducer: userReducer,
            customizer: customizerReducer,
        },
        preloadedState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
    })
}

export function renderWithProviders(
    ui: React.ReactElement,
    {
        preloadedState = {},
        store,
        ...renderOptions
    }: any = {}
) {
    const actualStore = store || createTestStore(preloadedState)

    function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
        return (
            <Provider store={actualStore}>
                <ThemeProvider theme={theme}>
                    {children}
                </ThemeProvider>
            </Provider>
        )
    }

    return { store: actualStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
