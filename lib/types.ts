export interface Article {
  id: string;
  title: string;
  content: string;
  snippet: string;
  status: 'Draft' | 'Published';
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface SitemapLink {
  url: string;
  text: string;
  lastMod?: string;
}

export interface Character {
  id: string;
  name: string;
  role: string; // Protagonist, Antagonist, Mentor, etc.
  archetype?: string; // The Hero, The Jester, etc.
  description: string;
  motivation?: string;
  flaw?: string;
  traits: string[];
  avatarColor?: string; // For UI placeholder
}

export type WorldCategory = 'Location' | 'Lore' | 'Magic' | 'Tech' | 'Faction';

export interface WorldItem {
  id: string;
  name: string;
  category: WorldCategory;
  description: string;
}

export interface Chapter {
  id: string;
  title: string;
  summary?: string; // Short summary for the tree view
  content: string; // Markdown or plain text
  order: number;
}

export interface Book {
  id: string;
  title: string;
  genre: string;
  summary: string; // Logline
  storyArc?: string; // The grand plot architecture
  tone?: string; // Dark, Whimsical, Gritty
  setting?: string; // The high-level environment/world description
  chapters: Chapter[];
  characters: Character[];
  worldBible: WorldItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  credits: number;
  plan: string;
  articles: Article[];
  sitemap: SitemapLink[];
  keywords: string[];
  activeCount: number;
  books: Book[];
}

export interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

export type Action =
  | { type: 'LOGIN'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'DEDUCT_CREDITS'; payload: number }
  | { type: 'ADD_ARTICLE'; payload: Article }
  | { type: 'SET_SITEMAP'; payload: SitemapLink[] }
  | { type: 'TOGGLE_KEYWORD'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<UserProfile> }
  | { type: 'TOGGLE_THEME' };
