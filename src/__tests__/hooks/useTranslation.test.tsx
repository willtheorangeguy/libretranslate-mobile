import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { useTranslation } from '../../hooks/useTranslation';
import { getClient, LibreTranslateError } from '../../services/LibreTranslateClient';

jest.mock('../../services/LibreTranslateClient', () => ({
  ...jest.requireActual('../../services/LibreTranslateClient'),
  getClient: jest.fn(),
}));

let latest: ReturnType<typeof useTranslation>;
function Harness({
  text,
  source = 'auto',
  target = 'es',
  server = 'default',
}: {
  text: string;
  source?: string;
  target?: string;
  server?: string;
}) {
  latest = useTranslation(text, source, target, true, server);
  return null;
}

const deferred = () => {
  let resolve!: (value: { translatedText: string }) => void;
  const promise = new Promise<{ translatedText: string }>(done => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('translation lifecycle', () => {
  let tree: ReactTestRenderer;
  let translate: jest.Mock;
  beforeEach(() => {
    tree = undefined as unknown as ReactTestRenderer;
    jest.useFakeTimers();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    translate = jest.fn().mockResolvedValue({ translatedText: 'Hola' });
    (getClient as jest.Mock).mockReturnValue({ translate, retryAt: 0 });
  });
  afterEach(async () => {
    if (tree) await act(async () => tree.unmount());
    jest.useRealTimers();
  });
  const render = async (text: string, target = 'es', server = 'default') => {
    await act(async () => {
      const element = <Harness text={text} target={target} server={server} />;
      if (tree) tree.update(element);
      else tree = create(element);
    });
  };
  const advance = async (ms = 500) => {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  };

  it('debounces input and uses auto detection in one request', async () => {
    await render('H');
    await advance(200);
    await render('Hello');
    await advance();
    expect(translate).toHaveBeenCalledTimes(1);
    expect(translate).toHaveBeenCalledWith('Hello', 'auto', 'es', expect.any(AbortSignal));
    expect(latest.result?.translatedText).toBe('Hola');
  });

  it('cancels pending work when input is cleared', async () => {
    tree = undefined as unknown as ReactTestRenderer;
    await render('Hello');
    await render('');
    await advance();
    expect(translate).not.toHaveBeenCalled();
    expect(latest.result).toBeNull();
  });

  it('discards late responses after a newer input has translated', async () => {
    tree = undefined as unknown as ReactTestRenderer;
    const old = deferred();
    translate.mockReturnValueOnce(old.promise);
    await render('Old');
    await advance();
    const oldSignal = translate.mock.calls[0][3] as AbortSignal;
    await render('New');
    await advance();
    expect(oldSignal.aborted).toBe(true);
    await act(async () => old.resolve({ translatedText: 'stale' }));
    expect(latest.result?.translatedText).toBe('Hola');
  });

  it('retranslates on language and server changes', async () => {
    tree = undefined as unknown as ReactTestRenderer;
    await render('Hello');
    await advance();
    await render('Hello', 'fr');
    expect(latest.result).toBeNull();
    await advance();
    await render('Hello', 'fr', 'custom');
    await advance();
    expect(translate).toHaveBeenCalledTimes(3);
    expect(translate.mock.calls[1][2]).toBe('fr');
  });

  it('shows a rate-limit countdown without a retry loop', async () => {
    tree = undefined as unknown as ReactTestRenderer;
    const client = { translate, retryAt: 0 };
    (getClient as jest.Mock).mockReturnValue(client);
    translate.mockImplementationOnce(async () => {
      client.retryAt = Date.now() + 10000;
      throw new LibreTranslateError('Slow down', 429, client.retryAt);
    });
    await render('Hello');
    await advance();
    expect(latest.cooldown).toBe(10);
    await advance(11000);
    expect(latest.cooldown).toBe(0);
    expect(translate).toHaveBeenCalledTimes(1);
    await act(async () => latest.retry());
    await advance();
    expect(translate).toHaveBeenCalledTimes(2);
  });
});
