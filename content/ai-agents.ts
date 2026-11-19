import type { CourseInput } from "@/lib/types";

export const aiAgents: CourseInput = {
  slug: "ai-agents",
  title: "AI Agents",
  subtitle: "智能体",
  description:
    "从 Tool Calling 到 ReAct 循环，再到 Planning、Memory 与 Multi-Agent，学习构建能自主完成任务的 AI Agent。",
  icon: "◈",
  accent: "violet",
  stage: 3,
  chapters: [
    {
      slug: "agent-basics",
      title: "AI Agent 是什么：ReAct 循环与 Tool Calling",
      summary:
        "Agent = LLM + Tools + Loop。理解 Tool Calling 的工作方式，并手写一个最小的 Agent Loop。",
      minutes: 14,
      level: "入门",
      tags: ["Agent", "ReAct", "Tool Calling", "Function Calling"],
      featured: true,
      blocks: [
        {
          type: "p",
          text: "普通的 LLM 调用是「一问一答」；**AI Agent** 则让模型在一个循环中自主决定：下一步调用什么工具、观察结果、再决定下一步，直到完成目标。一个流行的简化定义是：**Agent = LLM + Tools + Loop**。",
        },
        { type: "h2", text: "Tool Calling：让模型调用函数" },
        {
          type: "p",
          text: "你用 JSON Schema 描述可用工具（名称、用途、参数），模型在需要时返回一个结构化的「调用请求」，由**你的代码**真正执行，再把结果回传给模型。模型本身从不直接访问外部系统。",
        },
        {
          type: "code",
          lang: "json",
          title: "tool-definition.json",
          code: `{
  "name": "get_weather",
  "description": "查询指定城市的实时天气。用户询问天气时使用。",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": { "type": "string", "description": "城市名，例如 上海" },
      "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
    },
    "required": ["city"]
  }
}`,
        },
        { type: "h2", text: "ReAct：Reason + Act" },
        {
          type: "p",
          text: "**ReAct** 模式让模型交替进行 **Thought（思考）→ Action（行动）→ Observation（观察）**。现代 API 的 Tool Calling 本质上就是 ReAct 的工程化实现。",
        },
        {
          type: "code",
          lang: "typescript",
          title: "agent-loop.ts",
          code: `type ToolCall = { id: string; name: string; input: Record<string, unknown> };
type LLMResponse = { text?: string; toolCalls: ToolCall[] };

const tools: Record<string, (input: any) => Promise<string>> = {
  get_weather: async ({ city }) => city + "：晴，22°C",
  search_docs: async ({ query }) => "找到 3 篇与 " + query + " 相关的文档",
};

export async function runAgent(
  task: string,
  callLLM: (history: unknown[]) => Promise<LLMResponse>,
  maxSteps = 8,
) {
  const history: unknown[] = [{ role: "user", content: task }];

  for (let step = 0; step < maxSteps; step++) {
    const res = await callLLM(history);
    history.push({ role: "assistant", content: res });

    if (res.toolCalls.length === 0) return res.text; // 没有工具调用 = 任务完成

    for (const call of res.toolCalls) {
      const fn = tools[call.name];
      const output = fn ? await fn(call.input) : "Unknown tool: " + call.name;
      history.push({ role: "tool", toolCallId: call.id, content: output });
    }
  }
  return "达到最大步数，已停止。";
}`,
        },
        {
          type: "callout",
          tone: "tip",
          title: "工具描述就是 Prompt",
          text: "模型完全依赖 `description` 判断何时、如何使用工具。写清楚「什么时候用」「参数格式」「返回什么」，比调整 System Prompt 更有效。",
        },
        { type: "h2", text: "Workflow 还是 Agent？" },
        {
          type: "table",
          headers: ["", "Workflow", "Agent"],
          rows: [
            ["控制流", "代码预先定义", "模型动态决定"],
            ["可预测性", "高", "较低"],
            ["适合", "步骤固定的流程", "开放式、难以预设步骤的任务"],
            ["成本", "可控", "步数不确定，需设置上限"],
          ],
        },
        {
          type: "p",
          text: "经验法则：**能用 Workflow 解决就先用 Workflow**，只有在任务确实需要灵活决策时才引入 Agent。",
        },
      ],
    },
    {
      slug: "agent-patterns",
      title: "Agent 设计模式：Planning、Memory 与 Multi-Agent",
      summary:
        "掌握 Planning、Reflection、Memory、Orchestrator-Worker 等常用模式，以及生产环境必备的 Guardrails。",
      minutes: 15,
      level: "进阶",
      tags: ["Planning", "Memory", "Multi-Agent", "Guardrails", "Reflection"],
      blocks: [
        {
          type: "p",
          text: "当任务变复杂，单纯的循环会迷路、遗忘或陷入死循环。下面这些模式能帮助 Agent 更可靠地完成长任务。",
        },
        { type: "h2", text: "Planning：先规划再执行" },
        {
          type: "p",
          text: "**Plan-and-Execute** 模式先让模型输出一个步骤清单（To-do List），再逐步执行，并在每一步之后根据结果更新计划。这让长任务更有条理，也方便人类审核。",
        },
        { type: "h2", text: "Reflection：自我反思" },
        {
          type: "p",
          text: "**Reflection** 让 Agent 在给出结果前进行自检：代码能否运行？是否满足所有需求？对于编程类 Agent，最好的反思信号是**真实的反馈**——运行测试、读取报错，而不是只凭模型「感觉」。",
        },
        { type: "h2", text: "Memory：短期与长期记忆" },
        {
          type: "table",
          headers: ["类型", "实现方式", "示例"],
          rows: [
            ["Short-term", "当前对话的 Context Window", "本轮任务的工具调用记录"],
            ["Long-term", "向量库 / 数据库 / 文件", "用户偏好、项目约定"],
            ["Working Memory", "Scratchpad、To-do 文件", "长任务的进度笔记"],
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Context Engineering",
          text: "上下文窗口是 Agent 最宝贵的资源。对历史进行摘要压缩、只保留相关工具结果、按需加载资料，被称为 **Context Engineering**。",
        },
        { type: "h2", text: "Multi-Agent：分工协作" },
        {
          type: "list",
          items: [
            "**Orchestrator-Worker**：主 Agent 拆解任务，分派给多个子 Agent 并行处理，再汇总结果。",
            "**Routing**：先分类请求，再交给对应的专家 Agent。",
            "**Evaluator-Optimizer**：一个生成，一个评审，循环迭代直到达标。",
          ],
        },
        {
          type: "p",
          text: "Multi-Agent 能并行、能隔离上下文，但也带来更高的 Token 成本与调试难度。只有在单 Agent 明显不足时才考虑。",
        },
        { type: "h2", text: "Guardrails：安全护栏" },
        {
          type: "list",
          items: [
            "设置 **max steps** 与预算上限，防止无限循环。",
            "高风险操作（转账、删除、发邮件）需要 **Human-in-the-loop** 确认。",
            "工具权限最小化：只读工具与写入工具分离。",
            "对工具返回的外部内容保持警惕，防范间接 Prompt Injection。",
            "完整记录 Trace，便于回放与排查。",
          ],
        },
      ],
    },
  ],
};
