import { useState } from 'react';

/**
 * EmojiPicker - painel de emojis estilo WhatsApp.
 *
 * Leve e sem dependência: usa emojis nativos (unicode), renderizados pela fonte
 * do sistema. Abas de categoria embaixo; grade rolável em cima. Clicar insere
 * via onPick(emoji) e mantém o painel aberto (igual WhatsApp).
 */

const CATEGORIES = [
  {
    key: 'smileys',
    icon: '😀',
    label: 'Sorrisos',
    emojis: [
      '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😌','😍',
      '🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩',
      '🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭',
      '😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭',
      '🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪',
      '😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤠','😈','👿','💀','👻','🤡','💩',
    ],
  },
  {
    key: 'gestures',
    icon: '👍',
    label: 'Gestos',
    emojis: [
      '👍','👎','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋',
      '🤚','🖐️','🖖','👋','🤝','🙏','💪','🦾','🙌','👏','🤲','🤜','🤛','✊','👊','🫶',
      '🫰','🤳','💅','👀','👁️','👅','👄','🧠','🦷','👂','👃','🦶','🦵','🧏','🙇','🤦',
      '🤷','💁','🙋','🙆','🙅','🚶','🏃','💃','🕺','👯','🧍','🧎',
    ],
  },
  {
    key: 'hearts',
    icon: '❤️',
    label: 'Corações',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖',
      '💘','💝','💟','💌','💋','💯','💢','💥','💫','💦','💨','🕳️','💬','🗨️','🗯️','💭',
      '⭐','🌟','✨','⚡','🔥','🌈','☀️','🌙','⛅','☁️','❄️','💧','🌊',
    ],
  },
  {
    key: 'objects',
    icon: '🎉',
    label: 'Objetos',
    emojis: [
      '🎉','🎊','🎈','🎁','🎀','🏆','🥇','🥈','🥉','🎯','✅','☑️','✔️','❌','⭕','❓',
      '❗','‼️','⁉️','⚠️','🔔','📌','📍','📎','🔗','✏️','📝','📅','📆','📊','📈','📉',
      '💰','💵','💴','💶','💷','💳','🧾','📷','📸','🎥','🎬','🎵','🎶','🔊','📱','💻',
      '⏰','⏳','🔒','🔓','🔑','🛒','📦','🚀','🌐','🏠','🏢','🚗','✈️','📞','☎️','💡',
    ],
  },
  {
    key: 'food',
    icon: '🍕',
    label: 'Comida',
    emojis: [
      '☕','🍵','🍺','🍻','🥂','🍷','🍸','🥤','🧃','🍕','🍔','🌭','🍟','🌮','🌯','🥗',
      '🍝','🍜','🍣','🍱','🍤','🍗','🍖','🥩','🥓','🍳','🥪','🥐','🍞','🧀','🥚','🍎',
      '🍌','🍓','🍇','🍉','🍊','🍋','🍒','🍑','🥥','🍫','🍬','🍭','🍰','🎂','🧁','🍪',
    ],
  },
];

export function EmojiPicker({ onPick }) {
  const [cat, setCat] = useState(CATEGORIES[0].key);
  const active = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[0];

  return (
    <div className="w-[320px] max-w-[90vw] bg-white dark:bg-[#233138] rounded-xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden flex flex-col">
      {/* grade de emojis (rola) */}
      <div className="h-[230px] overflow-y-auto p-2 grid grid-cols-8 gap-0.5 content-start">
        {active.emojis.map((e, i) => (
          <button
            key={`${active.key}-${i}`}
            type="button"
            onClick={() => onPick(e)}
            className="h-9 w-9 flex items-center justify-center text-[22px] leading-none rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={e}
          >
            {e}
          </button>
        ))}
      </div>
      {/* abas de categoria */}
      <div className="flex items-center justify-around border-t border-black/5 dark:border-white/10 px-1 py-1 bg-black/[0.02] dark:bg-white/[0.03]">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCat(c.key)}
            className={`h-8 w-8 flex items-center justify-center text-lg rounded-lg transition-colors ${
              c.key === cat
                ? 'bg-black/5 dark:bg-white/10 opacity-100'
                : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title={c.label}
          >
            {c.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmojiPicker;
