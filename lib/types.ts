// Core Data Models

/**
 * Represents the core user entity.
 * This will be the central model, linked from other data models.
 */
export interface User {
  uid: string; // From Firebase Auth
  email: string;
  displayName?: string;
  credits: number;
  plan: string;
  keywords: string[];
}

/**
 * Represents a single article written by a user.
 */
export interface Article {
  id: string;
  userId: string; // Foreign key to User
  title:string;
  content: string;
  snippet: string;
  status: 'Draft' | 'Published';
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

/**
 * Represents a user's sitemap.
 * A user can have one sitemap.
 */
export interface Sitemap {
    id: string;
    userId: string; // Foreign key to User
    url: string;
    links: { url: string; text: string; lastMod?: string }[];
    createdAt: string;
    updatedAt: string;
}

// Book & Writing Related Models

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

/**
 * Represents a single book written by a user.
 */
export interface Book {
  id: string;
  userId: string; // Foreign key to User
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


// Frontend State Management

export interface UserState {
  user: User | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

export type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'TOGGLE_THEME' };
