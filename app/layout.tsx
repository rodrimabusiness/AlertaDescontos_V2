import Navbar from "@/app/components/Navbar";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import AuthProvider from "@/app/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AlertaDescontos",
  description:
    "Acompanhe os preços dos produtos com facilidade e poupe dinheiro nas suas compras online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <AuthProvider>
        <body className={inter.className}>
          <main className="max-w-10xl mx-auto">
            <Navbar />
            {children}
          </main>
        </body>
      </AuthProvider>
    </html>
  );
}
