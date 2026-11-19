export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; lang: string; code: string; title?: string }
  | {
      type: "callout";
      tone: "tip" | "warn" | "info";
      title?: string;
      text: string;
    }
  | { type: "table"; headers: string[]; rows: string[][] };

export type Level = "入门" | "进阶";

export interface ChapterInput {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  level: Level;
  tags: string[];
  featured?: boolean;
  blocks: Block[];
}

export type Accent = "cyan" | "pink" | "lime" | "violet" | "amber" | "sky" | "rose";

export interface CourseInput {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: Accent;
  stage: number;
  chapters: ChapterInput[];
}

export interface Heading {
  id: string;
  text: string;
}

export interface Chapter extends ChapterInput {
  courseSlug: string;
  courseTitle: string;
  headings: Heading[];
  /** global index in the full learning order */
  order: number;
}

export interface Course extends Omit<CourseInput, "chapters"> {
  chapters: Chapter[];
  totalMinutes: number;
}
