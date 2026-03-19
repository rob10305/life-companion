import './globals.css'

export const metadata = {
  title: 'Life Companion',
  description: 'Your personal dashboard — projects, tasks, and life at a glance.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  )
}
