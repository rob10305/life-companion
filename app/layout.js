import './globals.css'

export const metadata = {
  title: 'Life Companion',
  description: 'Your personal dashboard — projects, tasks, and life at a glance.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="dark:bg-gray-950 bg-slate-50 dark:text-white text-slate-900 antialiased">{children}</body>
    </html>
  )
}
