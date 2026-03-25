export interface Topic {
  id: string;
  name: string;
  slug: string;
  main_area: string | null;
  order_num: number | null;
  lesson: string | null;
  video: string | null;
  practice_problems_sheet: string | null;
  answer_key_sheet: string | null;
  easy: string | null;
  medium: string | null;
  hard: string | null;
  image: string | null;
  number_subtopics: number | null;
  created_at: string | null;
}

export interface Subtopic {
  id: string;
  name: string;
  slug: string;
  parent_topic_slug: string | null;
}

export interface QBPractice {
  id: string;
  name: string;
  slug: string;
  order_num: number | null;
  easy: string | null;
  easy_key: string | null;
  medium: string | null;
  medium_key: string | null;
  hard: string | null;
  hard_key: string | null;
}

export interface MathIntro {
  id: string;
  name: string;
  slug: string;
  order_num: number | null;
  main_area: string | null;
  lesson: string | null;
  video: string | null;
  practice_problems_sheet: string | null;
  answer_key_sheet: string | null;
}
