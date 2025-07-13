import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, forkJoin, from, tap, switchMap } from 'rxjs';

/** trsnlation response model from the API */
export interface TranslationResponse {
  data: {
      translations: {
          translatedText: string;
      }[];
  };
}

/** Batch translation item model */
export interface BatchTranslationItem {
  text: string;
  callback: (translatedText: string) => void;
}

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly API_KEY = 'AIzaSyCh5RsQLWLrzif5cbhf2FwwIaLN6kwdru0'; // Google Translate API key
  private readonly LANGUAGE_KEY = 'selected_language';
  private readonly BATCH_DELAY = 100; // ms
  private readonly MAX_SEGMENTS_PER_REQUEST = 128; // Google Translate API limit
  private cache = new Map<string, string>();
  public readonly googleTranslateApi = 'https://translation.googleapis.com/language/translate/v2';

  // Initialize currentLanguage from localStorage or default to 'en'
  private currentLanguage = signal<string>(
    localStorage.getItem(this.LANGUAGE_KEY) || 'en'
  );

  // Batch translation queue
  private batchQueue: BatchTranslationItem[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  // Computed signals for public access
  public currentLanguageSelector = computed(() => this.currentLanguage());

  constructor(private http: HttpClient) { }

  // Set current language and store in localStorage
  public setLanguage(langCode: string) {
    this.currentLanguage.set(langCode);
    localStorage.setItem(this.LANGUAGE_KEY, langCode);
    this.processBatchQueue(); // Process queue when language changes
  }

  // Add text to batch translation queue
  public addTextToBatch(text: string, callback: (translatedText: string) => void) {
    this.batchQueue.push({ text, callback });
    this.scheduleBatchProcessing();
  }

  // Schedule batch processing
  private scheduleBatchProcessing() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    // Schedule batch processing with a delay
    this.batchTimer = setTimeout(() => {
      this.processBatchQueue();
    }, this.BATCH_DELAY);
  }

  // Process queued texts for translation in batch and execute their callbacks with translated results
  private processBatchQueue() {
    if (this.batchQueue.length === 0) return;

    // Process in chunks of MAX_SEGMENTS_PER_REQUEST
    const chunks = this.chunkArray(this.batchQueue, this.MAX_SEGMENTS_PER_REQUEST);
    this.batchQueue = []; // Clear the queue immediately

    // Process each chunk
    chunks.forEach(chunk => {
      const texts = chunk.map(item => item.text);
      const callbacks = chunk.map(item => item.callback);

      this.translateBatch(texts).subscribe({
        next: (translations: string[]) => {
          translations.forEach((translation, index) => {
            callbacks[index](translation);
          });
        },
        error: () => {
          // On error, return original texts
          texts.forEach((text, index) => {
            callbacks[index](text);
          });
        }
      });
    });
  }

  // Helper method to chunk array into smaller arrays
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Translate multiple texts at once
  public translateBatch(texts: string[], language: string = ''): Observable<string[]> {
    // If language is English, return original texts without API call
    if (this.currentLanguage() === 'en') {
      return of(texts);
    }

    const url = `${this.googleTranslateApi}?key=${this.API_KEY}`;

    // Ensure texts is an array and not empty
    if (!Array.isArray(texts) || texts.length === 0) {
      return of(texts);
    }

    // Limit the number of texts to MAX_SEGMENTS_PER_REQUEST
    const limitedTexts = texts.slice(0, this.MAX_SEGMENTS_PER_REQUEST);

    if(language == '') {
      language = this.currentLanguage();
    }

    const body = {
      q: limitedTexts,
      target: language
    };

    return this.http.post<TranslationResponse>(url, body).pipe(
      map((response: TranslationResponse) => {
        if (!response.data?.translations) {
          return limitedTexts;
        }
        const translations = response.data.translations.map(t => t.translatedText);
        // If we had to limit the texts, pad the result with original texts
        if (texts.length > this.MAX_SEGMENTS_PER_REQUEST) {
          return [...translations, ...texts.slice(this.MAX_SEGMENTS_PER_REQUEST)];
        }
        return translations;
      }),
      catchError(() => of(texts))
    );
  }

  // Translate multiple texts at once with key-value pairs
  public translateBatchWithKeyValue(values: { key: string; value: string; }[]): Observable<{ key: string; value: string; }[]> {
    // If language is English, return original texts without API call
    if (this.currentLanguage() === 'en') {
      return of(values);
    }

    const url = `${this.googleTranslateApi}?key=${this.API_KEY}`;

    // Ensure texts is an array and not empty
    if (!Array.isArray(values) || values.length === 0) {
      return of(values);
    }

    // Process in chunks
    const chunks = this.chunkArray(values, this.MAX_SEGMENTS_PER_REQUEST);
    const chunkObservables = chunks.map(chunk => {
      const body = {
        q: chunk.map(item => item.value),
        target: this.currentLanguage()
      };

      return this.http.post<TranslationResponse>(url, body).pipe(
        map(response => {
          if (!response.data?.translations) {
            return chunk;
          }
          return chunk.map((item, idx) => ({
            key: item.key,
            value: response.data.translations[idx]?.translatedText || item.value
          }));
        }),
        catchError(() => of(chunk))
      );
    });

    return forkJoin(chunkObservables).pipe(
      map(results => results.flat())
    );
  }

  // Translate multiple texts at once with Record<string, string>
  public translateBatchWithKeyValueRecord(values: Record<string, string>): Observable<Record<string, string>> {
    // If language is English, return original texts without API call
    if (this.currentLanguage() === 'en') {
      return of(values);
    }

    const url = `${this.googleTranslateApi}?key=${this.API_KEY}`;
    const entries = Object.entries(values);
    const chunks = this.chunkArray(entries, this.MAX_SEGMENTS_PER_REQUEST);

    const chunkObservables = chunks.map(chunk => {
      const body = {
        q: chunk.map(([_, value]) => value),
        target: this.currentLanguage()
      };

      return this.http.post<TranslationResponse>(url, body).pipe(
        map(response => {
          if (!response.data?.translations) {
            return Object.fromEntries(chunk);
          }
          return Object.fromEntries(
            chunk.map(([key, _], idx) => [
              key,
              response.data.translations[idx]?.translatedText || values[key]
            ])
          );
        }),
        catchError(() => of(Object.fromEntries(chunk)))
      );
    });

    return forkJoin(chunkObservables).pipe(
      map(results => Object.assign({}, ...results))
    );
  }

  public translateText(text: string, targetLang: string): Observable<string> {
    const url = `${this.googleTranslateApi}?key=${this.API_KEY}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.http.post<any>(url, {
      q: text,
      target: targetLang
    }).pipe(map(res => res.data.translations[0].translatedText));
  }

  public translate(text: string, targetLang: string): Observable<string> {
    const key = `${text}_${targetLang}`;
    if (this.cache.has(key)) {
      return of(this.cache.get(key)!);
    }

    const body = { q: text, target: targetLang };
    const url = `${this.googleTranslateApi}?key=${this.API_KEY}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.http.post<any>(url, body).pipe(
      map(res => res.data.translations[0].translatedText),
      tap(translated => this.cache.set(key, translated))
    );
  }

  // Translate an array of data objects, translating specified properties
  // If propertyNames is provided, those properties will not be translated    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translateData(data: any[], targetLang: string = 'en', propertyNames: string[] = []): Observable<any[]> {
    if (this.currentLanguage() == 'en')
      return of(data);

    return forkJoin(
      data.map(row => this.translateRow(row, this.currentLanguage(), propertyNames))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translateRow(row: any, targetLang: string, propertyNames: string[] = []): Observable<any> {
    const keys = Object.keys(row);
    const translationTasks = keys.map(key => {
      const val = row[key];
      if (propertyNames.includes(key)) {
        // Do not translate this property
        return from([{ key, translated: val }]);
      }
      if (typeof val === 'string') {
        return this.translateText(val, targetLang).pipe(
          map(translated => ({ key, translated }))
        );
      } else {
        return from([{ key, translated: val }]);
      }
    });

    return forkJoin(translationTasks).pipe(
      map(translatedItems => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translatedRow: any = {};
        translatedItems.forEach(({ key, translated }) => {
          translatedRow[key] = translated;
        });
        return translatedRow;
      })
    );
  }

  public transform(value: string): string {
    if (!value) return value;

    // If language is English, use original text without translation
    if (this.currentLanguageSelector() === 'en') {
      return value;
    }

    // Add text to the batch translation queue
    this.addTextToBatch(value, (translatedText: string) => {
      return translatedText;
    });

    // Return original text while waiting for translation
    return value;
  }


  private flattenObject(obj: any, path: string[] = [], result: { path: string[]; value: string }[] = []) {
    for (const key in obj) {
      const value = obj[key];
      const currentPath = [...path, key];
      if (typeof value === 'string') {
        result.push({ path: currentPath, value });
      } else if (typeof value === 'object' && value !== null) {
        this.flattenObject(value, currentPath, result);
      }
    }
    return result;
  }

  // Apply translated strings back into object using paths
  private reconstructObject(original: any, translations: { path: string[]; value: string }[]): any {
    const clone = structuredClone(original); // deep copy
    for (const { path, value } of translations) {
      let temp = clone;
      for (let i = 0; i < path.length - 1; i++) {
        temp = temp[path[i]];
      }
      temp[path[path.length - 1]] = value;
    }
    return clone;
  }

  // Public method to translate complex object using batch
  public translateComplexObject<T>(obj: T, targetLang: string = '', ignoreKeys: string[] = []): Observable<T> {
    if (this.currentLanguage() === 'en') return of(obj);

    if (targetLang == '')
      targetLang = this.currentLanguage();

    // Flatten object, but skip keys in ignoreKeys
    const flat = this.flattenObject(obj).filter(x => !ignoreKeys.includes(x.path[x.path.length - 1]));
    const values = flat.map(x => x.value);

    return this.translateBatch(values, targetLang).pipe(
      map(translations => {
        // Merge translated and ignored keys
        const translatedPaths = flat.map((x, i) => ({ path: x.path, value: translations[i] }));

        // Add back ignored keys with original values
        const ignoredFlat = this.flattenObject(obj).filter(x => ignoreKeys.includes(x.path[x.path.length - 1]));
        const allPaths = [...translatedPaths, ...ignoredFlat];

        return this.reconstructObject(obj, allPaths) as T;
      })
    );
  }
} 