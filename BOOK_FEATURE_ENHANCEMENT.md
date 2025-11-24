# Book Feature Enhancement Plan

## Overview

Enhance the book writing feature with AI-assisted chapter generation, context-aware refinement, and comprehensive story arc management. This allows both novice writers (with learning difficulties) and experienced authors to craft books with varying levels of AI assistance.

---

## Phase 1: Database Schema Updates ✅ COMPLETE

### 1.1 Update Prisma Schema ✅

**File:** `prisma/schema.prisma`

**Task:** Add new fields to the `Book` and `Chapter` models.

**Status:** ✅ Complete - Added `totalTargetWords` to Book, `targetWordCount` and `actualWordCount` to Chapter. Ran `npx prisma generate` and `npx prisma db push` successfully.

---

## Phase 2: Type Definitions ✅ COMPLETE

### 2.1 Update TypeScript Types ✅

**File:** `lib/types.ts`

**Task:** Update `Book` and `Chapter` interfaces to match new schema.

**Status:** ✅ Complete - Types automatically inherit from Prisma client, no changes needed.

---

## Phase 3: Backend API Updates

### 3.1 Update Chapter API to Calculate Word Count ✅

**File:** `app/api/books/[bookId]/chapters/route.ts`

**Task:** Automatically calculate and store word count when chapter content is saved.

**Instructions:**

1. Open `app/api/books/[bookId]/chapters/route.ts`
2. In the `PUT` handler (around line 66-88), before the `prisma.chapter.update` call:
3. Add word count calculation:

```typescript
// Calculate word count if content is being updated
if (updates.content) {
  const wordCount = updates.content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  updates.actualWordCount = wordCount;
}
```

4. In the `POST` handler (around line 28-63), add the same word count calculation before `prisma.chapter.create`

**Status:** ✅ Complete - Added word count calculation to both POST and PUT handlers. Automatically calculates `actualWordCount` when chapter content is saved.

### 3.2 Create Chapter Generation API

**File:** `app/api/books/[bookId]/generate-chapters/route.ts` (NEW)

**Task:** Create endpoint to AI-generate chapter outlines based on story arc.

**Instructions:**

1. Create new file `app/api/books/[bookId]/generate-chapters/route.ts`
2. Import dependencies:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';
```

3. Create POST handler that:
   - Validates user session
   - Fetches the book and verifies ownership
   - Takes request body: `{ chapterCount: number, averageWordCount: number }`
   - Uses AI to generate chapter titles and summaries based on book's `storyArc`, `genre`, `summary`
   - Creates chapters in database with generated titles, summaries, and `targetWordCount`
   - Returns created chapters

**AI Prompt Template:**

```
Generate ${chapterCount} chapter outlines for a ${book.genre} book titled "${book.title}".

Story Arc: ${book.storyArc}
Book Summary: ${book.summary}

For each chapter, provide:
1. Chapter title
2. Chapter arc (2-3 sentence summary of what happens in this chapter)

Return as JSON array: [{ title: string, summary: string }]
```

**Status:** ✅ Complete - Created API endpoint for AI chapter outline generation. Generates chapter titles and summaries based on story arc.

### 3.3 Create Chapter Content Generation API ✅

**File:** `app/api/books/[bookId]/chapters/[chapterId]/generate/route.ts` (NEW)

**Task:** Generate full chapter content based on chapter arc and book context.

**Instructions:**

1. Create new file `app/api/books/[bookId]/chapters/[chapterId]/generate/route.ts`
2. Create POST handler that:
   - Validates user session and ownership
   - Takes request body: `{ includeCharacters: string[], includeWorldItems: string[], includePreviousChapter: boolean, includeNextChapter: boolean }`
   - Fetches selected characters and world items
   - Fetches previous/next chapters if requested
   - Builds comprehensive AI context
   - Generates chapter content to match `targetWordCount`
   - Streams response back to client
   - Updates chapter content and `actualWordCount` in database

**AI Context Builder:**

```typescript
let context = `
Book: ${book.title} (${book.genre})
Story Arc: ${book.storyArc}
Tone: ${book.tone}
Setting: ${book.setting}

Current Chapter: ${chapter.title}
Chapter Arc: ${chapter.summary}
Target Word Count: ${chapter.targetWordCount}
`;

if (includeCharacters.length > 0) {
  const chars = await prisma.character.findMany({
    where: { id: { in: includeCharacters } },
  });
  context += `\nCharacters:\n${chars.map((c) => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}`;
}

if (includeWorldItems.length > 0) {
  const items = await prisma.worldItem.findMany({
    where: { id: { in: includeWorldItems } },
  });
  context += `\nWorld Elements:\n${items.map((i) => `- ${i.name} (${i.category}): ${i.description}`).join('\n')}`;
}

if (includePreviousChapter && previousChapter) {
  context += `\n\nPrevious Chapter Summary: ${previousChapter.summary}`;
}

if (includeNextChapter && nextChapter) {
  context += `\n\nNext Chapter Summary: ${nextChapter.summary}`;
}
```

**Status:** ⏳ Pending - Need to create API endpoint for full chapter content generation with context

---

## Phase 4: Frontend UI Updates

### 4.1 Update BookContextModal - Add Story Arc & Word Count ✅

**File:** `components/book/BookContextModal.tsx`

**Task:** Add fields for main story arc and total target word count.

**Instructions:**

1. Open `components/book/BookContextModal.tsx`
2. Update `formData` state to include `totalTargetWords`:

```typescript
const [formData, setFormData] = useState({
  summary: '',
  storyArc: '',
  tone: '',
  setting: '',
  totalTargetWords: 0,
});
```

3. In the `useEffect`, add `totalTargetWords: initialData.totalTargetWords || 0`
4. After the "Setting / Environment" section (around line 213), add new section:

```tsx
{
  /* Total Target Word Count */
}
<div className='space-y-2'>
  <label className='text-xs font-bold text-gray-500 uppercase'>Total Book Word Count Target</label>
  <input
    type='number'
    min='500'
    max='500000'
    step='1000'
    value={formData.totalTargetWords}
    onChange={(e) => handleChange('totalTargetWords', parseInt(e.target.value))}
    className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500'
    placeholder='e.g. 80000'
  />
  <p className='text-xs text-gray-400'>Recommended: Short story (5k-20k), Novella (20k-50k), Novel (50k-120k)</p>
</div>;
```

**Status:** ✅ Complete - Added `totalTargetWords` to state and UI. Number input with helper text for recommended word counts.

### 4.2 Update ChapterContextModal - Add Target Word Count ✅

**File:** `components/book/ChapterContextModal.tsx`

**Task:** Add slider for chapter target word count (500-5000 words).

**Instructions:**

1. Open `components/book/ChapterContextModal.tsx`
2. Update `formData` state:

```typescript
const [formData, setFormData] = useState({
  title: '',
  summary: '',
  targetWordCount: 1000,
});
```

3. In the `useEffect`, add `targetWordCount: initialData.targetWordCount || 1000`
4. After the "Chapter Summary / Breakdown" section (around line 154), add:

```tsx
{
  /* Target Word Count Slider */
}
<div className='space-y-2'>
  <div className='flex justify-between items-center'>
    <label className='text-xs font-bold text-gray-500 uppercase'>Target Word Count</label>
    <span className='text-sm font-bold text-blue-600 dark:text-blue-400'>{formData.targetWordCount} words</span>
  </div>
  <input
    type='range'
    min='500'
    max='5000'
    step='100'
    value={formData.targetWordCount}
    onChange={(e) => handleChange('targetWordCount', parseInt(e.target.value))}
    className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
  />
  <div className='flex justify-between text-xs text-gray-400'>
    <span>500</span>
    <span>2750</span>
    <span>5000</span>
  </div>
</div>;
```

**Status:** ✅ Complete - Added `targetWordCount` to state and UI. Slider (500-5000 words) with live word count display.

### 4.3 Create Chapter Generation Modal

**File:** `components/book/ChapterGenerationModal.tsx` (NEW)

**Task:** Create modal for AI-assisted chapter outline generation.

**Instructions:**

1. Create new file `components/book/ChapterGenerationModal.tsx`
2. Create component with props: `{ isOpen, onClose, bookId, onGenerated }`
3. Add form fields:
   - Number of chapters (slider: 1-50, default 10)
   - Average words per chapter (slider: 500-5000, default 2000)
   - Display calculated total: `chapters × avgWords`
4. Add "Generate Chapter Outlines" button that calls `/api/books/[bookId]/generate-chapters`
5. Show loading state during generation
6. On success, call `onGenerated()` and close modal
7. Use consistent styling with other modals (purple theme, same layout structure)

### 4.4 Update EditableBlock - Add Context Selection

**File:** `components/editor/EditableBlock.tsx`

**Task:** Add context selection options to the refinement tooltip.

**Instructions:**

1. Open `components/editor/EditableBlock.tsx`
2. Add new state variables:

```typescript
const [includeCharacters, setIncludeCharacters] = useState<string[]>([]);
const [includeWorldItems, setIncludeWorldItems] = useState<string[]>([]);
const [contextOption, setContextOption] = useState<'none' | 'previous' | 'next' | 'both'>('none');
```

3. Add new props to component:

```typescript
interface EditableBlockProps {
  // ... existing props ...
  availableCharacters?: Character[];
  availableWorldItems?: WorldItem[];
  chapterId?: string;
  bookId?: string;
  hasPreviousChapter?: boolean;
  hasNextChapter?: boolean;
}
```

4. In the refinement tooltip (where AI prompt input is), add ABOVE the prompt input:

```tsx
{
  /* Context Selection */
}
<div className='space-y-2 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
  <p className='text-xs font-bold text-gray-600 dark:text-gray-400 uppercase'>Include Context</p>

  {/* Chapter Context Radio Buttons */}
  <div className='space-y-1'>
    <label className='flex items-center gap-2 text-xs cursor-pointer'>
      <input type='radio' name='context' checked={contextOption === 'none'} onChange={() => setContextOption('none')} />
      <span>No chapter context</span>
    </label>
    {hasPreviousChapter && (
      <label className='flex items-center gap-2 text-xs cursor-pointer'>
        <input type='radio' name='context' checked={contextOption === 'previous'} onChange={() => setContextOption('previous')} />
        <span>Include previous chapter</span>
      </label>
    )}
    {hasNextChapter && (
      <label className='flex items-center gap-2 text-xs cursor-pointer'>
        <input type='radio' name='context' checked={contextOption === 'next'} onChange={() => setContextOption('next')} />
        <span>Include next chapter</span>
      </label>
    )}
    {hasPreviousChapter && hasNextChapter && (
      <label className='flex items-center gap-2 text-xs cursor-pointer'>
        <input type='radio' name='context' checked={contextOption === 'both'} onChange={() => setContextOption('both')} />
        <span>Include both chapters</span>
      </label>
    )}
  </div>

  {/* Character Selection */}
  {availableCharacters && availableCharacters.length > 0 && (
    <div className='space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700'>
      <p className='text-xs font-semibold text-gray-600 dark:text-gray-400'>Characters:</p>
      <div className='max-h-24 overflow-y-auto space-y-1'>
        {availableCharacters.map((char) => (
          <label key={char.id} className='flex items-center gap-2 text-xs cursor-pointer'>
            <input
              type='checkbox'
              checked={includeCharacters.includes(char.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setIncludeCharacters([...includeCharacters, char.id]);
                } else {
                  setIncludeCharacters(includeCharacters.filter((id) => id !== char.id));
                }
              }}
            />
            <span>
              {char.name} ({char.role})
            </span>
          </label>
        ))}
      </div>
    </div>
  )}

  {/* World Items Selection */}
  {availableWorldItems && availableWorldItems.length > 0 && (
    <div className='space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700'>
      <p className='text-xs font-semibold text-gray-600 dark:text-gray-400'>World Elements:</p>
      <div className='max-h-24 overflow-y-auto space-y-1'>
        {availableWorldItems.map((item) => (
          <label key={item.id} className='flex items-center gap-2 text-xs cursor-pointer'>
            <input
              type='checkbox'
              checked={includeWorldItems.includes(item.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setIncludeWorldItems([...includeWorldItems, item.id]);
                } else {
                  setIncludeWorldItems(includeWorldItems.filter((id) => id !== item.id));
                }
              }}
            />
            <span>
              {item.name} ({item.category})
            </span>
          </label>
        ))}
      </div>
    </div>
  )}
</div>;
```

5. Update the AI refinement function to include these context options in the API call

### 4.5 Update BookWriterPage - Add Generation Features

**File:** `app/dashboard/book-writer/page.tsx`

**Task:** Integrate chapter generation modal and pass context to EditableBlock.

**Instructions:**

1. Open `app/dashboard/book-writer/page.tsx`
2. Add state for chapter generation modal:

```typescript
const [isChapterGenModalOpen, setIsChapterGenModalOpen] = useState(false);
```

3. In the right panel "World" tab, add a new section at the top (before Chapter Settings):

```tsx
{
  /* Chapter Generation Card */
}
<div className='bg-gradient-to-br from-purple-600 to-indigo-700 p-4 rounded-xl text-white shadow-md mb-4'>
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
</div>;
```

4. Update `EditableBlock` usage to pass new props:

```tsx
<EditableBlock
  // ... existing props ...
  availableCharacters={displayCharacters}
  availableWorldItems={worldItems}
  chapterId={chapter.id}
  bookId={currentBook.id}
  hasPreviousChapter={pIdx > 0}
  hasNextChapter={pIdx < localChapters.length - 1}
/>
```

5. Add `ChapterGenerationModal` to the modals section:

```tsx
<ChapterGenerationModal
  isOpen={isChapterGenModalOpen}
  onClose={() => setIsChapterGenModalOpen(false)}
  bookId={currentBook?.id}
  onGenerated={() => {
    // Refresh chapters
    fetchBooks();
  }}
/>
```

6. Import the new modal at the top of the file

### 4.6 Add "Generate Draft" Button for Chapters

**File:** `app/dashboard/book-writer/page.tsx`

**Task:** Add button to generate full chapter content using AI.

**Instructions:**

1. In the chapter list (left panel), add a "Generate Draft" button next to each chapter
2. Add state: `const [generatingChapterId, setGeneratingChapterId] = useState<string | null>(null);`
3. Create handler:

```typescript
const handleGenerateChapterDraft = async (chapterId: string) => {
  setGeneratingChapterId(chapterId);
  try {
    const response = await fetch(`/api/books/${currentBook.id}/chapters/${chapterId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        includeCharacters: displayCharacters.map((c) => c.id),
        includeWorldItems: worldItems.map((w) => w.id),
        includePreviousChapter: true,
        includeNextChapter: true,
      }),
    });

    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value);

        // Update local state with streaming content
        setLocalChapters((prev) => prev.map((ch) => (ch.id === chapterId ? { ...ch, content } : ch)));
      }
    }
  } catch (error) {
    console.error('Failed to generate chapter:', error);
  } finally {
    setGeneratingChapterId(null);
  }
};
```

4. Add button in chapter list item:

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    handleGenerateChapterDraft(chapter.id);
  }}
  disabled={generatingChapterId === chapter.id}
  className='text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50'
>
  {generatingChapterId === chapter.id ? 'Generating...' : 'Generate Draft'}
</button>
```

---

## Phase 5: Testing & Validation

### 5.1 Test Database Schema

- [ ] Verify Prisma migration applied successfully
- [ ] Check that new fields appear in database
- [ ] Test creating a book with `totalTargetWords`
- [ ] Test creating a chapter with `targetWordCount` and `actualWordCount`

### 5.2 Test Chapter Generation

- [ ] Test generating chapter outlines via API
- [ ] Verify chapters are created with correct data
- [ ] Test generating full chapter content
- [ ] Verify word count calculation is accurate
- [ ] Test streaming response works correctly

### 5.3 Test UI Components

- [ ] Test BookContextModal with new fields
- [ ] Test ChapterContextModal with word count slider
- [ ] Test ChapterGenerationModal functionality
- [ ] Test EditableBlock context selection
- [ ] Test "Generate Draft" button for chapters
- [ ] Verify all styling is consistent

### 5.4 Test Context Injection

- [ ] Test including previous chapter in generation
- [ ] Test including next chapter in generation
- [ ] Test including selected characters
- [ ] Test including selected world items
- [ ] Test combinations of context options

---

## Success Criteria

- ✅ Users can set a total word count target for their book
- ✅ Users can set individual word count targets per chapter (500-5000 words)
- ✅ Users can AI-generate chapter outlines based on story arc
- ✅ Users can AI-generate full chapter content with context awareness
- ✅ Users can manually edit all generated content
- ✅ Word counts are automatically calculated and displayed
- ✅ Context selection (characters, world items, adjacent chapters) works in refinement
- ✅ All UI styling remains consistent with existing design
- ✅ Both novice and experienced writers can use the features effectively

---

## Notes for Smaller Models

- **Always maintain existing styling** - copy class names from similar components
- **Test after each change** - verify the dev server reloads without errors
- **Use existing patterns** - look at how other modals/forms are structured
- **Word count calculation**: `content.trim().split(/\s+/).filter(w => w.length > 0).length`
- **Streaming responses**: Use `ReadableStream` and `TextDecoder` pattern from generator
- **Context building**: Concatenate all selected context into a single prompt string
- **Radio buttons**: Use `name` attribute to group them, `checked` prop for state
- **Checkboxes**: Use array state, add/remove IDs on change
- **Sliders**: Use `<input type='range'>` with `min`, `max`, `step`, `value`, `onChange`
