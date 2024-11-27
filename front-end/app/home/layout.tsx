import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
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
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
