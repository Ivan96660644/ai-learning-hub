/**
 * Tiny dependency-free syntax highlighter for the languages used in lessons
 * (python, typescript/javascript, json, bash, text). Returns tokens, never HTML,
 * so the output is rendered safely by React.
 */

export type TokenType = "kw" | "str" | "num" | "com" | "fn" | "plain";
export interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS: Record<string, string[]> = {
  python: [
    "def", "return", "import", "from", "as", "for", "in", "if", "elif", "else", "while", "with",
    "class", "try", "except", "finally", "lambda", "not", "and", "or", "is", "None", "True",
    "False", "yield", "async", "await", "pass", "break", "continue", "raise", "print",
  ],
  js: [
    "const", "let", "var", "function", "return", "import", "from", "export", "default", "async",
    "await", "if", "else", "for", "of", "in", "while", "new", "type", "interface", "extends",
    "true", "false", "null", "undefined", "try", "catch", "finally", "throw", "as", "typeof",
    "class", "break", "continue", "switch", "case", "Promise", "string", "number", "boolean",
    "unknown", "any", "void", "Record",
  ],
  bash: ["npm", "npx", "cd", "mkdir", "export", "echo", "install", "init", "run"],
  json: ["true", "false", "null"],
};

function langKey(lang: string): keyof typeof KEYWORDS | "text" {
  const l = lang.toLowerCase();
  if (l === "py" || l === "python") return "python";
  if (["ts", "tsx", "typescript", "js", "jsx", "javascript"].includes(l)) return "js";
  if (["bash", "sh", "shell", "zsh"].includes(l)) return "bash";
  if (l === "json") return "json";
  return "text";
}

export function highlight(code: string, lang: string): Token[] {
  const key = langKey(lang);
  if (key === "text") return [{ type: "plain", text: code }];

  const kw = new Set(KEYWORDS[key]);
  const hashComment = key === "python" || key === "bash";
  const slashComment = key === "js" || key === "json";

  const parts: string[] = [];
  if (hashComment) parts.push("#[^\\n]*");
  if (slashComment) parts.push("\\/\\/[^\\n]*", "\\/\\*[\\s\\S]*?\\*\\/");
  parts.push(
    '"""[\\s\\S]*?"""',
    '"(?:\\\\.|[^"\\\\\\n])*"',
    "'(?:\\\\.|[^'\\\\\\n])*'",
    "`(?:\\\\.|[^`\\\\])*`",
    "\\b\\d+(?:\\.\\d+)?\\b",
    "[A-Za-z_$][\\w$]*",
  );
  const re = new RegExp(parts.join("|"), "g");

  const tokens: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(re)) {
    const text = m[0];
    const idx = m.index ?? 0;
    if (idx > last) tokens.push({ type: "plain", text: code.slice(last, idx) });
    last = idx + text.length;

    let type: TokenType = "plain";
    const c = text[0];
    if ((hashComment && c === "#") || (slashComment && (text.startsWith("//") || text.startsWith("/*")))) {
      type = "com";
    } else if (c === '"' || c === "'" || c === "`") {
      type = "str";
    } else if (/\d/.test(c)) {
      type = "num";
    } else if (kw.has(text)) {
      type = "kw";
    } else if (code[last] === "(") {
      type = "fn";
    }
    tokens.push({ type, text });
  }
  if (last < code.length) tokens.push({ type: "plain", text: code.slice(last) });
  return tokens;
}
