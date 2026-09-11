import axios, { AxiosInstance } from 'axios';
import {
  Language,
  TranslationResponse,
  DetectionResponse,
  FrontendSettings,
  TranslationFile,
} from '../types';
import { DEFAULT_SERVER_URL } from '../constants';

export function normalizeServerUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Enter a complete server URL, such as https://translate.example.com.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'Use an HTTP or HTTPS server URL without credentials, query parameters, or a fragment.',
    );
  }
  return url.toString().replace(/\/+$/, '');
}

export class LibreTranslateError extends Error {
  constructor(message: string, public status?: number, public retryAt?: number) {
    super(message);
    this.name = 'LibreTranslateError';
  }
}

// Shared across client recreation so switching servers cannot reset a cooldown.
const requestWindows = new Map<string, number>();
export class LibreTranslateClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = normalizeServerUrl(baseURL);
    this.apiKey = apiKey?.trim() || undefined;
    this.axiosInstance = axios.create({ baseURL: this.baseURL, timeout: 30000 });
  }

  private withApiKey<T extends object>(payload: T): T & { api_key?: string } {
    return this.apiKey ? { ...payload, api_key: this.apiKey } : payload;
  }

  get retryAt(): number {
    return requestWindows.get(this.baseURL) || 0;
  }

  private reserveRequest(): void {
    if (this.retryAt > Date.now()) {
      throw new LibreTranslateError(
        'Please wait before making another translation request.',
        429,
        this.retryAt,
      );
    }
    // A conservative app-side limit; the server may impose additional quotas.
    if (this.baseURL === DEFAULT_SERVER_URL) requestWindows.set(this.baseURL, Date.now() + 3000);
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.getLanguages();
      return true;
    } catch {
      return false;
    }
  }

  async getLanguages(): Promise<Language[]> {
    try {
      const { data } = await this.axiosInstance.get<Language[]>('/languages');
      if (
        !Array.isArray(data) ||
        !data.length ||
        !data.every(lang => typeof lang.code === 'string' && typeof lang.name === 'string')
      ) {
        throw new Error('This URL did not return a LibreTranslate language list.');
      }
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFrontendSettings(): Promise<FrontendSettings> {
    try {
      const { data } = await this.axiosInstance.get<FrontendSettings>('/frontend/settings');
      return data && typeof data === 'object' ? data : {};
    } catch (error) {
      if (axios.isAxiosError(error) && [404, 405].includes(error.response?.status || 0)) return {};
      throw this.handleError(error);
    }
  }

  async translate(
    text: string,
    source: string,
    target: string,
    signal?: AbortSignal,
  ): Promise<TranslationResponse> {
    this.reserveRequest();
    try {
      const { data } = await this.axiosInstance.post<TranslationResponse>(
        '/translate',
        this.withApiKey({ q: text, source, target }),
        { signal },
      );
      if (typeof data.translatedText !== 'string')
        throw new Error('The server returned an invalid translation.');
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async translateFile(
    file: TranslationFile,
    source: string,
    target: string,
    signal?: AbortSignal,
  ): Promise<string> {
    this.reserveRequest();
    const form = new FormData();
    form.append('file', file);
    form.append('source', source);
    form.append('target', target);
    if (this.apiKey) form.append('api_key', this.apiKey);
    try {
      const { data } = await this.axiosInstance.post('/translate_file', form, {
        signal,
        timeout: 120000,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (typeof data.translatedFileUrl !== 'string' || !data.translatedFileUrl)
        throw new Error('The server did not return a translated file.');
      const url = new URL(data.translatedFileUrl, `${this.baseURL}/`);
      if (!['http:', 'https:'].includes(url.protocol))
        throw new Error('The server returned an invalid download URL.');
      return url.toString();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async detectLanguage(text: string): Promise<DetectionResponse> {
    this.reserveRequest();
    try {
      const response = await this.axiosInstance.post<DetectionResponse>(
        '/detect',
        this.withApiKey({ q: text }),
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const detail =
        typeof error.response?.data?.error === 'string' ? error.response.data.error : undefined;
      if (status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'];
        const seconds = Number(retryAfter);
        const deadline =
          retryAfter && Number.isFinite(seconds)
            ? Date.now() + seconds * 1000
            : Date.parse(String(retryAfter));
        const retryAt = Math.max(
          Date.now() + 1000,
          Number.isFinite(deadline) ? deadline : Date.now() + 60000,
          this.retryAt,
        );
        requestWindows.set(this.baseURL, retryAt);
        return new LibreTranslateError(
          detail || 'This server’s rate limit has been reached.',
          status,
          retryAt,
        );
      }
      if (status === 401 || status === 403 || (status === 400 && /api.?key/i.test(detail || ''))) {
        return new LibreTranslateError(
          `${
            detail || 'This server requires a valid API key.'
          } Open Server settings to update your key or use your own instance.`,
          status,
        );
      }
      if (error.code === 'ECONNABORTED')
        return new Error('The server took too long to respond. Please try again.');
      if (status === 404)
        return new Error('Server endpoint not found. Check your LibreTranslate URL.');
      if (status === 503) return new Error('Server is temporarily unavailable.');
      return new LibreTranslateError(
        detail || 'Could not reach the server. Check your connection and server URL.',
        status,
      );
    }
    return error instanceof Error ? error : new Error('An unexpected error occurred');
  }

  updateBaseURL(newURL: string, apiKey?: string): void {
    this.baseURL = normalizeServerUrl(newURL);
    this.apiKey = apiKey?.trim() || undefined;
    this.axiosInstance = axios.create({ baseURL: this.baseURL, timeout: 30000 });
  }
}

let clientInstance: LibreTranslateClient | null = null;
export const initializeClient = (baseURL: string, apiKey?: string): LibreTranslateClient => {
  clientInstance = new LibreTranslateClient(baseURL, apiKey);
  return clientInstance;
};
export const getClient = (): LibreTranslateClient => {
  if (!clientInstance)
    throw new Error('LibreTranslateClient not initialized. Call initializeClient first.');
  return clientInstance;
};
