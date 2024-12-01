import type { Metadata } from 'next'

import ClientLayout from './layout.client'

export const metadata: Metadata = {
  title: 'ERM数据同步平台',
  description: 'ERM数据同步平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
