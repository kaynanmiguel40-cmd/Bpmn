/**
 * Repro: renderiza mensagens reais da conversa que quebra (Lhorena @lid 1cf69735),
 * incluindo a imagem outbound, a .enc, audio, stickers — com o CODIGO ATUAL.
 * jsdom NAO carrega imagem de verdade, mas pega crash de LOGICA de render.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MessageBubble } from '../components/inbox/MessageBubble';

// amostra representativa dos tipos que aparecem na conversa real
const MESSAGES = [
  { id: '1', direction: 'inbound',  content: 'olá', mediaType: null, mediaUrl: null, mediaMime: null, status: 'read', sentAt: '2026-06-19T12:00:00Z' },
  { id: '2', direction: 'outbound', content: '🖖', mediaType: null, mediaUrl: null, mediaMime: null, status: 'read', sentAt: '2026-06-19T12:01:00Z' },
  // imagem outbound (a que o user mandou) — type image, mime null, url storage
  { id: '3', direction: 'outbound', content: '', mediaType: 'image', mediaMime: null,
    mediaUrl: 'https://ydiwxlrkrmygpdfacpkt.supabase.co/storage/v1/object/public/crm-whatsapp-media/prospect-1cf69735/44433dae-f83a-4b14-9712-e3f579d5bb09.jpeg',
    status: 'sent', sentAt: '2026-06-19T20:24:42Z' },
  // imagem outbound com URL .enc (cripto) — type image, mime image/jpeg
  { id: '4', direction: 'outbound', content: null, mediaType: 'image', mediaMime: 'image/jpeg',
    mediaUrl: 'https://mmg.whatsapp.net/v/t62.7118-24/abc_n.enc?ccb=11-4', status: 'delivered', sentAt: '2026-06-19T19:11:11Z' },
  // imagem inbound
  { id: '5', direction: 'inbound', content: null, mediaType: 'image', mediaMime: 'image/jpeg',
    mediaUrl: 'https://ydiwxlrkrmygpdfacpkt.supabase.co/storage/v1/object/public/crm-whatsapp-media/inbound/c84883d8.jpg', status: 'read', sentAt: '2026-06-19T13:12:09Z' },
  // sticker
  { id: '6', direction: 'inbound', content: null, mediaType: 'sticker', mediaMime: 'image/webp',
    mediaUrl: 'https://ydiwxlrkrmygpdfacpkt.supabase.co/storage/v1/object/public/crm-whatsapp-media/inbound/64f0e768.webp', status: 'read', sentAt: '2026-06-19T13:13:00Z' },
  // audio webm
  { id: '7', direction: 'outbound', content: null, mediaType: 'audio', mediaMime: null,
    mediaUrl: 'https://ydiwxlrkrmygpdfacpkt.supabase.co/storage/v1/object/public/crm-whatsapp-media/prospect-8ede6501/60d7d425.webm', status: 'sent', sentAt: '2026-06-19T13:14:00Z' },
  // imagem SEM url (status failed) — caso de borda
  { id: '8', direction: 'outbound', content: '', mediaType: 'image', mediaMime: null, mediaUrl: null, status: 'failed', errorMessage: 'x', sentAt: '2026-06-19T13:15:00Z' },
  // documento com mime de imagem (foto mandada como arquivo)
  { id: '9', direction: 'inbound', content: null, mediaType: 'document', mediaMime: 'image/jpeg', mediaFilename: 'foto.jpg',
    mediaUrl: 'https://ydiwxlrkrmygpdfacpkt.supabase.co/storage/v1/object/public/crm-whatsapp-media/inbound/x.jpg', status: 'read', sentAt: '2026-06-19T13:16:00Z' },
];

describe('render de mensagens de imagem (codigo atual)', () => {
  it('renderiza todos os tipos sem lancar', () => {
    for (const m of MESSAGES) {
      expect(() => render(<MessageBubble message={m} />)).not.toThrow();
    }
  });

  it('imagem outbound (mime null) renderiza um <img> com a src de storage', () => {
    const { container } = render(<MessageBubble message={MESSAGES[2]} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('44433dae');
  });
});
