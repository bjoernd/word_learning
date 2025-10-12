// ABOUTME: Test suite for database operations with Word storage.
// ABOUTME: Validates add, delete, retrieve, count, and random word selection.
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, addWord, deleteWord, getAllWords, getWordCount, getRandomWords } from './database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await db.words.clear();
  });

  afterEach(async () => {
    await db.words.clear();
  });

  describe('addWord', () => {
    it('should add a word and return its id', async () => {
      const id = await addWord('test');
      expect(id).toBeGreaterThan(0);
    });

    it('should store the word text correctly', async () => {
      const id = await addWord('hello');
      const word = await db.words.get(id);
      expect(word?.word).toBe('hello');
    });
  });

  describe('getAllWords', () => {
    it('should return empty array when no words exist', async () => {
      const words = await getAllWords();
      expect(words).toEqual([]);
    });

    it('should retrieve all words', async () => {
      await addWord('word1');
      await addWord('word2');
      const words = await getAllWords();
      expect(words).toHaveLength(2);
    });
  });

  describe('getWordCount', () => {
    it('should return 0 when database is empty', async () => {
      const count = await getWordCount();
      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      await addWord('word1');
      await addWord('word2');
      const count = await getWordCount();
      expect(count).toBe(2);
    });
  });

  describe('deleteWord', () => {
    it('should delete a word by id', async () => {
      const id = await addWord('test');
      await deleteWord(id);
      const words = await getAllWords();
      expect(words).toHaveLength(0);
    });
  });

  describe('getRandomWords', () => {
    it('should return empty array when database is empty', async () => {
      const random = await getRandomWords(5);
      expect(random).toEqual([]);
    });

    it('should return all words if fewer than requested', async () => {
      await addWord('word1');
      await addWord('word2');
      const random = await getRandomWords(10);
      expect(random).toHaveLength(2);
    });

    it('should return exactly the requested count', async () => {
      await addWord('word1');
      await addWord('word2');
      await addWord('word3');
      await addWord('word4');
      const random = await getRandomWords(2);
      expect(random).toHaveLength(2);
    });
  });
});
