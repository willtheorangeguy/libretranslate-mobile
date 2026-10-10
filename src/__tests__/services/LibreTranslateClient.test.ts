import axios from 'axios';
import {
  initializeClient,
  LibreTranslateClient,
  normalizeServerUrl,
} from '../../services/LibreTranslateClient';

jest.mock('axios');

describe('LibreTranslateClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls translate endpoint with expected payload', async () => {
    const post = jest.fn().mockResolvedValue({ data: { translatedText: 'hola' } });
    const get = jest.fn().mockResolvedValue({ data: [] });
    (axios.create as jest.Mock).mockReturnValue({ post, get });
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);

    const client = initializeClient('http://localhost:5000');
    const result = await client.translate('hello', 'en', 'es');

    expect(post).toHaveBeenCalledWith(
      '/translate',
      {
        q: 'hello',
        source: 'en',
        target: 'es',
      },
      { signal: undefined },
    );
    expect(result.translatedText).toBe('hola');
  });

  it('includes api_key in payload when configured', async () => {
    const post = jest.fn().mockResolvedValue({ data: { translatedText: 'hola' } });
    const get = jest.fn().mockResolvedValue({ data: [] });
    (axios.create as jest.Mock).mockReturnValue({ post, get });
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);

    const client = initializeClient('http://localhost:5000', 'secret-key');
    await client.translate('hello', 'en', 'es');

    expect(post).toHaveBeenCalledWith(
      '/translate',
      {
        q: 'hello',
        source: 'en',
        target: 'es',
        api_key: 'secret-key',
      },
      { signal: undefined },
    );
  });
});

describe('server validation and request limits', () => {
  const post = jest.fn();
  const get = jest.fn();
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2030-01-01'));
    jest.clearAllMocks();
    (axios.create as jest.Mock).mockReturnValue({ post, get });
    (axios.isAxiosError as unknown as jest.Mock).mockImplementation(error => !!error.isAxiosError);
  });
  afterEach(() => jest.useRealTimers());

  it('normalizes paths and rejects non-server URLs', () => {
    expect(normalizeServerUrl(' https://example.com/libre/// ')).toBe('https://example.com/libre');
    for (const value of [
      'example.com',
      'file:///tmp',
      'https://user:secret@example.com',
      'https://example.com?api_key=secret',
    ]) {
      expect(() => normalizeServerUrl(value)).toThrow();
    }
  });

  it('rejects a successful HTTP response that is not a language list', async () => {
    get.mockResolvedValue({ data: '<html>not LibreTranslate</html>' });
    expect(await new LibreTranslateClient('https://invalid.example').validateConnection()).toBe(
      false,
    );
  });

  it('allows only one default-instance request every three seconds across client recreation', async () => {
    post.mockResolvedValue({ data: { translatedText: 'Hola' } });
    const client = initializeClient('https://libretranslate.com');
    await client.translate('Hello', 'auto', 'es');
    await expect(
      initializeClient('https://libretranslate.com').translate('Hello again', 'auto', 'es'),
    ).rejects.toMatchObject({ status: 429 });
    expect(post).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(3000);
    await client.translate('Hello again', 'auto', 'es');
    expect(post).toHaveBeenCalledTimes(2);
  });

  it.each(['12', 'Tue, 01 Jan 2030 00:00:12 GMT'])(
    'honors Retry-After %s without automatically retrying',
    async retryAfter => {
      const client = new LibreTranslateClient(
        retryAfter === '12' ? 'https://quota-seconds.example' : 'https://quota-date.example',
      );
      post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 429,
          headers: { 'retry-after': retryAfter },
          data: { error: 'Too many requests' },
        },
      });
      await expect(client.translate('Hello', 'auto', 'es')).rejects.toMatchObject({
        status: 429,
        retryAt: Date.now() + 12000,
      });
      await expect(client.translate('Hello', 'auto', 'es')).rejects.toMatchObject({ status: 429 });
      expect(post).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(12000);
      post.mockResolvedValueOnce({ data: { translatedText: 'Hola' } });
      await expect(client.translate('Hello', 'auto', 'es')).resolves.toEqual({
        translatedText: 'Hola',
      });
    },
  );

  it('explains required API keys', async () => {
    post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400, data: { error: 'Please provide a valid API key' } },
    });
    await expect(
      new LibreTranslateClient('https://auth.example').translate('Hello', 'auto', 'es'),
    ).rejects.toThrow('Server settings');
  });

  it('falls back for older servers without frontend settings', async () => {
    get.mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
    await expect(
      new LibreTranslateClient('https://old.example').getFrontendSettings(),
    ).resolves.toEqual({});
  });
});

describe('file translation', () => {
  it('uploads a native file with credentials and resolves a relative download URL', async () => {
    const append = jest.fn();
    const runtime = globalThis as unknown as { FormData: typeof FormData };
    const original = runtime.FormData;
    runtime.FormData = jest.fn(() => ({ append })) as unknown as typeof FormData;
    try {
      const post = jest
        .fn()
        .mockResolvedValue({ data: { translatedFileUrl: 'download/result.txt' } });
      (axios.create as jest.Mock).mockReturnValue({ post });
      const client = new LibreTranslateClient('https://files.example/libre', 'file-key');
      const file = { uri: 'file:///document.txt', name: 'document.txt', type: 'text/plain' };
      expect(await client.translateFile(file, 'auto', 'es')).toBe(
        'https://files.example/libre/download/result.txt',
      );
      expect(append.mock.calls).toEqual([
        ['file', file],
        ['source', 'auto'],
        ['target', 'es'],
        ['api_key', 'file-key'],
      ]);
      expect(post).toHaveBeenCalledWith(
        '/translate_file',
        expect.anything(),
        expect.objectContaining({ timeout: 120000 }),
      );
    } finally {
      runtime.FormData = original;
    }
  });
});
