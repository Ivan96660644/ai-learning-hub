import type { CourseInput } from "@/lib/types";

export const llmFundamentals: CourseInput = {
  slug: "llm-fundamentals",
  title: "LLM Fundamentals",
  subtitle: "大语言模型基础",
  description:
    "从 Token、Next-Token Prediction 到 Transformer 架构，建立对 Large Language Model 的第一性理解。",
  icon: "◆",
  accent: "cyan",
  stage: 1,
  chapters: [
    {
      slug: "what-is-llm",
      title: "什么是 LLM：从 Token 到 Next-Token Prediction",
      summary:
        "理解 LLM 如何把文本切成 Token、如何一次预测一个 Token，以及 Temperature、Top-p 等生成参数的作用。",
      minutes: 12,
      level: "入门",
      tags: ["Token", "Tokenizer", "Pretraining", "Temperature", "Context Window"],
      featured: true,
      blocks: [
        {
          type: "p",
          text: "Large Language Model（LLM，大语言模型）本质上是一个**超大规模的概率模型**：给定一段文本，它预测「下一个最可能出现的片段」是什么。ChatGPT、Claude、Gemini、Llama、Qwen 等产品背后都是这种模型。",
        },
        { type: "h2", text: "Token：模型眼中的文字" },
        {
          type: "p",
          text: "模型并不直接读取字符，而是先用 **Tokenizer** 把文本切分为 Token。英文中一个 Token 大约是 3～4 个字母，中文里一个汉字通常对应 1～2 个 Token。常见的切分算法是 `BPE`（Byte Pair Encoding）。",
        },
        {
          type: "code",
          lang: "python",
          title: "count_tokens.py",
          code: `# pip install tiktoken
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
text = "Hello, 大语言模型!"
tokens = enc.encode(text)

print(tokens)          # 一串整数 ID
print(len(tokens))     # Token 数量，决定了计费与上下文占用
print([enc.decode([t]) for t in tokens])`,
        },
        {
          type: "callout",
          tone: "tip",
          title: "为什么要关心 Token？",
          text: "API 按 Token 计费；模型的 **Context Window**（上下文窗口）也以 Token 计量。写 Prompt 时，冗长的输入既贵又会挤占模型可用的上下文。",
        },
        { type: "h2", text: "Next-Token Prediction：一次只写一个词" },
        {
          type: "p",
          text: "LLM 生成文本的方式叫 **Autoregressive（自回归）生成**：模型根据已有内容计算下一个 Token 的概率分布，从中选出一个，追加到末尾，再重复这个过程，直到遇到结束符或达到 `max_tokens` 上限。",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "输入：`今天天气真` → 模型输出概率：`好` 62%、`不错` 21%、`糟` 9% ……",
            "按采样策略选出 `好`，拼接为 `今天天气真好`",
            "把新文本再次输入模型，继续预测下一个 Token",
          ],
        },
        { type: "h2", text: "模型是怎么训练出来的" },
        {
          type: "table",
          headers: ["阶段", "英文", "目的"],
          rows: [
            ["预训练", "Pretraining", "在海量文本上学习语言规律与世界知识"],
            ["指令微调", "SFT (Supervised Fine-Tuning)", "学会按指令回答、遵循对话格式"],
            ["偏好对齐", "RLHF / DPO", "让回答更有帮助、更安全、更符合人类偏好"],
          ],
        },
        { type: "h2", text: "生成参数：Temperature 与 Top-p" },
        {
          type: "list",
          items: [
            "**Temperature**：控制随机性。`0` 接近确定性输出，适合抽取、分类；`0.7～1.0` 更有创造力，适合写作和头脑风暴。",
            "**Top-p（Nucleus Sampling）**：只在累计概率达到 p 的候选 Token 中采样，例如 `top_p=0.9`。",
            "**Max Tokens**：限制输出长度，防止回答失控、节省成本。",
            "**Stop Sequences**：遇到指定字符串时停止生成。",
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "常见误区",
          text: "LLM 不是数据库，它「记住」的是统计规律而不是精确事实，因此会出现 **Hallucination（幻觉）**。需要准确知识时，应结合 RAG 或工具调用。",
        },
        { type: "h2", text: "小结" },
        {
          type: "p",
          text: "记住三个关键词：**Token** 是基本单位，**Next-Token Prediction** 是生成方式，**Context Window** 是能力边界。下一章我们打开黑盒，看看 Transformer 是如何计算这些概率的。",
        },
      ],
    },
    {
      slug: "transformer-attention",
      title: "Transformer 与 Self-Attention 直观理解",
      summary:
        "用直觉和 30 行 NumPy 代码理解 Embedding、Self-Attention、Multi-Head 与 Decoder-only 架构。",
      minutes: 15,
      level: "入门",
      tags: ["Transformer", "Self-Attention", "Embedding", "Decoder-only"],
      blocks: [
        {
          type: "p",
          text: "2017 年的论文 *Attention Is All You Need* 提出了 **Transformer** 架构，如今几乎所有主流 LLM 都基于它的 **Decoder-only** 变体。本章不推公式，只建立直觉。",
        },
        { type: "h2", text: "Embedding：把 Token 变成向量" },
        {
          type: "p",
          text: "每个 Token ID 会被映射为一个高维向量（例如 4096 维），称为 **Embedding**。语义相近的词，向量在空间中也更接近。由于 Transformer 本身不感知顺序，还需要加入 **Positional Encoding**（如 RoPE）告诉模型每个 Token 的位置。",
        },
        { type: "h2", text: "Self-Attention：让每个词「看见」上下文" },
        {
          type: "p",
          text: "考虑句子「小猫没有喝牛奶，因为**它**太烫了」。模型要理解「它」指的是牛奶，就需要让「它」去关注句子里的其他词。Self-Attention 为每个 Token 计算三个向量：",
        },
        {
          type: "list",
          items: [
            "**Query（Q）**：我在找什么信息？",
            "**Key（K）**：我能提供什么信息？",
            "**Value（V）**：我实际携带的内容。",
          ],
        },
        {
          type: "p",
          text: "用 Q 与所有 K 做点积得到相关性分数，经过 `softmax` 归一化成权重，再对 V 加权求和——这就是 **Scaled Dot-Product Attention**。",
        },
        {
          type: "code",
          lang: "python",
          title: "attention.py",
          code: `import numpy as np

def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

def attention(Q, K, V, causal=True):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)          # (seq, seq) 相关性
    if causal:                                # Decoder 只能看左边
        mask = np.triu(np.ones_like(scores), k=1)
        scores = np.where(mask == 1, -1e9, scores)
    weights = softmax(scores)                 # 每行和为 1
    return weights @ V, weights

seq_len, d_model = 4, 8
x = np.random.randn(seq_len, d_model)         # 4 个 Token 的 Embedding
Wq, Wk, Wv = (np.random.randn(d_model, d_model) for _ in range(3))
out, w = attention(x @ Wq, x @ Wk, x @ Wv)
print(np.round(w, 2))  # 下三角注意力矩阵`,
        },
        { type: "h2", text: "Multi-Head 与层叠" },
        {
          type: "p",
          text: "**Multi-Head Attention** 并行运行多组注意力，每个 Head 可以关注不同关系（语法、指代、语义）。一个 Transformer Block = Attention + Feed-Forward Network + 残差连接 + LayerNorm，大模型会堆叠几十到上百层。",
        },
        { type: "h2", text: "Encoder、Decoder 与 Decoder-only" },
        {
          type: "table",
          headers: ["架构", "代表模型", "典型用途"],
          rows: [
            ["Encoder-only", "BERT", "分类、Embedding、检索"],
            ["Encoder-Decoder", "T5", "翻译、摘要"],
            ["Decoder-only", "GPT、Claude、Llama、Qwen", "通用对话与生成"],
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "为什么上下文越长越贵？",
          text: "标准 Self-Attention 需要计算每对 Token 之间的分数，复杂度约为 `O(n²)`。这也是长上下文推理昂贵、需要 KV Cache 等优化的原因。",
        },
      ],
    },
  ],
};
