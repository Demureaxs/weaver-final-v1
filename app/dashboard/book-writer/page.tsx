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
} from 'lucide-react';
import { useUserData, useUserActions } from '../../../context/UserContext';
import { Book, Chapter, Character, WorldItem, WorldCategory } from '../../../lib/types';
import { EditableBlock } from '../../../components/editor/EditableBlock';
import { CharacterModal } from '../../../components/book/CharacterModal';
import { BookContextModal } from '../../../components/book/BookContextModal';
import { ChapterContextModal } from '../../../components/book/ChapterContextModal';
import { ChapterGenerationModal } from '../../../components/book/ChapterGenerationModal';

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
const QuickAddButtons = React.memo(() => {
  return (
    <>
      {WORLD_CATEGORIES.map((cat) => (
        <button
          key={cat}
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

  // Refs for scrolling
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Derived State
  const currentBook = books.find((b) => b.id === activeBookId) || null;
  const currentChapter = localChapters.find((c) => c.id === activeChapterId) || null;

  // We use localCharacters for display to support immediate updates, but fallback to book characters
  const displayCharacters = localCharacters.length > 0 ? localCharacters : currentBook?.characters || [];
  const worldItems = currentBook?.worldBible || [];

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

  const checkAndDeductCredits = (cost: number) => {
    if (!user || !user.profile) {
      alert(`User data or profile is missing. Cannot deduct credits.`);
      return false;
    }
    if (user.profile.credits < cost) {
      alert(`Not enough credits! You need ${cost} but have ${user.profile.credits}. Upgrade to continue.`);
      return false;
    }
    // TODO: This should trigger a backend API call to deduct credits for the user
    // dispatch({ type: 'DEDUCT_CREDITS', payload: cost });
    return true;
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

  const handleCreateBook = async () => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Book',
          genre: 'Fantasy',
          summary: 'A new story waiting to be written.',
        }),
      });
      if (response.ok) {
        const newBook = await response.json();
        setBooks((prevBooks) => [...prevBooks, newBook]);
        setActiveBookId(newBook.id);
      } else {
        console.error('Failed to create book');
      }
    } catch (error) {
      console.error('Error creating book:', error);
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
            onClick={handleCreateBook}
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
        />
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
            <button onClick={handleCreateBook} className='text-gray-400 hover:text-purple-600 transition-colors'>
              <Plus size={16} />
            </button>
          </div>

          {/* Book Tree */}
          <div className='overflow-y-auto p-2 space-y-2'>
            {books.map((book) => {
              const isBookActive = activeBookId === book.id;
              return (
                <div key={book.id} className='space-y-1'>
                  <button
                    onClick={() => setActiveBookId(book.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-between transition-colors ${
                      isBookActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      {isBookActive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className='truncate'>{book.title}</span>
                    </div>
                    <div
                      onClick={(e) => handleDeleteBook(book.id, e)}
                      className='text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer'
                    >
                      <Trash2 size={14} />
                    </div>
                  </button>

                  {/* Chapters List (Only if Book is Active) */}
                  {isBookActive && (
                    <div className='ml-2 pl-2 border-l-2 border-indigo-100 dark:border-indigo-900 space-y-1'>
                      {localChapters.map((chapter) => {
                        const isChapterActive = activeChapterId === chapter.id;
                        return (
                          <div key={chapter.id} className='group'>
                            <button
                              onClick={() => scrollToChapter(chapter.id)}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex flex-col transition-colors ${
                                isChapterActive
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              }`}
                            >
                              <div className='flex items-center gap-2'>
                                <div className={`w-1.5 h-1.5 rounded-full ${isChapterActive ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                <span className='truncate'>{chapter.title}</span>
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
                    <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>{currentBook.title}</h1>
                    <p className='text-xl text-gray-500 italic'>{currentBook.genre}</p>
                    <div className='flex items-center justify-center gap-4 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 py-2 rounded-full max-w-md mx-auto'>
                      <span>{currentBook.tone || 'Tone: Unset'}</span>
                      <span>•</span>
                      <span>{currentBook.setting || 'Setting: Unset'}</span>
                    </div>
                    <p className='text-sm text-gray-400 max-w-lg mx-auto'>{currentBook.summary}</p>
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
                        {chapter.content.split('\n\n').map((paragraph, pIdx) => (
                          <div
                            key={`${chapter.id}-${pIdx}`}
                            ref={(el) => {
                              scrollRefs.current[`${chapter.id}-p-${pIdx}`] = el;
                            }}
                          >
                            <EditableBlock
                              index={pIdx}
                              initialContent={paragraph}
                              tag={getTagForContent(paragraph)}
                              onSave={(idx: number, content: string) => handleParagraphSave(chapter.id, idx, content)}
                              onDeductCredit={checkAndDeductCredits}
                              isStreaming={false}
                              context={getAIContext()} // Pass the generated context
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

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
                        className='bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors'
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
                    <QuickAddButtons />
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
      />
    </>
  );
}
