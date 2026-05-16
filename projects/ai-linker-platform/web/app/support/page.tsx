import { SupportClient } from '@/app/support/support-client'
import { getSupportPageData } from '@/lib/public-store'

export const dynamic = 'force-dynamic'

type SupportPageProps = {
  searchParams: Promise<{ section?: string; created?: string }>
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const params = await searchParams
  const { user, products } = await getSupportPageData()
  return <SupportClient tickets={user?.supportTickets ?? []} products={products} initialSection={params.section} />
}
