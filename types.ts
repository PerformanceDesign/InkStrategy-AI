
export type Platform = 'Facebook' | 'Instagram' | 'TikTok' | 'GBP';

export type ContentFormat = 
  | 'Photos' | 'Carousels' | 'Reels' | 'Videos' | 'Stories' | 'Lives' | 'Guides' | 'Broadcast Channels' // Instagram
  | 'Text posts' | 'Photo Albums' | 'Slideshows' | 'Events' | 'Polls' | 'Links' | 'User-Generated Content' // Facebook
  | 'Short-form videos' | 'In-Feed Ads' | 'TopView Ads' | 'Branded Hashtag Challenges' | 'Branded Effects' // TikTok
  | 'Updates' | 'Offers' | 'Products' // GBP
  | 'Single Image'; // General

export type ContentPillar = 
  | 'Funny' | 'Educational' | 'Informational' | 'Sales' 
  | 'Behind the Scenes' | 'Artist Spotlight' | 'Client Stories' | 'Studio Vibe';

export interface TeamMember {
  role: string;
  name: string;
}

export interface UserPreferences {
  gbpLink: string;
  platforms: Platform[];
  frequencyPerWeek: number;
  formats: ContentFormat[];
  pillars: ContentPillar[];
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
  pillar: ContentPillar;
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
