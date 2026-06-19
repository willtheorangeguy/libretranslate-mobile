import axios, { AxiosInstance, AxiosError } from 'axios';
import { Language, TranslationResponse, DetectionResponse } from '../types';

export class LibreTranslateClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.apiKey = apiKey?.trim() || undefined;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  private withApiKey<T extends object>(payload: T): T & { api_key?: string } {
    return this.apiKey ? { ...payload, api_key: this.apiKey } : payload;
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/languages');
      return Array.isArray(response.data);
    } catch {
      return false;
    }
  }

  async getLanguages(): Promise<Language[]> {
    try {
      const response = await this.axiosInstance.get<Language[]>('/languages');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async translate(
    text: string,
    source: string,
    target: string
  ): Promise<TranslationResponse> {
    try {
      const response = await this.axiosInstance.post<TranslationResponse>(
        '/translate',
        this.withApiKey({
          q: text,
          source,
          target,
        })
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async detectLanguage(text: string): Promise<DetectionResponse> {
    try {
      const response = await this.axiosInstance.post<DetectionResponse>(
        '/detect',
        this.withApiKey({ q: text })
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ECONNABORTED') {
        return new Error('Connection timeout. Please check your server URL.');
      }
      if (axiosError.response?.status === 404) {
        return new Error('Server endpoint not found. Check your LibreTranslate URL.');
      }
      if (axiosError.response?.status === 503) {
        return new Error('Server is temporarily unavailable.');
      }
      return new Error(axiosError.message || 'Network error occurred');
    }
    return new Error('An unexpected error occurred');
  }

  updateBaseURL(newURL: string, apiKey?: string): void {
    this.baseURL = newURL.endsWith('/') ? newURL.slice(0, -1) : newURL;
    this.apiKey = apiKey?.trim() || undefined;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }
}

let clientInstance: LibreTranslateClient | null = null;

export const initializeClient = (
  baseURL: string,
  apiKey?: string
): LibreTranslateClient => {
  clientInstance = new LibreTranslateClient(baseURL, apiKey);
  return clientInstance;
};

export const getClient = (): LibreTranslateClient => {
  if (!clientInstance) {
    throw new Error('LibreTranslateClient not initialized. Call initializeClient first.');
  }
  return clientInstance;
};
