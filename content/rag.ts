import type { CourseInput } from "@/lib/types";

export const rag: CourseInput = {
  slug: "rag",
  title: "RAG",
  subtitle: "检索增强生成",
  description:
    "Retrieval-Augmented Generation：让 LLM 基于你的私有知识库回答问题，降低幻觉、实时更新知识。",
  icon: "⬡",
  accent: "lime",
  stage: 2,
  chapters: [
    {
      slug: "rag-intro",
      title: "RAG 入门：为什么需要检索增强生成",
      summary:
        "理解 RAG 的完整流水线：Ingest、Chunk、Embed、Retrieve、Generate，并用 50 行代码实现最小可用版本。",
      minutes: 14,
      level: "入门",
      tags: ["RAG", "Embedding", "Vector Database", "Cosine Similarity"],
      featured: true,
      blocks: [
        {
          type: "p",
          text: "LLM 的知识停留在训练截止日期，也不知道你公司的内部文档。**RAG（Retrieval-Augmented Generation）** 的思路很简单：回答问题前，先从知识库中**检索**相关资料，把它们塞进 Prompt，再让模型**生成**答案。",
        },
        { type: "h2", text: "RAG 解决了什么问题" },
        {
          type: "list",
          items: [
            "**知识时效**：更新文档即可更新知识，无需重新训练模型。",
            "**私有数据**：企业文档、产品手册、客服记录都能被利用。",
            "**可溯源**：答案可以附带引用来源，方便核查，降低 Hallucination。",
            "**成本更低**：相比 Fine-tuning，RAG 的实现和维护成本低得多。",
          ],
        },
        { type: "h2", text: "RAG 流水线" },
        {
          type: "list",
          ordered: true,
          items: [
            "**Ingest**：加载 PDF、网页、Markdown 等原始文档。",
            "**Chunk**：把长文档切成几百 Token 的小块。",
            "**Embed**：用 Embedding Model 把每个 Chunk 转为向量。",
            "**Store**：存入 Vector Database（如 pgvector、Qdrant、Chroma、Milvus）。",
            "**Retrieve**：把用户问题也转为向量，找出最相似的 Top-K 个 Chunk。",
            "**Generate**：把检索结果和问题一起交给 LLM 生成答案。",
          ],
        },
        { type: "h2", text: "最小实现：余弦相似度检索" },
        {
          type: "code",
          lang: "python",
          title: "mini_rag.py",
          code: `import numpy as np

def cosine(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

def retrieve(query_vec, chunks, k=3):
    """chunks: list of {"text": str, "vec": np.ndarray}"""
    scored = [(cosine(query_vec, c["vec"]), c["text"]) for c in chunks]
    return [text for _, text in sorted(scored, reverse=True)[:k]]

def build_prompt(question, contexts):
    ctx = "\\n\\n".join(f"[{i+1}] {c}" for i, c in enumerate(contexts))
    return (
        "仅根据下面的资料回答问题，并用 [编号] 标注引用。"
        "如果资料中没有答案，请回答“我不知道”。\\n\\n"
        f"<context>\\n{ctx}\\n</context>\\n\\n问题：{question}"
    )

# embed() 可以是任意 Embedding 模型，包括本地开源模型
# contexts = retrieve(embed(question), chunks)
# answer = llm(build_prompt(question, contexts))`,
        },
        {
          type: "callout",
          tone: "tip",
          title: "关键的一句话",
          text: "在 Prompt 中明确要求「资料中没有就说不知道」，是减少 RAG 幻觉最便宜有效的手段。",
        },
        { type: "h2", text: "RAG vs Fine-tuning" },
        {
          type: "table",
          headers: ["维度", "RAG", "Fine-tuning"],
          rows: [
            ["适合", "注入知识、事实问答", "改变风格、格式、特定技能"],
            ["更新成本", "改文档即可", "需要重新训练"],
            ["可解释性", "可引用来源", "较弱"],
            ["上手难度", "低", "中到高"],
          ],
        },
      ],
    },
    {
      slug: "chunking-retrieval",
      title: "Chunking、Embedding 与检索优化",
      summary:
        "学习 Chunk Size 与 Overlap 的取舍、Hybrid Search、Reranking 与 Metadata Filter，把 RAG 从能用变成好用。",
      minutes: 16,
      level: "进阶",
      tags: ["Chunking", "Hybrid Search", "BM25", "Reranking"],
      blocks: [
        {
          type: "p",
          text: "多数 RAG 效果不佳，问题不在 LLM，而在**检索**：找不到对的资料，再强的模型也无能为力。本章介绍几个最有效的优化手段。",
        },
        { type: "h2", text: "Chunking 策略" },
        {
          type: "p",
          text: "Chunk 太大，会混入无关信息、浪费上下文；太小，则丢失语义完整性。常见起点是 **300～800 Token**，并设置 **10%～20% 的 Overlap**，避免关键句子被切断。",
        },
        {
          type: "code",
          lang: "typescript",
          title: "chunk.ts",
          code: `export function chunkText(text: string, size = 500, overlap = 80): string[] {
  // 优先按段落切分，再合并到接近目标大小
  const paragraphs = text.split(/\\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + p).length > size && current) {
      chunks.push(current.trim());
      current = current.slice(-overlap); // 保留尾部作为重叠
    }
    current += p + "\\n\\n";
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}`,
        },
        {
          type: "table",
          headers: ["策略", "说明", "适用"],
          rows: [
            ["Fixed-size", "按固定长度切分", "快速原型"],
            ["Recursive", "按段落 → 句子 → 字符递归切分", "通用文档"],
            ["Semantic", "按语义相似度断句", "主题跳跃的长文"],
            ["Structure-aware", "按 Markdown 标题、代码块、表格切分", "技术文档"],
          ],
        },
        { type: "h2", text: "Hybrid Search：关键词 + 向量" },
        {
          type: "p",
          text: "向量检索擅长语义匹配，却可能漏掉产品型号、错误码这类精确关键词。**Hybrid Search** 把传统的 **BM25** 关键词检索与向量检索结合，再用 **RRF（Reciprocal Rank Fusion）** 合并排名，是生产环境的常见做法。",
        },
        { type: "h2", text: "Reranking：二次精排" },
        {
          type: "p",
          text: "先用便宜的检索召回 Top-50，再用 **Cross-Encoder Reranker** 对「问题-文档」逐对打分，选出最相关的 Top-5。这一步通常能明显提升答案质量。",
        },
        { type: "h2", text: "更多实用技巧" },
        {
          type: "list",
          items: [
            "**Metadata Filter**：按时间、部门、文档类型预先过滤。",
            "**Query Rewriting**：让 LLM 把口语化问题改写为更适合检索的查询，或拆成多个子查询。",
            "**Contextual Chunk**：给每个 Chunk 加上所属文档标题和章节摘要，提升召回准确率。",
            "**Citation**：要求模型标注引用编号，便于前端展示来源。",
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "先评估再优化",
          text: "没有评测集就调参，等于盲人摸象。建议先准备 30～50 个真实问题与标准答案，度量 Recall@K，再决定优化方向。",
        },
      ],
    },
  ],
};
