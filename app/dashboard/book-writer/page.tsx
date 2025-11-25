'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Users,
  Settings,
  Hash,
  MoreHorizontal,
  MapPin,
  Scroll,
  Zap,
  Monitor,
  Flag,
  Globe,
  Pencil,
  Trash2,
  Library,
  Book as BookIcon,
  Bookmark,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useUserData, useUserActions } from '../../../context/UserContext';
import { Book, Chapter, Character, WorldItem, WorldCategory } from '../../../lib/types';
import { BookContextModal } from '../../../components/book/BookContextModal';
import { ChapterContextModal } from '../../../components/book/ChapterContextModal';
import { ChapterGenerationModal } from '../../../components/book/ChapterGenerationModal';
import { WorldItemModal } from '../../../components/book/WorldItemModal';
import { BookSetupModal } from '../../../components/book/BookSetupModal';

import { EditableBlock } from '../../../components/editor/EditableBlock';
import { CharacterModal } from '../../../components/book/CharacterModal';
// --- ICONS MAPPING ---
const CategoryIcon = ({ category, size = 16 }: { category: WorldCategory; size?: number }) => {
  switch (category) {
    case 'Location':
      return <MapPin size={size} className='text-emerald-500' />;
    case 'Lore':
      return <Scroll size={size} className='text-amber-500' />;
    case 'Magic':
      return <Zap size={size} className='text-purple-500' />;
    case 'Tech':
      return <Monitor size={size} className='text-blue-500' />;
    case 'Faction':
      return <Flag size={size} className='text-red-500' />;
    default:
      return <Globe size={size} className='text-gray-500' />;
  }
};

// --- CONSTANTS ---
const WORLD_CATEGORIES: WorldCategory[] = ['Location', 'Lore', 'Magic', 'Tech', 'Faction'];

// Quick Add Buttons Component - Memoized to prevent reconciliation issues
const QuickAddButtons = React.memo(({ onAdd }: { onAdd: (category: WorldCategory) => void }) => {
  return (
    <>
      {WORLD_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onAdd(cat)}
          className='flex flex-col items-center justify-center p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors'
        >
          <CategoryIcon category={cat} size={14} />
          <span className='text-[10px] mt-1 text-gray-600 dark:text-gray-400'>{cat}</span>
        </button>
      ))}
    </>
  );
});

QuickAddButtons.displayName = 'QuickAddButtons';

// Modals Component
const BookWriterModals: React.FC<{
  isCharacterModalOpen: boolean;
  setIsCharacterModalOpen: (open: boolean) => void;
  handleSaveCharacter: (character: Character) => void;
  editingCharacter: Character | null;
  isBookContextModalOpen: boolean;
  setIsBookContextModalOpen: (open: boolean) => void;
  handleBookSettingsSave: (data: Partial<Book>) => void;
  currentBook: Book | null;
  isChapterContextModalOpen: boolean;
  setIsChapterContextModalOpen: (open: boolean) => void;
  handleChapterSettingsSave: (data: Partial<Chapter>) => void;
  currentChapter: Chapter | null;
  isChapterGenModalOpen: boolean;
  setIsChapterGenModalOpen: (open: boolean) => void;
  onChaptersGenerated: () => void;
  isWorldItemModalOpen: boolean;
  setIsWorldItemModalOpen: (open: boolean) => void;
  handleSaveWorldItem: (worldItem: WorldItem) => void;
  editingWorldItem: WorldItem | null;
}> = ({
  isCharacterModalOpen,
  setIsCharacterModalOpen,
  handleSaveCharacter,
  editingCharacter,
  isBookContextModalOpen,
  setIsBookContextModalOpen,
  handleBookSettingsSave,
  currentBook,
  isChapterContextModalOpen,
  setIsChapterContextModalOpen,
  handleChapterSettingsSave,
  currentChapter,
  isChapterGenModalOpen,
  setIsChapterGenModalOpen,
  onChaptersGenerated,
  isWorldItemModalOpen,
  setIsWorldItemModalOpen,
  handleSaveWorldItem,
  editingWorldItem,
}) => {
  return (
    <>
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onSave={handleSaveCharacter}
        initialData={editingCharacter || undefined}
      />
      <BookContextModal
        isOpen={isBookContextModalOpen && !!currentBook}
        onClose={() => setIsBookContextModalOpen(false)}
        onSave={handleBookSettingsSave}
        initialData={currentBook || undefined}
      />
      <ChapterContextModal
        isOpen={isChapterContextModalOpen && !!currentChapter}
        onClose={() => setIsChapterContextModalOpen(false)}
        onSave={handleChapterSettingsSave}
        initialData={currentChapter || undefined}
        bookTitle={currentBook?.title}
      />
      <ChapterGenerationModal
        isOpen={isChapterGenModalOpen && !!currentBook}
        onClose={() => setIsChapterGenModalOpen(false)}
        bookId={currentBook?.id || ''}
        onGenerated={onChaptersGenerated}
      />
      <WorldItemModal
        isOpen={isWorldItemModalOpen && !!currentBook}
        onClose={() => setIsWorldItemModalOpen(false)}
        onSave={handleSaveWorldItem}
        initialData={editingWorldItem || undefined}
        bookTitle={currentBook?.title}
        existingCategories={[]} // Placeholder for now
      />
    </>
  );
};

export default function BookWriterPage() {
  const state = useUserData();
  const dispatch = useUserActions();
  const { user } = state;

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        } else {
          console.error('Failed to fetch books');
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'characters' | 'world'>('characters');

  // Local content state to allow immediate editing updates
  const [localChapters, setLocalChapters] = useState<Chapter[]>([]);
  const [localCharacters, setLocalCharacters] = useState<Character[]>([]);

  // Modals
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isBookContextModalOpen, setIsBookContextModalOpen] = useState(false);
  const [isChapterContextModalOpen, setIsChapterContextModalOpen] = useState(false);
  const [isChapterGenModalOpen, setIsChapterGenModalOpen] = useState(false);
  const [isWorldItemModalOpen, setIsWorldItemModalOpen] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [editingWorldItem, setEditingWorldItem] = useState<WorldItem | null>(null);

  // Wizard State
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  // Inline Editing State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [editingMetadataField, setEditingMetadataField] = useState<string | null>(null);
  const [tempMetadataValue, setTempMetadataValue] = useState('');

  // Refs for scrolling
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Derived State
  const currentBook = books.find((b) => b.id === activeBookId) || null;
  const currentChapter = localChapters.find((c) => c.id === activeChapterId) || null;

  // We use localCharacters for display to support immediate updates, but fallback to book characters
  const displayCharacters = localCharacters.length > 0 ? localCharacters : currentBook?.characters || [];
  const worldItems = currentBook?.worldBible || [];
  const localWorldItems = currentBook?.worldBible || []; // Initial population
  const [displayWorldItems, setDisplayWorldItems] = useState<WorldItem[]>([]);

  useEffect(() => {
    if (currentBook) {
      setDisplayWorldItems(currentBook.worldBible);
    }
  }, [currentBook?.id]);

  // Init Book & Chapter Selection
  useEffect(() => {
    if (!activeBookId && books.length > 0) {
      setActiveBookId(books[0].id);
    }
  }, [books, activeBookId]);

  // Sync local state when book changes
  useEffect(() => {
    if (currentBook) {
      setLocalChapters(currentBook.chapters);
      setLocalCharacters(currentBook.characters || []);
      if (!activeChapterId && currentBook.chapters.length > 0) {
        setActiveChapterId(currentBook.chapters[0].id);
      }
    }
  }, [currentBook?.id]);

  // CONTEXT GENERATOR FOR AI
  const getAIContext = () => {
    if (!currentBook) return '';
    const charSummary = displayCharacters.map((c) => `${c.name} (${c.role}): ${c.description}`).join('; ');

    let context = `
        Book Title: ${currentBook.title}
        Genre: ${currentBook.genre}
        Story Arc: ${currentBook.storyArc || 'N/A'}
        Tone: ${currentBook.tone || 'N/A'}
        Setting: ${currentBook.setting || 'N/A'}
        Characters: ${charSummary}
      `;

    if (currentChapter) {
      context += `
            Current Chapter: ${currentChapter.title}
            Chapter Summary/Goals: ${currentChapter.summary || 'N/A'}
          `;
    }

    return context.trim();
  };

  const handleScrollTo = (id: string) => {
    const el = scrollRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    handleScrollTo(chapterId);
  };

  const checkAndDeductCredits = async (cost: number) => {
    if (!user || !user.profile) {
      alert(`User data or profile is missing. Cannot deduct credits.`);
      return false;
    }
    if (user.profile.credits < cost) {
      alert(`Not enough credits! You need ${cost} but have ${user.profile.credits}. Upgrade to continue.`);
      return false;
    }

    try {
      const res = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cost, type: 'deduct' }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'UPDATE_USER', payload: { profile: { ...user.profile, credits: data.credits } } });
        return true;
      } else {
        console.error('Failed to deduct credits');
        return false;
      }
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  };

  const getTagForContent = (text: string) => {
    if (text.startsWith('# ')) return 'h1';
    if (text.startsWith('## ')) return 'h2';
    if (text.startsWith('### ')) return 'h3';
    if (text.startsWith('#### ')) return 'h4';
    if (text.startsWith('- ') || text.startsWith('* ')) return 'li';
    if (text.startsWith('![')) return 'img';
    return 'p';
  };

  const handleParagraphSave = async (chapterId: string, pIndex: number, newContent: string) => {
    // Update local state for immediate UI feedback
    setLocalChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const paragraphs = ch.content.split('\n\n');
        paragraphs[pIndex] = newContent;
        return { ...ch, content: paragraphs.join('\n\n') };
      })
    );

    if (currentBook) {
      const chapterToUpdate = localChapters.find((c) => c.id === chapterId);
      if (chapterToUpdate) {
        const paragraphs = chapterToUpdate.content.split('\n\n');
        paragraphs[pIndex] = newContent;
        const updatedContent = paragraphs.join('\n\n');

        try {
          await fetch(`/api/books/${currentBook.id}/chapters`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: chapterId, content: updatedContent }),
          });
        } catch (error) {
          console.error('Failed to save chapter:', error);
        }
      }
    }
  };

  const handleSaveCharacter = async (character: Character) => {
    // Optimistic update
    setLocalCharacters((prev) => {
      const exists = prev.find((c) => c.id === character.id);
      if (exists) {
        return prev.map((c) => (c.id === character.id ? character : c));
      } else {
        return [...prev, character];
      }
    });
    setIsCharacterModalOpen(false);
    setEditingCharacter(null);

    if (currentBook) {
      try {
        // Check if it's an update or create based on if it exists in the original book list
        // Or simply check if the ID looks like a UUID (real) vs a temp one.
        // For simplicity, I'll try to update, if it fails (404), I'll create?
        // Better: If I'm editing, I know it exists. If I'm creating, I don't.
        // But the modal passes the character object.

        // Let's assume if the ID is present in the book's characters, it's an update.
        const isUpdate = currentBook.characters?.some((c) => c.id === character.id);

        const method = isUpdate ? 'PUT' : 'POST';
        const body = isUpdate ? character : { ...character, id: undefined }; // Remove ID for create if it's temp

        const res = await fetch(`/api/books/${currentBook.id}/characters`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const savedChar = await res.json();
          // Update local state with real ID if it was a create
          if (!isUpdate) {
            setLocalCharacters((prev) => prev.map((c) => (c.id === character.id ? savedChar : c)));
          }
        }
      } catch (error) {
        console.error('Failed to save character:', error);
      }
    }
  };

  const handleDeleteCharacter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this character?')) {
      setLocalCharacters((prev) => prev.filter((c) => c.id !== id));

      if (currentBook) {
        try {
          await fetch(`/api/books/${currentBook.id}/characters?id=${id}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Failed to delete character:', error);
        }
      }
    }
  };

  const openCreateModal = () => {
    setEditingCharacter(null);
    setIsCharacterModalOpen(true);
  };

  const openEditModal = (char: Character, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCharacter(char);
    setIsCharacterModalOpen(true);
  };

  const openCreateWorldItemModal = (category?: WorldCategory) => {
    setEditingWorldItem(category ? { id: '', bookId: currentBook?.id || '', name: '', category, description: '' } : null);
    setIsWorldItemModalOpen(true);
  };

  const openEditWorldItemModal = (item: WorldItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorldItem(item);
    setIsWorldItemModalOpen(true);
  };

  const handleBookSettingsSave = async (data: Partial<Book>) => {
    if (currentBook) {
      try {
        const response = await fetch('/api/books', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: currentBook.id }),
        });
        if (response.ok) {
          setBooks((prevBooks) => prevBooks.map((b) => (b.id === currentBook.id ? { ...b, ...data } : b)));
        } else {
          console.error('Failed to update book');
        }
      } catch (error) {
        console.error('Error updating book:', error);
      }
    }
  };

  const handleDeleteBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`/api/books?id=${bookId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookId));
        } else {
          console.error('Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleChapterSettingsSave = (data: Partial<Chapter>) => {
    if (currentChapter) {
      setLocalChapters((prev) => prev.map((ch) => (ch.id === currentChapter.id ? { ...ch, ...data } : ch)));
    }
  };

  const handleChaptersGenerated = async () => {
    // Refresh books to get newly generated chapters
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error refreshing books:', error);
    }
  };

  const handlePolishChapter = async () => {
    if (!currentBook || !currentChapter) return;

    // Optimistic credit check (5 credits)
    if ((user?.profile?.credits || 0) < 5) {
      alert('Insufficient credits. You need 5 credits to polish a chapter.');
      return;
    }

    if (!confirm('This will rewrite the chapter to improve flow and coherence. It costs 5 credits. Continue?')) return;

    setIsPolishing(true);
    try {
      const response = await fetch(`/api/books/${currentBook.id}/chapters/${currentChapter.id}/polish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to polish chapter');
      }

      // Update local state with polished content
      setLocalChapters((prev) => prev.map((c) => (c.id === currentChapter.id ? { ...c, content: data.chapter.content } : c)));

      // Update user credits
      if (user?.profile) {
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            profile: { ...user.profile, credits: data.credits } as any,
          },
        });
      }

      alert('Chapter polished successfully!');
    } catch (error) {
      console.error('Polish error:', error);
      alert('Failed to polish chapter. Please try again.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleWizardComplete = async (
    bookData: Partial<Book>,
    characters: Partial<Character>[],
    worldItems: Partial<WorldItem>[],
    generateDraft: boolean
  ) => {
    try {
      // 1. Create Book
      const bookRes = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookData.title || 'Untitled Book',
          genre: bookData.genre || 'Fiction',
          tone: bookData.tone,
          storyArc: bookData.storyArc,
          summary: bookData.summary,
        }),
      });

      if (!bookRes.ok) throw new Error('Failed to create book');
      const newBook = await bookRes.json();

      // 2. Create Characters
      for (const char of characters) {
        if (char.name) {
          await fetch(`/api/books/${newBook.id}/characters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(char),
          });
        }
      }

      // 3. Create World Items
      for (const item of worldItems) {
        if (item.name) {
          await fetch(`/api/books/${newBook.id}/world`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, bookId: newBook.id }),
          });
        }
      }

      // 4. Generate Draft (Optional)
      if (generateDraft) {
        try {
          const draftRes = await fetch(`/api/books/${newBook.id}/generate-draft`, { method: 'POST' });

          if (!draftRes.ok) {
            const errorData = await draftRes.json();
            throw new Error(errorData.error || 'Failed to generate draft');
          }

          const draftData = await draftRes.json();

          // Update credits from the response
          if (user?.profile && draftData.credits !== undefined) {
            dispatch({
              type: 'UPDATE_USER',
              payload: {
                profile: { ...user.profile, credits: draftData.credits } as any,
              },
            });
          }
        } catch (e: any) {
          console.error('Draft generation failed', e);
          alert(`Book created successfully, but draft generation failed: ${e.message}. You can generate content manually from the chapter menu.`);
        }
      }

      // 5. Refresh & Select
      const refreshRes = await fetch('/api/books');
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setBooks(data);
        setActiveBookId(newBook.id);
      }
    } catch (error) {
      console.error('Wizard completion error:', error);
      alert('Failed to complete book setup.');
    }
  };

  const handleDeleteChapter = async (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chapter?')) {
      // Optimistic update
      setLocalChapters((prev) => prev.filter((ch) => ch.id !== chapterId));

      if (currentBook) {
        try {
          const response = await fetch(`/api/books/${currentBook.id}/chapters?id=${chapterId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            console.error('Failed to delete chapter');
            // Revert optimistic update if API call fails
            // You might need to refetch all chapters or save the original state
          }
        } catch (error) {
          console.error('Error deleting chapter:', error);
          // Revert optimistic update if API call fails
        }
      }
    }
  };

  const handleSaveWorldItem = async (worldItem: WorldItem) => {
    // Optimistic update
    setDisplayWorldItems((prev) => {
      const exists = prev.find((item) => item.id === worldItem.id);
      if (exists) {
        return prev.map((item) => (item.id === worldItem.id ? worldItem : item));
      } else {
        // Assign a temporary ID if it's a new item for optimistic update
        const newItem = worldItem.id ? worldItem : { ...worldItem, id: `temp-${Date.now()}` };
        return [...prev, newItem];
      }
    });
    setIsWorldItemModalOpen(false);
    setEditingWorldItem(null);

    if (currentBook) {
      try {
        const isUpdate = worldItem.id && currentBook.worldBible.some((item) => item.id === worldItem.id);
        const method = isUpdate ? 'PUT' : 'POST';
        const body = isUpdate ? worldItem : { ...worldItem, bookId: currentBook.id };

        const res = await fetch(`/api/books/${currentBook.id}/world`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const savedItem = await res.json();
          // Update local state with real ID if it was a create
          if (!isUpdate) {
            setDisplayWorldItems((prev) => prev.map((item) => (item.id === worldItem.id ? savedItem : item)));
          }
          // Refresh entire book to ensure data consistency
          const response = await fetch('/api/books');
          if (response.ok) {
            const data = await response.json();
            setBooks(data);
          }
        } else {
          console.error('Failed to save world item');
          // TODO: Revert optimistic update if API fails
        }
      } catch (error) {
        console.error('Error saving world item:', error);
        // TODO: Revert optimistic update if API fails
      }
    }
  };

  const handleDeleteWorldItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this world item?')) {
      setDisplayWorldItems((prev) => prev.filter((item) => item.id !== id));

      if (currentBook) {
        try {
          const response = await fetch(`/api/books/${currentBook.id}/world?id=${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            console.error('Failed to delete world item');
            // TODO: Revert optimistic update if API fails
          }
        } catch (error) {
          console.error('Error deleting world item:', error);
          // TODO: Revert optimistic update if API fails
        }
      }
    }
  };

  const handleAddChapter = async () => {
    if (!currentBook) return;

    try {
      const response = await fetch(`/api/books/${currentBook.id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Chapter',
          content: '',
        }),
      });

      if (response.ok) {
        const newChapter = await response.json();
        setLocalChapters((prev) => [...prev, newChapter]);
        setActiveChapterId(newChapter.id);
      } else {
        console.error('Failed to create chapter');
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const handleStartEditingBook = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    setEditingBookId(book.id);
    setTempTitle(book.title);
  };

  const handleSaveBookTitle = async () => {
    if (!editingBookId) return;
    if (!tempTitle.trim()) {
      setEditingBookId(null);
      return;
    }

    // Optimistic update
    setBooks((prev) => prev.map((b) => (b.id === editingBookId ? { ...b, title: tempTitle } : b)));
    setEditingBookId(null);

    try {
      await fetch('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBookId, title: tempTitle }),
      });
    } catch (error) {
      console.error('Failed to update book title', error);
    }
  };

  const handleStartEditingChapter = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChapterId(chapter.id);
    setTempTitle(chapter.title);
  };

  const handleSaveChapterTitle = async () => {
    if (!editingChapterId || !currentBook) return;
    if (!tempTitle.trim()) {
      setEditingChapterId(null);
      return;
    }

    // Optimistic update
    setLocalChapters((prev) => prev.map((c) => (c.id === editingChapterId ? { ...c, title: tempTitle } : c)));
    setEditingChapterId(null);

    try {
      const chapter = localChapters.find((c) => c.id === editingChapterId);
      if (chapter) {
        await fetch(`/api/books/${currentBook.id}/chapters`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingChapterId, title: tempTitle, content: chapter.content }),
        });
      }
    } catch (error) {
      console.error('Failed to update chapter title', error);
    }
  };

  const handleStartEditingMetadata = (field: string, value: string) => {
    setEditingMetadataField(field);
    setTempMetadataValue(value);
  };

  const handleSaveMetadata = async () => {
    if (!editingMetadataField || !currentBook) return;

    const updates = { [editingMetadataField]: tempMetadataValue };

    // Optimistic
    setBooks((prev) => prev.map((b) => (b.id === currentBook.id ? { ...b, ...updates } : b)));
    setEditingMetadataField(null);

    try {
      await fetch('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentBook.id, ...updates }),
      });
    } catch (error) {
      console.error('Failed to save metadata', error);
    }
  };

  const handleAddParagraph = (chapterId: string, index: number) => {
    setLocalChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const paragraphs = ch.content.split('\n\n');
        paragraphs.splice(index + 1, 0, 'New paragraph...');
        const newContent = paragraphs.join('\n\n');

        // Trigger save
        if (currentBook) {
          fetch(`/api/books/${currentBook.id}/chapters`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: chapterId, content: newContent }),
          });
        }

        return { ...ch, content: newContent };
      })
    );
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <>
        <div className='flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in'>
          <div className='bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full mb-4'>
            <BookOpen size={48} className='text-purple-600 dark:text-purple-400' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>No Books Found</h2>
          <p className='text-gray-500'>Create your first book to start writing.</p>
          <button
            onClick={() => setIsSetupWizardOpen(true)}
            className='bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors'
          >
            Create New Book
          </button>
        </div>

        {/* MODALS - Always render for consistent component tree */}
        <BookWriterModals
          isCharacterModalOpen={isCharacterModalOpen}
          setIsCharacterModalOpen={setIsCharacterModalOpen}
          handleSaveCharacter={handleSaveCharacter}
          editingCharacter={editingCharacter}
          isBookContextModalOpen={isBookContextModalOpen}
          setIsBookContextModalOpen={setIsBookContextModalOpen}
          handleBookSettingsSave={handleBookSettingsSave}
          currentBook={currentBook}
          isChapterContextModalOpen={isChapterContextModalOpen}
          setIsChapterContextModalOpen={setIsChapterContextModalOpen}
          handleChapterSettingsSave={handleChapterSettingsSave}
          currentChapter={currentChapter}
          isChapterGenModalOpen={isChapterGenModalOpen}
          setIsChapterGenModalOpen={setIsChapterGenModalOpen}
          onChaptersGenerated={handleChaptersGenerated}
          isWorldItemModalOpen={isWorldItemModalOpen}
          setIsWorldItemModalOpen={setIsWorldItemModalOpen}
          handleSaveWorldItem={handleSaveWorldItem}
          editingWorldItem={editingWorldItem}
        />
        <BookSetupModal isOpen={isSetupWizardOpen} onClose={() => setIsSetupWizardOpen(false)} onSave={handleWizardComplete} />
      </>
    );
  }

  return (
    <>
      <div className='h-[calc(100vh-12rem)] flex gap-4 items-start overflow-hidden animate-fade-in'>
        {/* --- LEFT PANE: BOOK EXPLORER (Tree View) --- */}
        <div className='w-72 flex-shrink-0 flex flex-col max-h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
          {/* Header */}
          <div className='p-4 bg-gray-200 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-shrink-0'>
            <div className='flex items-center gap-2'>
              <Library size={18} className='text-purple-600' />
              <span className='font-bold text-gray-700 dark:text-gray-200 text-sm'>Library</span>
            </div>
            <button onClick={() => setIsSetupWizardOpen(true)} className='text-gray-400 hover:text-purple-600 transition-colors'>
              <Plus size={16} />
            </button>
          </div>

          {/* Book Tree */}
          <div className='overflow-y-auto p-2 space-y-2'>
            {books.map((book) => {
              const isBookActive = activeBookId === book.id;
              return (
                <div key={book.id} className='space-y-1'>
                  <div
                    onClick={() => setActiveBookId(book.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-between transition-colors ${
                      isBookActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className='flex items-center gap-2 flex-grow min-w-0'>
                      {isBookActive ? <ChevronDown size={16} className='flex-shrink-0' /> : <ChevronRight size={16} className='flex-shrink-0' />}
                      {editingBookId === book.id ? (
                        <input
                          type='text'
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onBlur={handleSaveBookTitle}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveBookTitle()}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className='bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-600 rounded px-1 py-0.5 text-sm w-full outline-none'
                        />
                      ) : (
                        <span className='truncate cursor-text' onDoubleClick={(e) => handleStartEditingBook(book, e)} title='Double click to edit'>
                          {book.title}
                        </span>
                      )}
                    </div>
                    <div
                      onClick={(e) => handleDeleteBook(book.id, e)}
                      className='text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer'
                    >
                      <Trash2 size={14} />
                    </div>
                  </div>
                  {isBookActive && (
                    <div className='flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-medium px-3 pb-2'>
                      <span>{book.genre}</span>
                      <span>•</span>
                      <span className='truncate'>{book.summary.substring(0, 50)}...</span>
                    </div>
                  )}
                  {/* Chapters List (Only if Book is Active) */}
                  {isBookActive && (
                    <div className='ml-2 pl-2 border-l-2 border-indigo-100 dark:border-indigo-900 space-y-1'>
                      {localChapters.map((chapter) => {
                        const isChapterActive = activeChapterId === chapter.id;
                        return (
                          <div key={chapter.id} className='group'>
                            <button
                              onClick={() => scrollToChapter(chapter.id)}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors group ${
                                isChapterActive
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              <div className='flex items-center gap-2'>
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isChapterActive ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                {editingChapterId === chapter.id ? (
                                  <input
                                    type='text'
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    onBlur={handleSaveChapterTitle}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveChapterTitle()}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                    className='bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-600 rounded px-1 py-0.5 text-xs w-full outline-none'
                                  />
                                ) : (
                                  <span
                                    className='truncate cursor-text'
                                    onDoubleClick={(e) => handleStartEditingChapter(chapter, e)}
                                    title='Double click to edit'
                                  >
                                    {chapter.title}
                                  </span>
                                )}
                              </div>
                              <div
                                onClick={(e) => handleDeleteChapter(chapter.id, e)}
                                className='text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer opacity-0 group-hover:opacity-100'
                              >
                                <Trash2 size={14} />
                              </div>
                            </button>
                          </div>
                        );
                      })}
                      <button
                        onClick={handleAddChapter}
                        className='w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1 transition-colors pl-6'
                      >
                        <Plus size={12} /> New Chapter
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- MIDDLE PANE: MANUSCRIPT --- */}
        <div className='flex-grow h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative'>
          {currentBook ? (
            <>
              <div className='absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-gray-800 to-transparent z-10 pointer-events-none'></div>
              <div className='flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth'>
                <div className='max-w-3xl mx-auto space-y-16 pb-20'>
                  {/* Title Page Block */}
                  <div className='text-center space-y-4 mb-12 border-b border-gray-100 dark:border-gray-700 pb-8'>
                    {editingMetadataField === 'title' ? (
                      <input
                        type='text'
                        value={tempMetadataValue}
                        onChange={(e) => setTempMetadataValue(e.target.value)}
                        onBlur={handleSaveMetadata}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveMetadata()}
                        autoFocus
                        className='text-4xl font-bold text-gray-900 dark:text-white text-center bg-transparent border-b-2 border-indigo-500 outline-none w-full'
                      />
                    ) : (
                      <h1
                        className='text-4xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 transition-colors'
                        onClick={() => handleStartEditingMetadata('title', currentBook.title)}
                      >
                        {currentBook.title}
                      </h1>
                    )}

                    {editingMetadataField === 'genre' ? (
                      <input
                        type='text'
                        value={tempMetadataValue}
                        onChange={(e) => setTempMetadataValue(e.target.value)}
                        onBlur={handleSaveMetadata}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveMetadata()}
                        autoFocus
                        className='text-xl text-gray-500 italic text-center bg-transparent border-b-2 border-indigo-500 outline-none w-1/2 mx-auto block'
                      />
                    ) : (
                      <p
                        className='text-xl text-gray-500 italic cursor-pointer hover:text-indigo-600 transition-colors'
                        onClick={() => handleStartEditingMetadata('genre', currentBook.genre)}
                      >
                        {currentBook.genre}
                      </p>
                    )}

                    <div className='flex items-center justify-center gap-4 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 py-2 rounded-full max-w-md mx-auto'>
                      {editingMetadataField === 'tone' ? (
                        <input
                          type='text'
                          value={tempMetadataValue}
                          onChange={(e) => setTempMetadataValue(e.target.value)}
                          onBlur={handleSaveMetadata}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveMetadata()}
                          autoFocus
                          className='bg-transparent border-b border-purple-500 outline-none text-center w-24'
                        />
                      ) : (
                        <span onClick={() => handleStartEditingMetadata('tone', currentBook.tone || '')} className='cursor-pointer hover:underline'>
                          {currentBook.tone || 'Set Tone'}
                        </span>
                      )}
                      <span>•</span>
                      {editingMetadataField === 'setting' ? (
                        <input
                          type='text'
                          value={tempMetadataValue}
                          onChange={(e) => setTempMetadataValue(e.target.value)}
                          onBlur={handleSaveMetadata}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveMetadata()}
                          autoFocus
                          className='bg-transparent border-b border-purple-500 outline-none text-center w-24'
                        />
                      ) : (
                        <span
                          onClick={() => handleStartEditingMetadata('setting', currentBook.setting || '')}
                          className='cursor-pointer hover:underline'
                        >
                          {currentBook.setting || 'Set Setting'}
                        </span>
                      )}
                    </div>

                    {editingMetadataField === 'summary' ? (
                      <textarea
                        value={tempMetadataValue}
                        onChange={(e) => setTempMetadataValue(e.target.value)}
                        onBlur={handleSaveMetadata}
                        autoFocus
                        className='text-sm text-gray-400 max-w-lg mx-auto w-full bg-transparent border border-indigo-200 rounded p-2 outline-none h-24'
                      />
                    ) : (
                      <p
                        className='text-sm text-gray-400 max-w-lg mx-auto cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
                        onClick={() => handleStartEditingMetadata('summary', currentBook.summary)}
                      >
                        {currentBook.summary || 'Click to add a summary...'}
                      </p>
                    )}
                  </div>

                  {/* Chapters Loop */}
                  {localChapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      ref={(el) => {
                        scrollRefs.current[chapter.id] = el;
                      }}
                      className='space-y-6'
                    >
                      <div className='flex items-center gap-4 text-gray-400'>
                        <span className='h-px bg-gray-200 dark:bg-gray-700 flex-grow'></span>
                        <Hash size={16} />
                        <span className='h-px bg-gray-200 dark:bg-gray-700 flex-grow'></span>
                      </div>
                      <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>{chapter.title}</h2>

                      <div className='font-serif'>
                        {chapter.content.split('\n\n').map((paragraph: string, pIdx: number) => (
                          <div
                            key={`${chapter.id}-${pIdx}`}
                            ref={(el) => {
                              scrollRefs.current[`${chapter.id}-p-${pIdx}`] = el;
                            }}
                          >
                            <div className='group/block relative'>
                              <EditableBlock
                                index={pIdx}
                                initialContent={paragraph}
                                tag={getTagForContent(paragraph)}
                                onSave={(idx: number, content: string) => handleParagraphSave(chapter.id, idx, content)}
                                isStreaming={false}
                                onDeductCredit={checkAndDeductCredits}
                                context={getAIContext()}
                                // Pass available characters for advanced prompt
                                availableCharacters={displayCharacters}
                                // We need to pass previous/next context, but EditableBlock needs to handle it.
                                // For now, let's just pass the full chapter content or adjacent paragraphs?
                                // Better to pass them as props:
                                previousContext={chapter.content.split('\n\n')[pIdx - 1] || ''}
                                nextContext={chapter.content.split('\n\n')[pIdx + 1] || ''}
                              />
                              {/* Add Paragraph Placeholder */}
                              <div className='h-0 group-hover/block:h-auto overflow-hidden transition-all duration-200 opacity-0 group-hover/block:opacity-100'>
                                <div
                                  onClick={() => handleAddParagraph(chapter.id, pIdx)}
                                  className='mt-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-gray-400 hover:text-indigo-500'
                                >
                                  <Plus size={16} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Chapter Placeholder at end of chapter */}
                      <div
                        onClick={handleAddChapter}
                        className='mt-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-gray-400 hover:text-purple-500 group'
                      >
                        <div className='p-3 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors mb-2'>
                          <Plus size={24} />
                        </div>
                        <span className='font-medium'>Add New Chapter</span>
                      </div>
                    </div>
                  ))}

                  {localChapters.length === 0 && (
                    <div
                      onClick={handleAddChapter}
                      className='mt-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-gray-400 hover:text-purple-500 group'
                    >
                      <div className='p-4 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors mb-3'>
                        <Plus size={32} />
                      </div>
                      <span className='font-bold text-lg'>Start Your First Chapter</span>
                    </div>
                  )}

                  <div className='h-32 flex items-center justify-center text-gray-400 italic'>--- End of Manuscript ---</div>
                </div>
              </div>
            </>
          ) : (
            <div className='flex items-center justify-center h-full text-gray-400'>Select a book to view manuscript</div>
          )}
        </div>

        {/* --- RIGHT PANE: CONTEXT TOOLS --- */}
        <div className='w-80 flex-shrink-0 flex flex-col max-h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
          {/* Header Tabs */}
          <div className='flex border-b border-gray-100 dark:border-gray-700 bg-gray-200 dark:bg-gray-900/50 flex-shrink-0'>
            <button
              onClick={() => setRightPanelTab('characters')}
              className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                rightPanelTab === 'characters'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white dark:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={16} /> Characters
            </button>
            <button
              onClick={() => setRightPanelTab('world')}
              className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                rightPanelTab === 'world'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white dark:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Globe size={16} /> World
            </button>
          </div>

          {/* Content Area */}
          <div className='overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900/30'>
            {rightPanelTab === 'characters' && (
              <div className='space-y-4'>
                {displayCharacters.length > 0 ? (
                  displayCharacters.map((char) => (
                    <div
                      key={char.id}
                      onClick={(e) => openEditModal(char, e)}
                      className='bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all relative overflow-hidden'
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${char.avatarColor || 'gray'}-400`}></div>
                      <div className='flex justify-between items-start mb-2 pl-2'>
                        <div>
                          <h4 className='font-bold text-gray-800 dark:text-gray-100'>{char.name}</h4>
                          <span className='text-[10px] text-gray-400 font-medium uppercase'>{char.archetype || 'Archetype'}</span>
                        </div>
                        <span className='text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wide'>
                          {char.role}
                        </span>
                      </div>
                      <p className='text-xs text-gray-600 dark:text-gray-300 mb-3 pl-2 leading-snug line-clamp-2'>{char.description}</p>
                      <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-50 dark:border-gray-700/50 mt-2'>
                        <button
                          onClick={(e) => openEditModal(char, e)}
                          className='p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors'
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCharacter(char.id, e)}
                          className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8 text-gray-400'>
                    <p className='text-sm'>No characters yet.</p>
                  </div>
                )}
                <button
                  onClick={openCreateModal}
                  className='w-full bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors shadow-sm flex items-center justify-center gap-2'
                >
                  <Plus size={16} /> Create Character
                </button>
              </div>
            )}

            {rightPanelTab === 'world' && (
              <div className='space-y-6'>
                {/* AI CHAPTER GENERATION CARD */}
                <div className='bg-gradient-to-br from-purple-600 to-indigo-700 p-4 rounded-xl text-white shadow-md'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Sparkles size={18} className='text-yellow-300' />
                    <h3 className='font-bold text-sm'>AI Chapter Generation</h3>
                  </div>
                  <p className='text-xs opacity-90 mb-3'>Generate chapter outlines based on your story arc</p>
                  <button
                    onClick={() => setIsChapterGenModalOpen(true)}
                    className='w-full py-2 bg-white text-purple-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors'
                  >
                    Generate Chapters
                  </button>
                </div>

                {/* CHAPTER SETTINGS CARD (Dynamic based on selected chapter) */}
                {currentChapter ? (
                  <div className='bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-blue-100 dark:border-blue-900/50 relative group'>
                    <div className='flex items-center gap-2 mb-3'>
                      <Bookmark size={18} className='text-blue-500' />
                      <h3 className='font-bold text-sm text-gray-800 dark:text-gray-100'>Chapter Settings</h3>
                    </div>
                    <div className='space-y-3 text-xs'>
                      <div className='bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg'>
                        <span className='text-blue-600 dark:text-blue-300 uppercase font-bold text-[10px] block mb-1'>Active Chapter</span>
                        <p className='font-semibold text-gray-700 dark:text-gray-200'>{currentChapter.title}</p>
                      </div>
                      <div>
                        <span className='text-gray-400 uppercase font-bold text-[10px]'>Summary / Goals</span>
                        <p className='opacity-90 leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-3'>
                          {currentChapter.summary || 'No summary set for this chapter.'}
                        </p>
                      </div>

                      <button
                        onClick={handlePolishChapter}
                        disabled={isPolishing}
                        className='w-full mt-2 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
                      >
                        {isPolishing ? <RefreshCw size={14} className='animate-spin' /> : <Sparkles size={14} />}
                        {isPolishing ? 'Polishing...' : 'Polish Chapter (5 Credits)'}
                      </button>
                    </div>
                    <button
                      onClick={() => setIsChapterContextModalOpen(true)}
                      className='absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500'
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                ) : (
                  <div className='bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl text-center'>
                    <p className='text-xs text-blue-600 dark:text-blue-400'>Select a chapter on the left to view its specific settings.</p>
                  </div>
                )}

                {/* STORY SETTINGS CARD */}
                {currentBook && (
                  <div className='bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-xl text-white shadow-md relative group'>
                    <div className='flex items-center gap-2 mb-3'>
                      <BookIcon size={18} className='text-purple-200' />
                      <h3 className='font-bold text-sm'>Story Settings</h3>
                    </div>
                    <div className='space-y-3 text-xs'>
                      <div>
                        <span className='text-indigo-200 uppercase font-bold text-[10px]'>Story Arc</span>
                        <p className='line-clamp-2 leading-relaxed opacity-90'>{currentBook.storyArc || 'Not set'}</p>
                      </div>
                      <div>
                        <span className='text-indigo-200 uppercase font-bold text-[10px]'>Tone</span>
                        <p className='opacity-90'>{currentBook.tone || 'Not set'}</p>
                      </div>
                      <div>
                        <span className='text-indigo-200 uppercase font-bold text-[10px]'>Setting</span>
                        <p className='opacity-90 line-clamp-2'>{currentBook.setting || 'Not set'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBookContextModalOpen(true)}
                      className='absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100'
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}

                {/* WORLD ITEMS LIST */}
                {worldItems.length > 0 ? (
                  <div className='space-y-4'>
                    {worldItems.map((item) => (
                      <div
                        key={item.id}
                        className='bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors relative'
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                            <CategoryIcon category={item.category as WorldCategory} />
                          </div>
                          <div>
                            <h4 className='text-sm font-bold text-gray-800 dark:text-gray-100 leading-none'>{item.name}</h4>
                            <span className='text-[10px] text-gray-400 uppercase font-semibold'>{item.category}</span>
                          </div>
                        </div>
                        <p className='text-xs text-gray-600 dark:text-gray-400 leading-snug'>{item.description}</p>
                        <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <button
                            onClick={(e) => openEditWorldItemModal(item, e)}
                            className='p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors'
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteWorldItem(item.id, e)}
                            className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='bg-white dark:bg-gray-800 p-6 rounded-xl text-center border border-gray-100 dark:border-gray-700'>
                    <Globe size={32} className='mx-auto text-gray-300 mb-2' />
                    <p className='text-xs text-gray-500'>The World Bible is empty.</p>
                  </div>
                )}

                <div className='pt-4 border-t border-gray-100 dark:border-gray-700'>
                  <h4 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>Quick Add</h4>
                  <div className='grid grid-cols-3 gap-2'>
                    <QuickAddButtons onAdd={openCreateWorldItemModal} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* MODALS */}
      <BookWriterModals
        isCharacterModalOpen={isCharacterModalOpen}
        setIsCharacterModalOpen={setIsCharacterModalOpen}
        handleSaveCharacter={handleSaveCharacter}
        editingCharacter={editingCharacter}
        isBookContextModalOpen={isBookContextModalOpen}
        setIsBookContextModalOpen={setIsBookContextModalOpen}
        handleBookSettingsSave={handleBookSettingsSave}
        currentBook={currentBook}
        isChapterContextModalOpen={isChapterContextModalOpen}
        setIsChapterContextModalOpen={setIsChapterContextModalOpen}
        handleChapterSettingsSave={handleChapterSettingsSave}
        currentChapter={currentChapter}
        isChapterGenModalOpen={isChapterGenModalOpen}
        setIsChapterGenModalOpen={setIsChapterGenModalOpen}
        onChaptersGenerated={handleChaptersGenerated}
        isWorldItemModalOpen={isWorldItemModalOpen}
        setIsWorldItemModalOpen={setIsWorldItemModalOpen}
        handleSaveWorldItem={handleSaveWorldItem}
        editingWorldItem={editingWorldItem}
      />
      <BookSetupModal isOpen={isSetupWizardOpen} onClose={() => setIsSetupWizardOpen(false)} onSave={handleWizardComplete} />
    </>
  );
}
