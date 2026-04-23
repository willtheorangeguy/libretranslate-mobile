import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Translation } from '../types';
import { UI_CONSTANTS } from '../constants';

SQLite.enablePromise(true);

type DbRow = {
  id: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  created_at: number;
  is_favorite: number;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const mapRowToTranslation = (row: DbRow): Translation => ({
  id: row.id,
  sourceText: row.source_text,
  translatedText: row.translated_text,
  sourceLang: row.source_lang,
  targetLang: row.target_lang,
  timestamp: row.created_at,
  isFavorite: row.is_favorite === 1,
});

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabase({
      name: 'libretranslate.db',
      location: 'default',
    });
  }
  return dbPromise;
};

export const DatabaseService = {
  async initialize(): Promise<void> {
    const db = await getDb();
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS translations (
        id TEXT PRIMARY KEY NOT NULL,
        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        source_lang TEXT NOT NULL,
        target_lang TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        is_favorite INTEGER NOT NULL DEFAULT 0
      );
    `);

    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_translations_created_at
      ON translations(created_at DESC);
    `);
  },

  async saveTranslation(translation: Translation): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `
        INSERT OR REPLACE INTO translations
        (id, source_text, translated_text, source_lang, target_lang, created_at, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      [
        translation.id,
        translation.sourceText,
        translation.translatedText,
        translation.sourceLang,
        translation.targetLang,
        translation.timestamp,
        translation.isFavorite ? 1 : 0,
      ]
    );
  },

  async getHistory(search = ''): Promise<Translation[]> {
    const db = await getDb();
    const query = search.trim()
      ? `
          SELECT *
          FROM translations
          WHERE source_text LIKE ? OR translated_text LIKE ?
          ORDER BY created_at DESC
          LIMIT ?;
        `
      : `
          SELECT *
          FROM translations
          ORDER BY created_at DESC
          LIMIT ?;
        `;

    const params = search.trim()
      ? [`%${search}%`, `%${search}%`, UI_CONSTANTS.MAX_HISTORY_ITEMS]
      : [UI_CONSTANTS.MAX_HISTORY_ITEMS];

    const [result] = await db.executeSql(query, params);
    const rows: Translation[] = [];
    for (let i = 0; i < result.rows.length; i += 1) {
      rows.push(mapRowToTranslation(result.rows.item(i) as DbRow));
    }
    return rows;
  },

  async getFavorites(search = ''): Promise<Translation[]> {
    const db = await getDb();
    const query = search.trim()
      ? `
          SELECT *
          FROM translations
          WHERE is_favorite = 1
            AND (source_text LIKE ? OR translated_text LIKE ?)
          ORDER BY created_at DESC
          LIMIT ?;
        `
      : `
          SELECT *
          FROM translations
          WHERE is_favorite = 1
          ORDER BY created_at DESC
          LIMIT ?;
        `;

    const params = search.trim()
      ? [`%${search}%`, `%${search}%`, UI_CONSTANTS.MAX_FAVORITES_ITEMS]
      : [UI_CONSTANTS.MAX_FAVORITES_ITEMS];

    const [result] = await db.executeSql(query, params);
    const rows: Translation[] = [];
    for (let i = 0; i < result.rows.length; i += 1) {
      rows.push(mapRowToTranslation(result.rows.item(i) as DbRow));
    }
    return rows;
  },

  async toggleFavorite(translationId: string): Promise<void> {
    const db = await getDb();
    await db.executeSql(
      `
        UPDATE translations
        SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END
        WHERE id = ?;
      `,
      [translationId]
    );
  },

  async clearHistory(): Promise<void> {
    const db = await getDb();
    await db.executeSql('DELETE FROM translations;');
  },

  async exportHistory(): Promise<string> {
    const history = await this.getHistory();
    const payload = JSON.stringify(history, null, 2);
    const path = `${RNFS.DocumentDirectoryPath}/libretranslate-history-${Date.now()}.json`;
    await RNFS.writeFile(path, payload, 'utf8');
    return path;
  },

  async shareHistoryExport(): Promise<void> {
    const path = await this.exportHistory();
    await Share.open({
      title: 'Export Translation History',
      url: `file://${path}`,
      type: 'application/json',
      failOnCancel: false,
    });
  },
};
