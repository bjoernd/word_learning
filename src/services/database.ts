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

export async function addWord(wordText: string): Promise<number> {
  return await db.words.add({ word: wordText });
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
