import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingDock } from "@/components/floating-dock";
import { MotionProvider } from "@/components/motion-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { themeScript } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Vercel injects VERCEL_PROJECT_PRODUCTION_URL at build time; fall back to localhost.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: {
    default: "NeoLearn · AI 工程学习平台",
    template: "%s · NeoLearn",
  },
  description:
    "面向中文开发者的 AI 工程入门平台：LLM 基础、Prompt Engineering、RAG、AI Agents、MCP、Model Evaluation 与 LLMOps。",
  keywords: ["AI 工程", "LLM", "Prompt Engineering", "RAG", "AI Agents", "MCP", "LLMOps", "中文教程"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "NeoLearn",
    title: "NeoLearn · AI 工程学习平台",
    description: "从 LLM 原理到生产运维，一条清晰的中文 AI 工程学习路线。",
  },
};

export const viewport: Viewport = {
  // Light is the default theme regardless of OS setting; dark is opt-in via the toggle.
  themeColor: "#ffffff",
};

/** AI assistant is offline for now; see components/floating-dock.tsx to restore. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          跳到主要内容
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <FloatingDock />
        </MotionProvider>
      </body>
    </html>
  );
}
