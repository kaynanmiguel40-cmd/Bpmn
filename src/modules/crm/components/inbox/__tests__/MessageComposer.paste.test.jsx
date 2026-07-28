import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';

// A caixa usa react-query e upload real; aqui so precisamos que existam.
vi.mock('../../../hooks/useCrmQueries', () => ({
  useSendCrmMessage: () => ({ mutateAsync: vi.fn().mockResolvedValue({ ok: true }), isPending: false }),
}));
vi.mock('../../../lib/uploadCrmMedia', () => ({
  uploadCrmMedia: vi.fn().mockResolvedValue({ ok: true, url: 'http://x/img.png', mediaType: 'image' }),
  detectMediaType: (mime) => (mime?.startsWith('image/') ? 'image' : mime?.startsWith('video/') ? 'video' : 'document'),
}));
vi.mock('../../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));
vi.mock('../EmojiPicker', () => ({ EmojiPicker: () => null }));

import { MessageComposer } from '../MessageComposer';

const CONV = { otherPhone: '5535999998888', contactId: 'c1', prospectId: null, dealId: null };

beforeEach(() => {
  // jsdom nao implementa object URLs.
  global.URL.createObjectURL = vi.fn(() => 'blob:preview');
  global.URL.revokeObjectURL = vi.fn();
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

// Simula o Ctrl+V com uma imagem no clipboard.
function pasteImage(mime = 'image/png') {
  const file = new File(['dados'], 'print.png', { type: mime });
  const event = new Event('paste', { bubbles: true, cancelable: true });
  event.clipboardData = { items: [{ kind: 'file', type: mime, getAsFile: () => file }] };
  act(() => { window.dispatchEvent(event); });
  return event;
}

describe('MessageComposer — colar imagem (Ctrl+V estilo WhatsApp)', () => {
  it('print no clipboard vira preview de anexo pendente', () => {
    render(<MessageComposer conversation={CONV} instanceName="fyness-principal" />);
    expect(screen.queryByAltText('preview')).toBeNull();
    pasteImage();
    // o anexo staged renderiza o <img alt="preview">
    expect(screen.getByAltText('preview')).toBeTruthy();
  });

  it('sequestra o paste (preventDefault) so quando ha imagem', () => {
    render(<MessageComposer conversation={CONV} instanceName="fyness-principal" />);
    const ev = pasteImage();
    expect(ev.defaultPrevented).toBe(true);
  });

  it('nao faz nada quando a caixa esta desabilitada', () => {
    render(<MessageComposer conversation={CONV} instanceName="fyness-principal" disabled />);
    pasteImage();
    expect(screen.queryByAltText('preview')).toBeNull();
  });
});
