import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('./VeriLayout', () => ({
    default: ({ children }: any) => <div data-testid="veri-layout">{children}</div>,
}))

vi.mock('@/app/(Uygulama)/components/Container/PageContainer', () => ({
    default: ({ children, title }: any) => (
        <section>
            <h1>{title}</h1>
            {children}
        </section>
    ),
}))

vi.mock('@/app/(Uygulama)/components/Cards/TopCards', () => ({
    default: ({ title }: any) => <div>TopCards:{title}</div>,
}))

describe('Veri Page', () => {
    it('renders layout, title and top cards for veri route', () => {
        render(<Page />)

        expect(screen.getByTestId('veri-layout')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Veri' })).toBeInTheDocument()
        expect(screen.getByText('TopCards:VERİ')).toBeInTheDocument()
    })
})
