export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Attachment {
  id: string;
  record_id: string;
  url: string;
  type: "IMAGE" | "PDF" | "FILE" | "LINK";
  name: string;
  size?: number;
  created_at: string;
}

export type GoalStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";

export interface LearningGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  status: GoalStatus;
  start_date?: string;
  target_date?: string;
  order: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  series_count: number;
  record_count: number;
  total_duration: number;
  last_record_date?: string;
}

export interface LearningSeries {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  emoji?: string;
  order: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  record_count: number;
  total_duration: number;
  last_record_date?: string;
}

export interface LearningRecord {
  id: string;
  series_id?: string;
  goal_id?: string;
  date: string;
  title?: string;
  content?: any;
  content_raw?: string;
  mood?: number;
  duration?: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  attachments: Attachment[];
}

export interface StatsOverview {
  total_goals: number;
  active_goals: number;
  total_records: number;
  total_duration: number;
  streak: number;
  today_records: number;
  goals_without_today_record: LearningGoal[];
  recent_records: LearningRecord[];
}

export interface HeatmapData {
  date: string;
  count: number;
  duration: number;
}

export interface WeeklyData {
  date: string;
  duration: number;
  count: number;
}
