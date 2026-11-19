import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = {
  title: "搜索",
  description: "在全部课程与章节中进行本地全文搜索。",
};

export default function SearchPage() {
  return (
    <div className="container-x max-w-3xl">
      <PageHeader eyebrow="搜索" title="找到你需要的。" desc="基于本地课程数据的全文搜索，支持中英文关键词，多个关键词用空格分隔。" />
      <Suspense fallback={<div className="h-14 rounded-2xl bg-surface" />}>
        <SearchView />
      </Suspense>
    </div>
  );
}
