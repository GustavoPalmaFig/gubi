import type { Space } from './space';
import type { SpaceSummary } from './spaceSummary';

export interface SpaceOverview extends Space {
  created_at: string;
  summary: SpaceSummary;
}
