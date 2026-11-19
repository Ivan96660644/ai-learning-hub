import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = { title: "搜索" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader
        en="Search"
        title="全站搜索"
        desc="基于本地课程数据的全文搜索，支持中英文关键词，多个关键词用空格分隔。"
      />
      <Suspense fallback={<div className="glass h-14 animate-pulse rounded-2xl" />}>
        <SearchView />
      </Suspense>
    </div>
  );
}
