import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Scriptish',
  description: 'Solution for Infusion Clinics',
  generator: 'Engr. Mark',
  openGraph: {
    title: 'Scriptish',
    description: 'Operating System for Infusion Clinics',
    images: [
      {
        url: '/og-image-1.png',
        width: 1200,
        height: 630,
        alt: 'Scriptish - Solution for Infusion Clinics',
      },
    ],
  },
  icons: {
    icon: '/new-logo.png',
  },
}

// ⛔ DO NOT IMPORT CLIENT COMPONENTS ABOVE THIS LINE

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // ✅ Import client components inside the function (allowed)
  const ThemeProvider = require("@/components/theme-provider").ThemeProvider
  const ProtectedLayout = require("@/app/ProtectedLayout").default

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/new-logo.png" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ProtectedLayout>
            {children}
          </ProtectedLayout>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
