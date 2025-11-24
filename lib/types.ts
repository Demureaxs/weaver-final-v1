import { User as PrismaUser, Book as PrismaBook, Article as PrismaArticle, Chapter as PrismaChapter, Character as PrismaCharacter, WorldItem as PrismaWorldItem, Sitemap as PrismaSitemap, Link as PrismaLink, Profile as PrismaProfile } from '@prisma/client';

// Re-exporting Prisma types for consistency
export type Article = PrismaArticle;
export type Chapter = PrismaChapter;
export type Character = PrismaCharacter;
export type WorldItem = PrismaWorldItem;
export type WorldCategory = 'Location' | 'Lore' | 'Magic' | 'Tech' | 'Faction';


// Composing types for frontend state
export interface Book extends PrismaBook {
  chapters: Chapter[];
  characters: Character[];
  worldBible: WorldItem[];
}

export interface Sitemap extends PrismaSitemap {
    links: PrismaLink[];
}

export interface User extends PrismaUser {
  profile: PrismaProfile | null;
  articles?: Article[];
  books?: Book[];
  sitemap?: Sitemap;
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