export type TokenPlan = {
  id: string
  name: string
  priceUsd: number
  priceKrw: number
  tokenAmount: number
  marketUsd: number
  saving: string
  description: string
  perTokenUsd: string
  highlight?: boolean
  uses: string[]
}

export const TOKEN_PLANS: TokenPlan[] = [
  {
    id: 'starter-credit',
    name: 'Starter Credit',
    priceUsd: 10,
    priceKrw: 13900,
    tokenAmount: 50000,
    marketUsd: 20,
    saving: '50%',
    description: '가볍게 시작하는 입문 플랜',
    perTokenUsd: '$0.0002',
    uses: ['GPT-4o mini 약 500회', 'Claude Haiku 약 800회'],
  },
  {
    id: 'pro-credit',
    name: 'Pro Credit',
    priceUsd: 30,
    priceKrw: 41700,
    tokenAmount: 180000,
    marketUsd: 60,
    saving: '50%',
    description: '가장 많이 선택하는 인기 플랜',
    perTokenUsd: '$0.000167',
    highlight: true,
    uses: ['GPT-4o 약 600회', 'Claude Sonnet 약 450회'],
  },
  {
    id: 'business-credit',
    name: 'Business Credit',
    priceUsd: 100,
    priceKrw: 139000,
    tokenAmount: 700000,
    marketUsd: 200,
    saving: '50%',
    description: '팀·비즈니스를 위한 대용량 플랜',
    perTokenUsd: '$0.000143',
    uses: ['GPT-4o 약 2,333회', 'Claude Sonnet 약 1,750회'],
  },
]

export function findTokenPlan(planId: string) {
  return TOKEN_PLANS.find((plan) => plan.id === planId)
}

export function tokenAmountToCreditUsd(tokenAmount: number) {
  return tokenAmount / 5000
}
