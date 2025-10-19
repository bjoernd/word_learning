// ABOUTME: IndexedDB database setup using Dexie for word storage.
// ABOUTME: Provides functions to add, delete, retrieve, count, and select random words.
import Dexie, { Table } from 'dexie';
import { Word } from '../types';

export class WordDatabase extends Dexie {
  words!: Table<Word, number>;

  constructor() {
    super('WordLearningDB');
    this.version(1).stores({
      words: '++id, word'
    });
  }
}

export const db = new WordDatabase();

const MAX_WORD_COUNT = 1000;
const MAX_WORD_LENGTH = 100;

export async function addWord(wordText: string): Promise<number> {
  // Trim whitespace
  const trimmed = wordText.trim();

  // Validate: empty string
  if (trimmed.length === 0) {
    throw new Error('Word cannot be empty');
  }

  // Validate: length
  if (trimmed.length > MAX_WORD_LENGTH) {
    throw new Error('Word too long (max 100 characters)');
  }

  // Validate: check for duplicates (case-insensitive)
  const existingWords = await db.words.toArray();
  const duplicate = existingWords.find(w => w.word.toLowerCase() === trimmed.toLowerCase());
  if (duplicate) {
    throw new Error('Word already exists');
  }

  // Validate: word count limit
  const count = await db.words.count();
  if (count >= MAX_WORD_COUNT) {
    throw new Error('Maximum word limit reached (1,000)');
  }

  return await db.words.add({ word: trimmed });
}

export async function deleteWord(id: number): Promise<void> {
  await db.words.delete(id);
}

export async function getAllWords(): Promise<Word[]> {
  return await db.words.toArray();
}

export async function getWordCount(): Promise<number> {
  return await db.words.count();
}

export async function getRandomWords(count: number): Promise<Word[]> {
  const allWords = await db.words.toArray();

  if (allWords.length === 0) {
    return [];
  }

  if (allWords.length <= count) {
    return allWords;
  }

  // Fisher-Yates shuffle
  const shuffled = [...allWords];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
