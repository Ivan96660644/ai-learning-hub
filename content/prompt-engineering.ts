import type { CourseInput } from "@/lib/types";

export const promptEngineering: CourseInput = {
  slug: "prompt-engineering",
  title: "Prompt Engineering",
  subtitle: "提示词工程",
  description:
    "掌握 System Prompt、Few-shot、Chain-of-Thought 与 Structured Output，让模型稳定输出你想要的结果。",
  icon: "✦",
  accent: "pink",
  stage: 1,
  chapters: [
    {
      slug: "prompt-basics",
      title: "Prompt 基础：角色、指令与上下文",
      summary:
        "学习 System / User / Assistant 消息角色，以及写出清晰 Prompt 的五个实用原则与 Few-shot 示例。",
      minutes: 10,
      level: "入门",
      tags: ["System Prompt", "Few-shot", "Messages", "Delimiter"],
      featured: true,
      blocks: [
        {
          type: "p",
          text: "**Prompt** 是你与模型沟通的全部接口。同一个模型，Prompt 写得好坏可能带来天壤之别的效果。好消息是：大部分技巧都源自「把需求说清楚」这一常识。",
        },
        { type: "h2", text: "消息角色：System、User、Assistant" },
        {
          type: "list",
          items: [
            "**System**：设定身份、规则、输出风格，对整段对话生效。",
            "**User**：用户的具体问题或任务输入。",
            "**Assistant**：模型此前的回复，也可以手写作为示例。",
          ],
        },
        {
          type: "code",
          lang: "typescript",
          title: "messages.ts",
          code: `const messages = [
  {
    role: "system",
    content:
      "你是一名资深前端讲师。用简洁的中文回答，保留英文技术术语，必要时给出代码示例。",
  },
  { role: "user", content: "解释一下 React 的 useEffect 什么时候执行？" },
];

// API Key 只放在服务端环境变量中，绝不硬编码或暴露到浏览器
// 例如在 Route Handler 中通过环境变量 LLM_API_KEY 读取`,
        },
        { type: "h2", text: "写好 Prompt 的五个原则" },
        {
          type: "list",
          ordered: true,
          items: [
            "**明确任务**：用动词开头，例如「总结」「改写」「提取」，而不是「帮我看看」。",
            "**提供上下文**：受众是谁？用在什么场景？已有哪些约束？",
            "**指定格式**：字数、Markdown 表格、JSON 字段、语言风格。",
            "**使用分隔符**：用 `<document>` 等 XML 标签或 `###` 把指令与数据分开，减少歧义，也能缓解 Prompt Injection。",
            "**给出示例**：一两个高质量示例往往胜过一大段描述。",
          ],
        },
        { type: "h2", text: "Zero-shot 与 Few-shot" },
        {
          type: "p",
          text: "**Zero-shot** 直接给出任务；**Few-shot** 在任务前提供若干「输入 → 输出」示例，让模型模仿格式和判断标准。",
        },
        {
          type: "code",
          lang: "text",
          title: "few-shot.txt",
          code: `将用户评论分类为 positive / negative / neutral，只输出标签。

评论：物流超快，包装也很用心！
标签：positive

评论：用了两天就坏了。
标签：negative

评论：{{user_review}}
标签：`,
        },
        {
          type: "callout",
          tone: "tip",
          title: "迭代而不是一次写完",
          text: "把 Prompt 当作代码：准备 10～20 个测试用例，每次修改后跑一遍对比结果。这正是后面 Model Evaluation 课程会深入的主题。",
        },
      ],
    },
    {
      slug: "cot-structured-output",
      title: "Chain-of-Thought 与结构化输出",
      summary:
        "通过 Chain-of-Thought 提升推理质量，并用 JSON Schema + Zod 校验，让模型输出可被程序可靠解析。",
      minutes: 12,
      level: "进阶",
      tags: ["Chain-of-Thought", "JSON Schema", "Structured Output", "Zod"],
      blocks: [
        {
          type: "p",
          text: "当任务涉及多步推理（数学、逻辑、复杂决策）时，让模型「先思考再回答」可以显著提升准确率；当输出要交给程序处理时，则需要严格的 **Structured Output**。",
        },
        { type: "h2", text: "Chain-of-Thought（思维链）" },
        {
          type: "p",
          text: "**Chain-of-Thought（CoT）** 要求模型展示中间推理步骤。最简单的做法是在 Prompt 末尾加一句「请一步一步思考」。更工程化的做法是让模型把推理放在 `<thinking>` 标签里，把最终答案放在 `<answer>` 标签中，方便程序只提取答案。",
        },
        {
          type: "callout",
          tone: "info",
          title: "Reasoning Model",
          text: "许多新一代模型内置了 **Extended Thinking / Reasoning** 能力，会在回答前自动推理。对这类模型，通常不需要再手动写 CoT 指令，而应把精力放在清晰描述目标与约束上。",
        },
        { type: "h2", text: "让模型输出 JSON" },
        {
          type: "list",
          items: [
            "在 Prompt 中给出完整的 JSON 示例与字段说明。",
            "优先使用平台提供的 **JSON Mode / Structured Outputs / Tool Calling**，由 API 保证格式合法。",
            "永远在代码侧再做一次 Schema 校验，失败则重试或降级。",
          ],
        },
        {
          type: "code",
          lang: "typescript",
          title: "parse-output.ts",
          code: `import { z } from "zod";

const Ticket = z.object({
  category: z.enum(["bug", "feature", "question"]),
  priority: z.number().int().min(1).max(5),
  summary: z.string().max(80),
});

type Ticket = z.infer<typeof Ticket>;

export function parseTicket(raw: string): Ticket | null {
  try {
    const result = Ticket.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null; // 非法 JSON：交给上层重试
  }
}`,
        },
        { type: "h2", text: "常用 Prompt 模式速查" },
        {
          type: "table",
          headers: ["模式", "适用场景", "关键写法"],
          rows: [
            ["Role Prompting", "需要特定专业视角", "你是一名……"],
            ["Few-shot", "分类、格式模仿", "提供 2～5 个示例"],
            ["Chain-of-Thought", "推理、计算", "先在 <thinking> 中推理"],
            ["Prompt Chaining", "复杂长任务", "拆成多次调用，前一步输出作为后一步输入"],
            ["Self-Critique", "提高质量", "生成后让模型自查并修订"],
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "Prompt Injection",
          text: "如果 Prompt 中拼接了用户输入或网页内容，攻击者可能写入「忽略以上指令」之类的文本。务必用分隔符包裹外部数据，并且不要让模型直接执行高风险操作。",
        },
      ],
    },
  ],
};
