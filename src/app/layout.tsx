import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['100', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'اوربیت (ORBIT) — اکران‌های اختصاصی سینما و انیمه',
  description: 'پلتفرم خرید بلیت و رزرو صندلی اکران‌های اختصاصی فیلم‌های برتر خارجی و انیمه‌های مطرح جهان در شهرهای مختلف ایران با امکان انتخاب صندلی در سالن سینما بدون نیاز به ثبت‌نام.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen flex flex-col bg-[#0B0C10] text-[#F8F9FA] selection:bg-[#7B2CBF] selection:text-white antialiased">
        <Suspense fallback={<div className="h-20 bg-[#0B0C10] border-b border-white/10" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
