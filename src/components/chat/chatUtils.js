/**
 * Chat utilities - link detection, mention parsing, rich text helpers.
 * Zero external dependencies.
 */

// ==================== LINK DETECTION ====================

const URL_REGEX = /(https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+)/gi;
const SAFE_PROTOCOLS = ['http:', 'https:'];

function isSafeUrl(url) {
  try { return SAFE_PROTOCOLS.includes(new URL(url).protocol); }
  catch { return false; }
}

/**
 * Parse text into segments of text and links.
 * @returns {Array<{ type: 'text'|'link', value: string, href?: string }>}
 */
export function parseLinks(text) {
  if (!text) return [{ type: 'text', value: '' }];
  const parts = [];
  let lastIndex = 0;
  const regex = new RegExp(URL_REGEX.source, 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const url = match[0];
    const href = url.startsWith('www.') ? `https://${url}` : url;
    if (isSafeUrl(href)) {
      parts.push({ type: 'link', value: url, href });
    } else {
      parts.push({ type: 'text', value: url });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}

// ==================== MENTION DETECTION ====================

/** Normalize name for matching (lowercase, no accents) */
function normName(name) {
  if (!name) return '';
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Detect @ mention query from cursor position.
 * Returns the text after @ if cursor is in a mention, or null.
 */
export function getMentionQuery(text, cursorPosition) {
  const beforeCursor = text.slice(0, cursorPosition);
  const match = beforeCursor.match(/@([\w\u00C0-\u024F]*)$/);
  return match ? match[1] : null;
}

/**
 * Get the start index of the current @mention being typed.
 */
export function getMentionStart(text, cursorPosition) {
  const beforeCursor = text.slice(0, cursorPosition);
  const match = beforeCursor.match(/@[\w\u00C0-\u024F]*$/);
  return match ? beforeCursor.length - match[0].length : -1;
}

/**
 * Extract mentions from final message text by matching @Name against team members.
 * @returns {Array<{ memberId: string, memberName: string }>}
 */
export function extractMentions(text, teamMembers) {
  if (!text || !teamMembers?.length) return [];
  const mentions = [];
  const atMatches = text.match(/@[\w\u00C0-\u024F]+(?:\s[\w\u00C0-\u024F]+)?/g) || [];

  for (const atMatch of atMatches) {
    const name = atMatch.slice(1); // remove @
    const normQuery = normName(name);
    const member = teamMembers.find(m => {
      const parts = m.name.trim().split(/\s+/);
      const firstName = normName(parts[0]);
      const shortN = parts.length > 2
        ? normName(`${parts[0]} ${parts[parts.length - 1]}`)
        : normName(m.name);
      return firstName === normQuery || shortN === normQuery || normName(m.name) === normQuery;
    });
    if (member && !mentions.find(m => m.memberId === member.id)) {
      mentions.push({ memberId: member.id, memberName: member.name });
    }
  }
  return mentions;
}

/**
 * Filter team members by mention query string.
 */
export function filterMembersByQuery(teamMembers, query) {
  if (!query && query !== '') return teamMembers || [];
  const norm = normName(query);
  return (teamMembers || []).filter(m => normName(m.name).includes(norm)).slice(0, 5);
}

// ==================== RICH TEXT PARSING ====================

/**
 * Parse message text into rich segments: text, link, mention.
 * First splits by @mentions, then within text segments parses links.
 * @returns {Array<{ type: 'text'|'link'|'mention', value: string, href?: string, memberId?: string }>}
 */
export function parseRichText(text, mentions = []) {
  if (!text) return [];

  // Build mention patterns from the mentions array
  const mentionNames = mentions.map(m => {
    const parts = m.memberName.trim().split(/\s+/);
    if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`;
    return m.memberName;
  });

  // If no mentions, just parse links
  if (mentionNames.length === 0) {
    return parseLinks(text);
  }

  // Build regex for mentions: @FirstName or @FirstName LastName
  const escaped = mentionNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const mentionRegex = new RegExp(`@(${escaped.join('|')})`, 'gi');

  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // Parse links in the text before this mention
      segments.push(...parseLinks(text.slice(lastIndex, match.index)));
    }
    const matchedName = match[1];
    const mention = mentions.find(m => {
      const parts = m.memberName.trim().split(/\s+/);
      const short = parts.length > 2 ? `${parts[0]} ${parts[parts.length - 1]}` : m.memberName;
      return normName(short) === normName(matchedName);
    });
    segments.push({
      type: 'mention',
      value: match[0],
      memberId: mention?.memberId,
    });
    lastIndex = mentionRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push(...parseLinks(text.slice(lastIndex)));
  }

  return segments.length > 0 ? segments : parseLinks(text);
}
