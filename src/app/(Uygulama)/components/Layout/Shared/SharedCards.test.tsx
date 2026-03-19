import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BlankCard from './BlankCard/BlankCard'
import ParentCard from './ParentCard/ParentCard'
import ChildCard from './ChildCard/ChildCard'
import { renderWithProviders } from '@/test/test-utils'

describe('Shared card components', () => {
    it('renders blank card content with outlined variant when shadows are disabled', () => {
        renderWithProviders(
            <BlankCard className="blank-card-test">
                <div>Blank card content</div>
            </BlankCard>,
            {
                preloadedState: {
                    customizer: {
                        isCardShadow: false,
                    },
                },
            }
        )

        const card = screen.getByText('Blank card content').closest('.blank-card-test')
        expect(card).toBeInTheDocument()
    })

    it('renders parent card footer only when provided', () => {
        const { rerender } = renderWithProviders(
            <ParentCard title="Parent title" footer={<span>Footer</span>}>
                <div>Parent body</div>
            </ParentCard>,
            {
                preloadedState: {
                    customizer: {
                        isCardShadow: true,
                    },
                },
            }
        )

        expect(screen.getByText('Parent title')).toBeInTheDocument()
        expect(screen.getByText('Parent body')).toBeInTheDocument()
        expect(screen.getByText('Footer')).toBeInTheDocument()

        rerender(
            <ParentCard title="Parent title">
                <div>Only body</div>
            </ParentCard>
        )

        expect(screen.queryByText('Footer')).not.toBeInTheDocument()
        expect(screen.getByText('Only body')).toBeInTheDocument()
    })

    it('renders child card with and without title', () => {
        const { rerender } = renderWithProviders(
            <ChildCard title="Child title">
                <div>Child body</div>
            </ChildCard>
        )

        expect(screen.getByText('Child title')).toBeInTheDocument()
        expect(screen.getByText('Child body')).toBeInTheDocument()

        rerender(
            <ChildCard>
                <div>No title body</div>
            </ChildCard>
        )

        expect(screen.queryByText('Child title')).not.toBeInTheDocument()
        expect(screen.getByText('No title body')).toBeInTheDocument()
    })
})
