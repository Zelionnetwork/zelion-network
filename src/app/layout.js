import Providers from './providers';
import { ConditionalLayout } from './components/ConditionalNavbar';
import NetworkWarning from './components/NetworkWarning';

export const metadata = {
  title: 'Zelion Chain',
  description:
    'Quantum-secure blockchain dApp built for post-quantum security and global interoperability.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#00f0ff" />
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />

        {/* ✅ Fonts: Merriweather (headings), Inter (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* ✅ Tailwind CDN + Updated Font Config */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      heading: ['"Merriweather"', 'serif'],
                      body: ['"Inter"', 'sans-serif'],
                    },
                    colors: {
                      brand: '#00f0ff',
                      dark: '#0b0c10',
                    }
                  }
                }
              }
            `,
          }}
        />

        {/* ✨ Custom CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .text-shine {
                background: linear-gradient(90deg, #00f0ff, #ffffff, #00f0ff);
                background-size: 200%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shineText 4s linear infinite;
              }

              @keyframes shineText {
                0% { background-position: -200%; }
                100% { background-position: 200%; }
              }

              .btn-zelion {
                position: relative;
                overflow: hidden;
                background-color: #00f0ff;
                color: black;
                font-weight: 700;
                border-radius: 9999px;
                padding: 0.75rem 1.5rem;
                transition: background 0.3s ease;
              }

              .btn-zelion::before {
                content: '';
                position: absolute;
                top: 0;
                left: -75%;
                width: 150%;
                height: 100%;
                background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
                transform: skewX(-20deg);
                animation: shimmer 2.5s infinite;
              }

              @keyframes shimmer {
                0% { left: -75%; }
                100% { left: 125%; }
              }

              .btn-zelion:hover {
                background-color: white;
                color: #000;
              }
            `,
          }}
        />
      </head>

      <body className="min-h-screen bg-dark text-white font-body antialiased" suppressHydrationWarning>
        <Providers>
          <NetworkWarning />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
