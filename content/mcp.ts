import type { CourseInput } from "@/lib/types";

export const mcp: CourseInput = {
  slug: "mcp",
  title: "MCP",
  subtitle: "Model Context Protocol",
  description:
    "MCP 是连接 AI 应用与外部工具、数据源的开放协议。学习其架构并动手实现一个 MCP Server。",
  icon: "⌬",
  accent: "amber",
  stage: 3,
  chapters: [
    {
      slug: "mcp-intro",
      title: "MCP 入门：AI 应用的「USB-C 接口」",
      summary:
        "了解 Host、Client、Server 三种角色，Tools、Resources、Prompts 三类能力，以及 stdio 与 Streamable HTTP 传输方式。",
      minutes: 12,
      level: "入门",
      tags: ["MCP", "JSON-RPC", "Tools", "Resources", "stdio"],
      featured: true,
      blocks: [
        {
          type: "p",
          text: "**MCP（Model Context Protocol）** 是一个开放标准，定义了 AI 应用如何以统一方式接入外部工具和数据。可以把它想象成 AI 世界的 **USB-C**：工具只需实现一次 MCP Server，就能被各种支持 MCP 的客户端使用。",
        },
        { type: "h2", text: "为什么需要 MCP" },
        {
          type: "p",
          text: "在 MCP 之前，每个 AI 应用都要为每个数据源单独写集成代码，形成 **M × N** 的组合爆炸。MCP 把它变成 **M + N**：应用实现 Client，服务实现 Server，二者通过标准协议对接。",
        },
        { type: "h2", text: "三种角色" },
        {
          type: "table",
          headers: ["角色", "职责", "例子"],
          rows: [
            ["Host", "面向用户的 AI 应用，管理一个或多个 Client", "桌面 AI 助手、IDE、编程 Agent"],
            ["Client", "Host 内部与某个 Server 保持 1:1 连接的组件", "由 SDK 提供"],
            ["Server", "暴露工具与数据的轻量程序", "GitHub、数据库、文件系统 Server"],
          ],
        },
        { type: "h2", text: "Server 提供的三类能力" },
        {
          type: "list",
          items: [
            "**Tools**：可执行的函数，由模型决定调用，例如 `create_issue`、`query_db`。",
            "**Resources**：只读数据，由应用决定加载，例如文件内容、数据库 Schema。",
            "**Prompts**：预设的提示模板，由用户主动选择，例如「代码审查」模板。",
          ],
        },
        { type: "h2", text: "协议与传输" },
        {
          type: "p",
          text: "MCP 消息基于 **JSON-RPC 2.0**。常见传输方式有两种：**stdio**（Server 作为本地子进程，通过标准输入输出通信）和 **Streamable HTTP**（Server 作为远程服务，适合多用户场景，可配合 OAuth 授权）。",
        },
        {
          type: "code",
          lang: "json",
          title: "tools-call.json",
          code: `// Client → Server：调用工具
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "get_forecast",
    "arguments": { "city": "Shenzhen" }
  }
}

// Server → Client：返回结果
{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "content": [{ "type": "text", "text": "深圳：多云，26°C" }],
    "isError": false
  }
}`,
        },
        {
          type: "callout",
          tone: "info",
          title: "生命周期",
          text: "连接建立后，Client 先发送 `initialize` 协商协议版本与能力（capabilities），随后通过 `tools/list` 发现可用工具，再按需 `tools/call`。",
        },
      ],
    },
    {
      slug: "build-mcp-server",
      title: "动手写一个 MCP Server",
      summary:
        "使用官方 TypeScript SDK 与 Zod 定义工具，通过 stdio 运行，并在客户端中完成配置与调试。",
      minutes: 18,
      level: "进阶",
      tags: ["MCP Server", "TypeScript SDK", "Zod", "MCP Inspector"],
      blocks: [
        {
          type: "p",
          text: "本章我们实现一个「学习笔记」MCP Server，提供一个计算学习时长的工具和一个笔记资源。只需要 Node.js 环境。",
        },
        { type: "h2", text: "初始化项目" },
        {
          type: "code",
          lang: "bash",
          title: "terminal",
          code: `mkdir study-mcp && cd study-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx`,
        },
        { type: "h2", text: "编写 Server" },
        {
          type: "code",
          lang: "typescript",
          title: "src/index.ts",
          code: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "study-notes", version: "1.0.0" });

// Tool：由模型决定何时调用
server.registerTool(
  "estimate_study_time",
  {
    title: "Estimate study time",
    description: "根据章节数和每章分钟数，估算总学习时长",
    inputSchema: {
      chapters: z.number().int().positive(),
      minutesPerChapter: z.number().positive().default(15),
    },
  },
  async ({ chapters, minutesPerChapter }) => {
    const total = chapters * minutesPerChapter;
    return {
      content: [
        { type: "text", text: "预计需要 " + total + " 分钟（约 " + (total / 60).toFixed(1) + " 小时）" },
      ],
    };
  },
);

// Resource：只读数据
server.registerResource(
  "roadmap",
  "notes://roadmap",
  { title: "Learning roadmap", mimeType: "text/markdown" },
  async (uri) => ({
    contents: [{ uri: uri.href, text: "1. LLM 基础\\n2. Prompt\\n3. RAG\\n4. Agents\\n5. MCP" }],
  }),
);

// stdio 模式下不要用 console.log，它会污染协议输出；日志请写到 stderr
await server.connect(new StdioServerTransport());
console.error("study-notes MCP server running");`,
        },
        { type: "h2", text: "在客户端中配置" },
        {
          type: "p",
          text: "大多数支持 MCP 的客户端都使用类似的 JSON 配置：指定启动命令与参数。敏感信息通过 `env` 传入，不要写进代码仓库。",
        },
        {
          type: "code",
          lang: "json",
          title: "mcp.json",
          code: `{
  "mcpServers": {
    "study-notes": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/study-mcp/src/index.ts"],
      "env": { "NOTES_DIR": "/Users/me/notes" }
    }
  }
}`,
        },
        { type: "h2", text: "调试与最佳实践" },
        {
          type: "list",
          items: [
            "使用 **MCP Inspector**（`npx @modelcontextprotocol/inspector`）可视化地列出并调用工具。",
            "工具名称用 `snake_case`，description 写清楚用途和适用时机。",
            "返回结果保持精简，过大的输出会占满模型上下文。",
            "出错时返回 `isError: true` 和可读的错误信息，让模型可以自我修正。",
            "遵循最小权限原则：只读与写入工具分开，敏感操作要求用户确认。",
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "安全提醒",
          text: "只安装可信来源的 MCP Server。Server 能在你的机器上执行代码、访问数据，其工具描述本身也可能包含恶意指令（Tool Poisoning）。",
        },
      ],
    },
  ],
};
