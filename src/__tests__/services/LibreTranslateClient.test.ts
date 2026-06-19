import axios from 'axios';
import { initializeClient } from '../../services/LibreTranslateClient';

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

    expect(post).toHaveBeenCalledWith('/translate', {
      q: 'hello',
      source: 'en',
      target: 'es',
    });
    expect(result.translatedText).toBe('hola');
  });

  it('includes api_key in payload when configured', async () => {
    const post = jest.fn().mockResolvedValue({ data: { translatedText: 'hola' } });
    const get = jest.fn().mockResolvedValue({ data: [] });
    (axios.create as jest.Mock).mockReturnValue({ post, get });
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);

    const client = initializeClient('http://localhost:5000', 'secret-key');
    await client.translate('hello', 'en', 'es');

    expect(post).toHaveBeenCalledWith('/translate', {
      q: 'hello',
      source: 'en',
      target: 'es',
      api_key: 'secret-key',
    });
  });
});
