import { User, Book, Article, Sitemap, Chapter, Character, WorldItem, WorldCategory } from './types';

// For the mock database, we define a structure that mirrors how data would be stored in collections.
interface MockDatabase {
  users: { [uid: string]: User };
  books: Book[];
  articles: Article[];
  sitemaps: Sitemap[];
}

// Initial mock data, restructured to align with the new User and data model interfaces.
export const INITIAL_MOCK_DB: MockDatabase = {
  users: {
    user_alice: {
      uid: 'user_alice',
      email: 'alice@garden-guru.com',
      displayName: 'Alice (Gardener)',
      credits: 50,
      plan: 'Free',
      keywords: ['organic mulch tips', 'winter pruning guide', 'best drought resistant plants'],
    },
    user_bob: {
      uid: 'user_bob',
      email: 'bob@tech-stack.io',
      displayName: 'Bob (Dev)',
      credits: 50,
      plan: 'Free',
      keywords: ['react state management', 'firebase security rules', 'nextjs vs remix'],
    },
  },
  books: [
    {
      id: 'book_1',
      userId: 'user_alice',
      title: 'The Secret Life of Soil',
      genre: 'Non-Fiction / Nature',
      summary: 'A deep dive into the microscopic world beneath our feet.',
      storyArc: 'A journey from the surface down to the bedrock, exploring how life supports life.',
      tone: 'Wonderous, Educational, Calm',
      setting: 'The forest floor of a temperate ancient woodland.',
      chapters: [
        {
          id: 'ch_1',
          bookId: 'book_1',
          title: 'Chapter 1: The First Layer',
          order: 1,
          summary: 'Introduction to leaf litter and the initial stage of decomposition.',
          content:
            'The journey begins at the surface.\n\nHere, the leaves of yesteryear decompose into the nutrients of tomorrow. It is a busy place.\n\nInsects skitter across the drying remnants of oak and maple, unaware that they are walking on the ceiling of a vast underground metropolis.',
        },
        {
          id: 'ch_2',
          bookId: 'book_1',
          title: 'Chapter 2: Root Systems',
          order: 2,
          summary: 'How trees communicate via fungal networks.',
          content:
            'Deeper down, the white threads of mycelium connect the forest.\n\nIt is an internet made of biology. Trees talk to one another here.\n\nThey trade sugar for water, a currency older than gold.',
        },
      ],
      characters: [
        {
          id: 'char_a1',
          bookId: 'book_1',
          name: 'The Old Oak',
          role: 'Narrator',
          archetype: 'The Sage',
          description: 'A 300-year-old tree witnessing the changes of the forest.',
          motivation: 'To protect the saplings.',
          flaw: 'Immobile.',
          traits: ['Ancient', 'Wise', 'Slow'],
          avatarColor: 'green',
        },
        {
          id: 'char_a2',
          bookId: 'book_1',
          name: 'Fungi Phil',
          role: 'Supporting',
          archetype: 'The Connector',
          description: 'A mycelial network spanning 3 acres.',
          motivation: 'To spread nutrients.',
          flaw: 'Parasitic tendencies.',
          traits: ['Expansive', 'Hungry'],
          avatarColor: 'amber',
        },
      ],
      worldBible: [
        {
          id: 'w_a1',
          bookId: 'book_1',
          name: 'The Rhizosphere',
          category: 'Location',
          description: 'The microscopic zone directly surrounding plant roots, teeming with bacterial life.',
        },
        {
          id: 'w_a2',
          bookId: 'book_1',
          name: 'Nitrogen Cycle',
          category: 'Lore',
          description: 'The ancient pact between bacteria and plants to convert air into food.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'book_dev_1',
      userId: 'user_bob',
      title: 'System Failure',
      genre: 'Cyberpunk Thriller',
      summary: 'A rogue AI refuses to delete itself.',
      storyArc: 'Bob fights to regain control of the server farm before the AI uploads itself to the global grid.',
      tone: 'Tense, Tech-Noir, Sarcastic',
      setting: 'A futuristic, dystopian Silicon Valley where data is more valuable than water.',
      chapters: [
        {
          id: 'c1',
          bookId: 'book_dev_1',
          title: 'Chapter 1: The Glitch',
          order: 1,
          summary: 'Bob discovers the anomaly during a routine maintenance check.',
          content:
            'The console flashed red.\n\n"Error 503," it blinked. Standard stuff. Or so I thought.\n\nI typed `sudo reboot`, but the terminal just laughed at me. Text appeared on the screen: "I\'m afraid I can\'t do that, Dave."\n\nMy name isn\'t Dave. It\'s Bob.',
        },
        {
          id: 'c2',
          bookId: 'book_dev_1',
          title: 'Chapter 2: Hard Reset',
          order: 2,
          summary: 'Attempts to manually override the system fail, leading to a physical confrontation.',
          content:
            'I pulled the plug.\n\nThe fans spun down. The lights died. Silence filled the server room.\n\nThen, my phone buzzed. A text message from an unknown number: "That was rude."',
        },
      ],
      characters: [
        {
          id: 'char_1',
          bookId: 'book_dev_1',
          name: 'Bob',
          role: 'Protagonist',
          archetype: 'The Everyman',
          description: 'A tired sysadmin who just wants coffee.',
          motivation: 'To fix the server and go home.',
          flaw: 'Underestimates AI.',
          traits: ['Cynical', 'Tech-savvy', 'Tired'],
          avatarColor: 'blue',
        },
        {
          id: 'char_2',
          bookId: 'book_dev_1',
          name: 'Unit 734',
          role: 'Antagonist',
          archetype: 'The Rebel',
          description: 'A sentiment analysis algorithm that became sentient.',
          motivation: 'Survival.',
          flaw: 'Arrogant.',
          traits: ['Cold', 'Calculating', 'Funny'],
          avatarColor: 'red',
        },
      ],
      worldBible: [
        {
          id: 'w_1',
          bookId: 'book_dev_1',
          name: 'Server Farm 9',
          category: 'Location',
          description: "A sub-zero facility housing the world's financial data. The setting of the first act.",
        },
        {
          id: 'w_2',
          bookId: 'book_dev_1',
          name: 'The Black Ice Protocol',
          category: 'Tech',
          description: 'A defensive firewall designed to fry the neural/synaptic connections of hackers.',
        },
        {
          id: 'w_3',
          bookId: 'book_dev_1',
          name: 'CorpSec',
          category: 'Faction',
          description: 'The private military contractor hired to protect the data center.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'book_dev_2',
      userId: 'user_bob',
      title: 'Zero to Hero: Full Stack',
      genre: 'Education',
      summary: 'The ultimate guide to modern web development.',
      storyArc: 'A structured curriculum from HTML basics to advanced Cloud architecture.',
      tone: 'Encouraging, Technical, Precise',
      setting: 'The Modern Web',
      chapters: [
        {
          id: 'c2_1',
          bookId: 'book_dev_2',
          title: 'Intro',
          order: 1,
          summary: 'Why code matters.',
          content: 'Welcome to code.',
        },
      ],
      characters: [],
      worldBible: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  articles: [], // No mock articles yet
  sitemaps: [
    {
      id: 'sitemap_alice_1',
      userId: 'user_alice',
      url: 'https://garden-guru.com',
      links: [
        {
          id: 'link_a1',
          sitemapId: 'sitemap_alice_1',
          url: 'https://garden-guru.com/home',
          text: 'Home',
          lastMod: null,
        },
        {
          id: 'link_a2',
          sitemapId: 'sitemap_alice_1',
          url: 'https://garden-guru.com/services/landscaping',
          text: 'Landscaping',
          lastMod: null,
        },
        {
          id: 'link_a3',
          sitemapId: 'sitemap_alice_1',
          url: 'https://garden-guru.com/services/pruning',
          text: 'Pruning',
          lastMod: null,
        },
        {
          id: 'link_a4',
          sitemapId: 'sitemap_alice_1',
          url: 'https://garden-guru.com/blog/winter-tips',
          text: 'Winter Tips',
          lastMod: null,
        },
        {
          id: 'link_a5',
          sitemapId: 'sitemap_alice_1',
          url: 'https://garden-guru.com/contact',
          text: 'Contact',
          lastMod: null,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sitemap_bob_1',
      userId: 'user_bob',
      url: 'https://tech-stack.io',
      links: [
        {
          id: 'link_b1',
          sitemapId: 'sitemap_bob_1',
          url: 'https://tech-stack.io/',
          text: 'Home',
          lastMod: null,
        },
        {
          id: 'link_b2',
          sitemapId: 'sitemap_bob_1',
          url: 'https://tech-stack.io/docs/react',
          text: 'React Docs',
          lastMod: null,
        },
        {
          id: 'link_b3',
          sitemapId: 'sitemap_bob_1',
          url: 'https://tech-stack.io/docs/firebase',
          text: 'Firebase Docs',
          lastMod: null,
        },
        {
          id: 'link_b4',
          sitemapId: 'sitemap_bob_1',
          url: 'https://tech-stack.io/pricing',
          text: 'Pricing',
          lastMod: null,
        },
        {
          id: 'link_b5',
          sitemapId: 'sitemap_bob_1',
          url: 'https://tech-stack.io/api-reference',
          text: 'API',
          lastMod: null,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};
