export type SeasonStatus = 'nominating' | 'judging' | 'published' | 'closed';

export interface StarSeason {
  id: number;
  name: string;
  quarterCode: string;
  status: SeasonStatus;
}

export interface SeasonQuota {
  season: StarSeason | null;
  nominateRemaining: number;
}

export type NominationStatus = 'submitted' | 'duplicate' | 'shortlisted' | 'selected' | 'rejected';

export interface Nomination {
  ID: number;
  SeasonID: number;
  NominatorID: number;
  NomineeID: number;
  DimensionID: number;
  CaseText: string;
  CaseRefined?: string | null;
  Status: NominationStatus;
  Score?: number | null;
  CreatedAt: string;
}

export interface MyNominations {
  submitted: Nomination[] | null;
  received: Nomination[] | null;
}
