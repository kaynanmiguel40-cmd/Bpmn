import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AudioMessage } from '../AudioMessage';

/**
 * AudioMessage escolhe o player pela CAPACIDADE do navegador:
 *  - suporta ogg/opus (Chrome/Android) -> <audio> nativo;
 *  - nao suporta (iPhone/Safari)        -> player decodificado (WASM), que comeca
 *    como um botao de play (a decodificacao so roda no clique).
 * E a decisao (nao a decodificacao em si) que este teste trava — e onde um bug
 * mandaria o iPhone de volta pro player mudo.
 */

const URL_OGG = 'https://exemplo/audio.ogg';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AudioMessage — escolhe o player pela capacidade', () => {
  it('navegador que SUPORTA ogg/opus usa o <audio> nativo', () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('probably');
    const { container } = render(<AudioMessage url={URL_OGG} isOut={false} />);
    expect(container.querySelector('audio')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull(); // sem player customizado
  });

  it('navegador que NAO suporta (iPhone) cai no player decodificado, nao num audio mudo', () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'canPlayType').mockReturnValue('');
    const { container } = render(<AudioMessage url={URL_OGG} isOut />);
    // Sem <audio> nativo (que ficaria mudo); com botao de play (dispara a decodificacao).
    expect(container.querySelector('audio')).toBeNull();
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
