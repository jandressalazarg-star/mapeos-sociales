import type { Metadata, Viewport } from "next"; // 👈 Importamos Viewport para el color de la barra
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

// 🛡️ Configuración de Metadatos para PWA
export const metadata: Metadata = {
  title: "AlfaCo - Mapeos Sociales",
  description: "Gestión Social e Infraestructura",
  manifest: "/manifest.json", // 👈 Vincula tu archivo manifest.json
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AlfaCo",
  },
};

// 🎨 Color de la barra de estado en el celular (coincide con tu fondo azul oscuro)
export const viewport: Viewport = {
  themeColor: "#0a1628",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" // 👈 Cambiado a español
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Etiquetas extra para asegurar que se comporte como App en iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}