
export type Platform = 'Facebook' | 'Instagram' | 'TikTok' | 'GBP';

export type ContentFormat = 'Reels' | 'Single Image' | 'Carousel' | 'Story' | 'Funny' | 'Educational' | 'Informational' | 'Sales';

export interface TeamMember {
  role: string;
  name: string;
}

export interface UserPreferences {
  gbpLink: string;
  platforms: Platform[];
  frequencyPerWeek: number;
  formats: ContentFormat[];
  teamSize: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Expert';
  teamRoles: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  format: ContentFormat;
  status: 'Draft' | 'Expanded' | 'Scheduled';
  scheduledDate?: string;
  expandedContent?: string;
  blogPost?: string;
  suggestedTags: string[];
}

export interface StudioInfo {
  name: string;
  vibe: string;
  specialties: string[];
  recentReviewsSummary: string;
}
