import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudyTimer } from "@/components/study-timer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NeoLearn AI · AI 工程学习平台",
    template: "%s · NeoLearn AI",
  },
  description:
    "面向中文开发者的 AI 工程入门平台：LLM 基础、Prompt Engineering、RAG、AI Agents、MCP、Model Evaluation 与 LLMOps。",
};

export const viewport: Viewport = {
  themeColor: "#06051a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <div className="cyber-bg" aria-hidden>
          <div className="cyber-orb left-[8%] top-[18%] h-64 w-64 bg-fuchsia-600" />
          <div
            className="cyber-orb right-[6%] top-[40%] h-72 w-72 bg-cyan-500"
            style={{ animationDelay: "-6s" }}
          />
        </div>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <StudyTimer />
      </body>
    </html>
  );
}
