import bcrypt from 'bcrypt';
import { UserProfile } from './types';
import { INITIAL_MOCK_DB } from './firebase';

// In-memory user store (replace with database in production)
interface UserCredentials {
  email: string;
  password: string; // hashed
  profile: UserProfile;
}

class UserStore {
  private users: Map<string, UserCredentials> = new Map();

  constructor() {
    // Initialize with mock users
    this.initializeMockUsers();
  }

  private async initializeMockUsers() {
    // Convert INITIAL_MOCK_DB to hashed password users
    const mockUsers = Object.values(INITIAL_MOCK_DB);

    for (const mockUser of mockUsers) {
      const hashedPassword = await bcrypt.hash('password123', 10); // Default password for demo
      this.users.set(mockUser.email, {
        email: mockUser.email,
        password: hashedPassword,
        profile: mockUser as any,
      });
    }
  }

  async createUser(email: string, password: string, displayName: string): Promise<UserProfile> {
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile: UserProfile = {
      uid: `user_${Date.now()}`,
      email,
      displayName,
      credits: 50,
      plan: 'Free',
      activeCount: 0,
      sitemap: [],
      keywords: [],
      articles: [],
      books: [],
    };

    this.users.set(email, {
      email,
      password: hashedPassword,
      profile,
    });

    return profile;
  }

  async validateUser(email: string, password: string): Promise<UserProfile | null> {
    const user = this.users.get(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user.profile;
  }

  getUserByEmail(email: string): UserProfile | null {
    const user = this.users.get(email);
    return user ? user.profile : null;
  }

  updateUser(email: string, updates: Partial<UserProfile>): UserProfile | null {
    const user = this.users.get(email);
    if (!user) {
      return null;
    }

    user.profile = { ...user.profile, ...updates };
    return user.profile;
  }
}

export const userStore = new UserStore();
