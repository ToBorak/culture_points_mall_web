export type PublicationStatus = 'draft' | 'published' | 'archived';
export type SectionType =
  | 'editorial' | 'star' | 'values' | 'honors'
  | 'lottery' | 'activity' | 'leaderboard' | 'innovation' | 'custom';

export interface Publication {
  id: number;
  seasonId?: number;
  title: string;
  periodCode: string;
  coverImageUrl?: string;
  introText?: string;
  status: PublicationStatus;
  publishedAt?: string;
  createdAt: string;
}

export interface PublicationSection {
  id: number;
  publicationId: number;
  type: SectionType;
  title: string;
  sortOrder: number;
  visible: boolean;
  aiCopy?: string;
}

export interface PublicationArticle {
  id: number;
  title: string;
  summary?: string;
  contentHtml: string;
  coverImageUrl?: string;
  valueDimensionId?: number;
  status: string;
}

// 快照行（与后端 domain/aggregate.go 的 json tag 对齐）
export interface StarWinnerRow { userId: number; name: string; avatarUrl: string; dimension: string; citation: string; }
export interface ValueRow { dimensionId: number; name: string; description: string; icon: string; color: string; nominationCount: number; }
export interface HonorRow { userId: number; name: string; badge: string; rarity: string; iconUrl: string; earnedAt: string; }
export interface LotteryRow { userId: number; name: string; prize: string; wonAt: string; }
export interface ActivityRow { id: number; title: string; startAt: string; }
export interface LeaderRow { userId: number; name: string; score: number; }

export interface SectionView {
  section: PublicationSection;
  snapshot?: unknown; // 按 section.type 断言为对应 Row[]
  articles?: PublicationArticle[];
}

export interface PublishedView {
  publication: Publication;
  sections: SectionView[];
}
