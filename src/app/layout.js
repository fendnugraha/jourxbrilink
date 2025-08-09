import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Jour | BRILink",
    description: "Journal Apps for AgenBRI Link",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased bg-slate-100 text:slate-800 dark:bg-slate-700 dark:text-white`}>{children}</body>
        </html>
    );
}
