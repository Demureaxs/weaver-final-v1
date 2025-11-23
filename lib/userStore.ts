import bcrypt from 'bcrypt';
import { User } from './types'; // Updated import to User
import { INITIAL_MOCK_DB } from './mockdb';

// In-memory user store (replace with database in production)
interface UserCredentials {
  email: string;
  password: string; // hashed
  profile: User; // Updated to User
}

class UserStore {
  private users: Map<string, UserCredentials> = new Map();

  constructor() {
    // Initialize with mock users
    this.initializeMockUsers();
  }

  private async initializeMockUsers() {
    const mockUsers = Object.values(INITIAL_MOCK_DB);

    for (const mockUser of mockUsers) {
      const hashedPassword = await bcrypt.hash('password123', 10); // Default password for demo
      // Extract only fields relevant to the new User interface
      const userProfile: User = {
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        credits: mockUser.credits,
        plan: mockUser.plan,
        keywords: mockUser.keywords || [],
      };
      this.users.set(mockUser.email, {
        email: mockUser.email,
        password: hashedPassword,
        profile: userProfile,
      });
      console.log(`Initialized mock user: ${mockUser.email}, DisplayName: ${mockUser.displayName}`);
    }
  }

  async createUser(email: string, password: string, displayName: string): Promise<User> { // Updated return type
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile: User = { // Updated to User
      uid: `user_${Date.now()}`,
      email,
      displayName,
      credits: 50, // Default credits for new users
      plan: 'Free', // Default plan for new users
      keywords: [],
    };

    this.users.set(email, {
      email,
      password: hashedPassword,
      profile,
    });

    return profile;
  }

  async validateUser(email: string, password: string): Promise<User | null> { // Updated return type
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

  getUserByEmail(email: string): User | null { // Updated return type
    const user = this.users.get(email);
    return user ? user.profile : null;
  }

  updateUser(email: string, updates: Partial<User>): User | null { // Updated argument and return type
    const user = this.users.get(email);
    if (!user) {
      return null;
    }

    user.profile = { ...user.profile, ...updates };
    return user.profile;
  }
}

export const userStore = new UserStore();
