import type { CourseInput } from "@/lib/types";

export const llmops: CourseInput = {
  slug: "llmops",
  title: "LLMOps",
  subtitle: "大模型工程化运维",
  description:
    "把 AI Demo 变成稳定可靠的生产服务：Prompt 版本管理、Observability、成本与延迟优化、容错与安全。",
  icon: "⎔",
  accent: "rose",
  stage: 4,
  chapters: [
    {
      slug: "llmops-intro",
      title: "LLMOps 概览：从 Demo 到生产",
      summary:
        "了解 LLM 应用的生命周期，以及 Prompt 版本管理、Tracing、Observability 在生产环境中的作用。",
      minutes: 11,
      level: "入门",
      tags: ["LLMOps", "Observability", "Tracing", "Prompt Versioning"],
      blocks: [
        {
          type: "p",
          text: "一个周末就能做出惊艳的 AI Demo，但让它在生产环境中稳定服务成千上万用户，则是另一回事。**LLMOps** 是 MLOps 在大模型时代的延伸，关注 LLM 应用的开发、部署、监控与持续改进。",
        },
        { type: "h2", text: "MLOps vs LLMOps" },
        {
          type: "table",
          headers: ["维度", "传统 MLOps", "LLMOps"],
          rows: [
            ["核心资产", "训练数据与模型权重", "Prompt、检索数据、工具定义"],
            ["迭代方式", "重新训练", "改 Prompt / 换模型 / 调检索"],
            ["评估", "固定指标", "指标 + LLM-as-a-Judge + 人工"],
            ["成本结构", "训练 GPU 为主", "按 Token 计费的推理成本"],
          ],
        },
        { type: "h2", text: "LLM 应用生命周期" },
        {
          type: "list",
          ordered: true,
          items: [
            "**Prototype**：快速验证想法与模型选型。",
            "**Evaluate**：建立评测集，确定质量基线。",
            "**Deploy**：通过 API Gateway 上线，配置限流与回退。",
            "**Monitor**：采集 Trace、成本、延迟与用户反馈。",
            "**Improve**：把线上失败案例加入评测集，持续迭代。",
          ],
        },
        { type: "h2", text: "Prompt 也需要版本管理" },
        {
          type: "p",
          text: "Prompt 就是代码。建议把 Prompt 存为独立文件或配置，纳入 Git 管理，并在每条日志中记录使用的 `prompt_version`，以便定位问题、快速回滚。",
        },
        {
          type: "code",
          lang: "typescript",
          title: "prompts/summarize.ts",
          code: `export const summarizePrompt = {
  id: "summarize",
  version: "2026-11-01.v3",
  model: "your-model-id",
  temperature: 0.2,
  system: "你是一名专业编辑，用 3 个要点总结用户提供的文章。",
} as const;`,
        },
        { type: "h2", text: "Observability：看见每一次调用" },
        {
          type: "p",
          text: "一次 Agent 请求可能包含多次 LLM 调用、检索和工具执行。**Tracing** 把它们串成一棵调用树，记录每一步的输入输出、Token 用量与耗时。开源方案如 **Langfuse**、**Arize Phoenix**，以及基于 **OpenTelemetry** 的 GenAI 语义约定都可以自托管。",
        },
        {
          type: "callout",
          tone: "warn",
          title: "隐私合规",
          text: "日志中可能包含用户隐私数据。上线前要明确脱敏策略、数据保留期限与访问权限。",
        },
      ],
    },
    {
      slug: "deploy-monitor",
      title: "部署、监控与成本优化",
      summary:
        "学习 TTFT 等关键指标、Streaming、Retry 与 Fallback、Semantic Cache，以及 API Key 安全管理的最佳实践。",
      minutes: 16,
      level: "进阶",
      tags: ["TTFT", "Streaming", "Fallback", "Prompt Caching", "Rate Limit"],
      featured: true,
      blocks: [
        {
          type: "p",
          text: "生产环境的 LLM 服务需要在**质量、延迟、成本、可靠性**之间取得平衡。本章介绍最常用的工程手段。",
        },
        { type: "h2", text: "关键监控指标" },
        {
          type: "table",
          headers: ["指标", "含义", "优化方向"],
          rows: [
            ["TTFT", "Time To First Token，首字延迟", "Streaming、缩短 Prompt、Prompt Caching"],
            ["TPS", "Tokens Per Second，生成速度", "更小/更快的模型"],
            ["Cost / Request", "单次请求成本", "模型路由、缓存、精简上下文"],
            ["Error Rate", "超时、限流、格式错误比例", "Retry、Fallback、Schema 校验"],
            ["User Feedback", "点赞/点踩、重新生成率", "回流到评测集"],
          ],
        },
        { type: "h2", text: "Streaming 提升体感速度" },
        {
          type: "p",
          text: "使用 **Server-Sent Events（SSE）** 逐 Token 返回结果。总耗时不变，但用户在几百毫秒内就能看到输出，体验大幅提升。",
        },
        { type: "h2", text: "Retry 与 Fallback" },
        {
          type: "code",
          lang: "typescript",
          title: "resilient-call.ts",
          code: `type Provider = (prompt: string) => Promise<string>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callWithFallback(
  prompt: string,
  providers: Provider[],     // 主模型在前，备用模型在后
  maxRetries = 3,
): Promise<string> {
  for (const provider of providers) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await provider(prompt);
      } catch (err) {
        const status = (err as { status?: number }).status;
        const retryable = status === 429 || (status !== undefined && status >= 500);
        if (!retryable) break;                       // 4xx 参数错误不重试
        await sleep(2 ** attempt * 500 + Math.random() * 200); // 指数退避 + 抖动
      }
    }
  }
  throw new Error("All providers failed");
}`,
        },
        { type: "h2", text: "成本优化清单" },
        {
          type: "list",
          items: [
            "**Model Routing**：简单问题交给小模型，复杂问题再升级到大模型。",
            "**Prompt Caching**：把稳定的 System Prompt 和文档放在前面，利用平台的前缀缓存降低成本与延迟。",
            "**Semantic Cache**：对语义相近的问题直接复用历史答案。",
            "**控制输出长度**：设置合理的 `max_tokens`，要求简洁回答。",
            "**Batch API**：对实时性要求不高的离线任务使用批处理接口，通常更便宜。",
          ],
        },
        { type: "h2", text: "API Key 安全" },
        {
          type: "code",
          lang: "bash",
          title: ".env.local（不要提交到 Git）",
          code: `# 只在服务端读取，变量名不要加 NEXT_PUBLIC_ 前缀
LLM_API_KEY=your-key-here`,
        },
        {
          type: "list",
          items: [
            "API Key 只存放在服务端环境变量（如 Vercel Environment Variables），绝不出现在前端代码中。",
            "浏览器请求先经过你自己的 API Route，再由服务端调用模型。",
            "为每个用户设置 **Rate Limit** 与用量上限，防止被滥用。",
            "定期轮换 Key，并为不同环境使用不同的 Key。",
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "恭喜完成全部路线！",
          text: "到这里你已经走完了从 LLM 原理到生产运维的完整路线。下一步，挑一个真实的小项目——比如为自己的笔记做一个 RAG 问答助手——把所学串起来吧。",
        },
      ],
    },
  ],
};
