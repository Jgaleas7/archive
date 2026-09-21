import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Legacy News Archive Search",
  description: "Search legacy newsroom tape records and scripts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} style={{ colorScheme: 'dark' }}>
      <head>
        <link href="https://vercel.com/geist/vercel-brand.css" rel="stylesheet" />
        <style>{`
          :root {
            color-scheme: dark;
          }
          .chek-logo {
            height: 24px;
            width: auto;
            margin-right: var(--vbg-space-4);
          }
          .vbg-masthead {
            border-bottom: 2px solid #FFC72C; /* CHEK Yellow */
            padding-bottom: var(--vbg-space-4);
            margin-bottom: var(--vbg-space-6);
          }
          .vbg-document-meta {
            color: #0055A4; /* CHEK Blue */
          }
          @media (prefers-color-scheme: dark) {
            .vbg-document-meta {
              color: #4da3ff; /* Lighter CHEK Blue for dark mode */
            }
          }
        `}</style>
      </head>
      <body className="vbg-report">
        <div className="vbg-shell">
          <a className="vbg-skip-link" href="#main">Skip to content</a>
          <header className="vbg-header">
            <div className="vbg-masthead">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/CHEK_logo_2022.svg" alt="CHEK News" className="chek-logo" />
              <div className="vbg-document-meta">Legacy News Archive</div>
            </div>
          </header>
          <main id="main">
            {children}
          </main>
          <footer className="vbg-footer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/CHEK_logo_2022.svg" alt="CHEK News" style={{ height: '16px', opacity: 0.7 }} />
            <span>Archive Search System</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
