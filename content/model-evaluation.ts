import type { CourseInput } from "@/lib/types";

export const modelEvaluation: CourseInput = {
  slug: "model-evaluation",
  title: "Model Evaluation",
  subtitle: "模型评估",
  description:
    "没有评估就没有迭代。学习如何构建评测集、选择指标，并使用 LLM-as-a-Judge 评估开放式输出与 RAG 系统。",
  icon: "◎",
  accent: "sky",
  stage: 4,
  chapters: [
    {
      slug: "eval-basics",
      title: "模型评估基础：Benchmark、指标与评测集",
      summary:
        "认识 MMLU、HumanEval 等公开 Benchmark 的局限，学会为自己的业务构建 Golden Dataset 与自动化评测脚本。",
      minutes: 13,
      level: "入门",
      tags: ["Benchmark", "Golden Dataset", "Exact Match", "Metrics"],
      blocks: [
        {
          type: "p",
          text: "LLM 的输出是概率性的，改动一个词的 Prompt 都可能让某些用例变好、另一些变差。**Evaluation（评估）** 是让 AI 应用从「感觉不错」走向「可度量、可迭代」的关键。",
        },
        { type: "h2", text: "公开 Benchmark" },
        {
          type: "table",
          headers: ["Benchmark", "评测能力", "形式"],
          rows: [
            ["MMLU", "多学科知识", "选择题"],
            ["GSM8K", "小学数学推理", "数学应用题"],
            ["HumanEval", "代码生成", "单元测试通过率 pass@k"],
            ["SWE-bench", "真实软件工程任务", "修复 GitHub Issue"],
          ],
        },
        {
          type: "callout",
          tone: "warn",
          title: "Benchmark ≠ 你的业务",
          text: "公开榜单可能存在 **Data Contamination**（测试题泄漏进训练数据），且与具体业务差异很大。选型时请务必在自己的数据上测试。",
        },
        { type: "h2", text: "构建自己的评测集" },
        {
          type: "list",
          ordered: true,
          items: [
            "从真实用户日志中收集 50～200 条有代表性的输入。",
            "覆盖常见场景、边界情况和已知失败案例。",
            "为每条输入标注期望输出或评分标准（Golden Answer / Rubric）。",
            "把评测集纳入版本管理，每次修改 Prompt 或换模型都跑一遍。",
          ],
        },
        { type: "h2", text: "常用指标" },
        {
          type: "list",
          items: [
            "**Exact Match / Accuracy**：适合分类、抽取等有标准答案的任务。",
            "**F1 / Precision / Recall**：适合多标签、实体抽取。",
            "**BLEU / ROUGE**：基于词重叠，常用于翻译、摘要，但与人类判断相关性有限。",
            "**Pass Rate**：代码类任务直接运行测试。",
            "**Latency、Cost**：同样是重要指标，不要只看质量。",
          ],
        },
        {
          type: "code",
          lang: "python",
          title: "run_eval.py",
          code: `import json

def normalize(s: str) -> str:
    return s.strip().lower()

def run_eval(dataset_path: str, predict) -> float:
    with open(dataset_path, encoding="utf-8") as f:
        cases = [json.loads(line) for line in f]   # JSONL: {"input", "expected"}

    passed, failures = 0, []
    for case in cases:
        output = predict(case["input"])
        if normalize(output) == normalize(case["expected"]):
            passed += 1
        else:
            failures.append({**case, "output": output})

    score = passed / len(cases)
    print(f"Accuracy: {score:.1%}  ({passed}/{len(cases)})")
    for f in failures[:5]:
        print("✗", f["input"], "→", f["output"], "| expected:", f["expected"])
    return score`,
        },
        {
          type: "callout",
          tone: "tip",
          title: "看失败样本",
          text: "分数只告诉你「有多差」，失败样本才告诉你「为什么差」。每次评估后花 10 分钟人工阅读失败案例，收获往往最大。",
        },
      ],
    },
    {
      slug: "llm-as-judge",
      title: "LLM-as-a-Judge 与 RAG 评估",
      summary:
        "用 LLM 评估开放式回答：设计 Rubric、Pairwise 比较，规避 Position Bias，并掌握 Faithfulness 等 RAG 指标。",
      minutes: 15,
      level: "进阶",
      tags: ["LLM-as-a-Judge", "Rubric", "Faithfulness", "RAGAS"],
      featured: true,
      blocks: [
        {
          type: "p",
          text: "总结、客服回复、创意写作这类开放式任务没有唯一正确答案，人工评审又慢又贵。**LLM-as-a-Judge** 用一个（通常更强的）模型按照评分标准给输出打分，是目前最常用的规模化评估方法。",
        },
        { type: "h2", text: "设计评分 Rubric" },
        {
          type: "code",
          lang: "text",
          title: "judge-prompt.txt",
          code: `你是一名严格的客服质量评审员。请根据评分标准评估回答。

<question>{{question}}</question>
<reference>{{reference_answer}}</reference>
<answer>{{model_answer}}</answer>

评分标准（每项 1-5 分）：
- correctness：信息是否与参考答案一致，无事实错误
- helpfulness：是否直接解决了用户问题
- tone：语气是否礼貌、专业

先在 <reasoning> 中逐项分析，然后只输出 JSON：
{"correctness": n, "helpfulness": n, "tone": n}`,
        },
        { type: "h2", text: "两种评估方式" },
        {
          type: "table",
          headers: ["方式", "做法", "适合"],
          rows: [
            ["Pointwise", "对单个回答按 Rubric 打分", "持续监控、回归测试"],
            ["Pairwise", "比较 A、B 两个回答哪个更好", "Prompt / 模型 A/B 对比"],
          ],
        },
        { type: "h2", text: "Judge 的偏差与对策" },
        {
          type: "list",
          items: [
            "**Position Bias**：倾向于选择排在前面的答案 → 交换顺序评估两次。",
            "**Verbosity Bias**：偏爱更长的回答 → 在 Rubric 中明确「简洁也是优点」。",
            "**Self-preference**：偏爱与自己风格相似的输出 → 尽量用不同模型做 Judge。",
            "**校准**：抽样 50 条让人工打分，计算与 Judge 的一致率，确认 Judge 可信。",
          ],
        },
        { type: "h2", text: "RAG 专用指标" },
        {
          type: "table",
          headers: ["指标", "衡量什么", "评估对象"],
          rows: [
            ["Context Recall", "需要的信息是否被检索到", "Retriever"],
            ["Context Precision", "检索结果中有多少是相关的", "Retriever"],
            ["Faithfulness", "回答是否忠于检索到的资料（无幻觉）", "Generator"],
            ["Answer Relevance", "回答是否切题", "Generator"],
          ],
        },
        {
          type: "p",
          text: "开源框架如 **RAGAS**、**DeepEval**、**promptfoo** 都内置了这些指标，可以快速接入你的项目，并在 CI 中运行回归评测。",
        },
        {
          type: "callout",
          tone: "info",
          title: "分开评估检索与生成",
          text: "RAG 答错时，先看是**没检索到**（检索问题）还是**检索到了却答错**（生成问题），两者的优化方向完全不同。",
        },
      ],
    },
  ],
};
