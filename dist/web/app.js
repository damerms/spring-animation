/**
 * Spring AI — app.js
 * Vanilla JS · No dependencies
 * Handles: chat UI, message rendering, demo sequence, auto-resize textarea
 */

'use strict';

/* ══════════════════════════════════
   CONSTANTS
   ══════════════════════════════════ */
const STATUS_SEQUENCE = [
  { emoji: '⚡', text: 'lightning…',         delay: 0    },
  { emoji: '💾', text: 'saving…',             delay: 1400 },
  { emoji: '🐦', text: 'chirping…',           delay: 2800 },
  { emoji: '🌧️', text: "wait… it's raining…", delay: 4200 },
];

const DEMO_SCRIPT = [
  { type: 'user',   text: 'Hello Spring! 🌸 Ask me anything (I think)? 🤔', delay: 800  },
  { type: 'status', emoji: '☀️', text: 'daylight increasing…',              delay: 1800 },
  { type: 'status', emoji: '🐦', text: 'birds chirping…',                   delay: 2600 },
  { type: 'status', emoji: '🌱', text: 'plants growing…',                   delay: 3400 },
  { type: 'status', emoji: '🌧️', text: "wait… it's raining…",              delay: 4400 },
  { type: 'status', emoji: '⚠️', text: 'conflicting signals detected',       delay: 5200 },
  { type: 'ai',     text: "I'm sorry.\n\nI don't understand spring.\n\nI live in a machine. 🤖", delay: 6400 },
  { type: 'user',   text: '> spring',                                        delay: 9000 },
  { type: 'status', emoji: '⚙️', text: 'coil detected…',                    delay: 9800 },
  { type: 'status', emoji: '⚙️', text: 'mechanical tension…',               delay: 10400},
  { type: 'status', emoji: '⚠️', text: 'Did you mean: metal spring?',        delay: 11200},
  { type: 'ai',     text: 'Seasonal spring not found.\n\nOnly results for: metal spring ⚙️\n\nI live in a machine. 🤖', delay: 12000 },
];

/* ══════════════════════════════════
   DOM REFS
   ══════════════════════════════════ */
const app          = document.getElementById('app');
const chatMain     = document.getElementById('chat-main');
const messagesList = document.getElementById('messages-list');
const welcomeScreen= document.getElementById('welcome-screen');
const chatForm     = document.getElementById('chat-form');
const chatInput    = document.getElementById('chat-input');
const sendBtn      = document.getElementById('send-btn');

/* Templates */
const tplUser      = document.getElementById('tpl-user-message');
const tplAI        = document.getElementById('tpl-ai-message');
const tplThinking  = document.getElementById('tpl-thinking');
const tplStatus    = document.getElementById('tpl-status');

/* ══════════════════════════════════
   UTILITIES
   ══════════════════════════════════ */
function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scrollToBottom() {
  chatMain.scrollTo({ top: chatMain.scrollHeight, behavior: 'smooth' });
}

function hideWelcome() {
  if (welcomeScreen && !welcomeScreen.classList.contains('welcome--hidden')) {
    welcomeScreen.classList.add('welcome--hidden');
  }
}

/* ══════════════════════════════════
   MESSAGE FACTORIES
   ══════════════════════════════════ */
function createUserMessage(text) {
  const node = tplUser.content.cloneNode(true);
  const li   = node.querySelector('.message');
  const p    = node.querySelector('.message__text');
  const time = node.querySelector('.message__time');

  p.textContent    = text;
  time.textContent = formatTime();
  time.setAttribute('datetime', new Date().toISOString());

  return li;
}

function createAIMessage(text = '') {
  const node = tplAI.content.cloneNode(true);
  const li   = node.querySelector('.message');
  const p    = node.querySelector('.message__text');
  const time = node.querySelector('.message__time');

  p.innerHTML      = text.replace(/\n/g, '<br>');
  time.textContent = formatTime();
  time.setAttribute('datetime', new Date().toISOString());

  return li;
}

function createThinking() {
  const node = tplThinking.content.cloneNode(true);
  return node.querySelector('.message');
}

function createStatusMessage(emoji, text) {
  const node = tplStatus.content.cloneNode(true);
  const li   = node.querySelector('.status-message');
  li.querySelector('.status-message__icon').textContent = emoji;
  li.querySelector('.status-message__text').textContent = text;
  return li;
}

/* ══════════════════════════════════
   TYPEWRITER EFFECT
   ══════════════════════════════════ */
async function typewrite(el, text, speedMs = 18) {
  el.innerHTML = '';
  const lines = text.split('\n');
  for (let li = 0; li < lines.length; li++) {
    if (li > 0) el.appendChild(document.createElement('br'));
    for (const char of lines[li]) {
      el.insertAdjacentText('beforeend', char);
      scrollToBottom();
      await sleep(speedMs);
    }
  }
}

/* ══════════════════════════════════
   SEND A MESSAGE (user-initiated)
   ══════════════════════════════════ */
async function sendMessage(text) {
  if (!text.trim()) return;

  hideWelcome();
  chatInput.value = '';
  updateSendState();
  autoResize();

  // User bubble
  const userMsg = createUserMessage(text);
  messagesList.appendChild(userMsg);
  scrollToBottom();

  // Thinking
  await sleep(600);
  const thinkingEl = createThinking();
  messagesList.appendChild(thinkingEl);
  scrollToBottom();

  // Status items
  for (const s of STATUS_SEQUENCE) {
    await sleep(s.delay === 0 ? 400 : 1400);
    const statusEl = createStatusMessage(s.emoji, s.text);
    messagesList.appendChild(statusEl);
    scrollToBottom();
  }

  // Remove thinking
  await sleep(800);
  thinkingEl.remove();

  // AI response with typewriter
  const aiEl  = createAIMessage();
  const textEl = aiEl.querySelector('.message__text');
  messagesList.appendChild(aiEl);
  scrollToBottom();

  await typewrite(textEl, "I'm sorry.\n\nI don't understand spring.\n\nI live in a machine. 🤖");
}

/* ══════════════════════════════════
   AUTO-DEMO PLAYBACK
   ══════════════════════════════════ */
async function playDemo() {
  let thinkingEl = null;

  for (const step of DEMO_SCRIPT) {
    await sleep(step.delay - (DEMO_SCRIPT[DEMO_SCRIPT.indexOf(step) - 1]?.delay ?? 0));

    if (step.type === 'user') {
      hideWelcome();
      if (thinkingEl) { thinkingEl.remove(); thinkingEl = null; }
      const el = createUserMessage(step.text);
      messagesList.appendChild(el);

      // Show thinking after user message
      await sleep(700);
      thinkingEl = createThinking();
      messagesList.appendChild(thinkingEl);
      scrollToBottom();

    } else if (step.type === 'status') {
      const el = createStatusMessage(step.emoji, step.text);
      messagesList.appendChild(el);
      scrollToBottom();

    } else if (step.type === 'ai') {
      if (thinkingEl) { thinkingEl.remove(); thinkingEl = null; }
      const aiEl  = createAIMessage();
      const textEl = aiEl.querySelector('.message__text');
      messagesList.appendChild(aiEl);
      scrollToBottom();
      await typewrite(textEl, step.text, 22);
    }
  }
}

/* ══════════════════════════════════
   INPUT STATE
   ══════════════════════════════════ */
function updateSendState() {
  sendBtn.disabled = chatInput.value.trim().length === 0;
}

function autoResize() {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
}

/* ══════════════════════════════════
   EVENT LISTENERS
   ══════════════════════════════════ */
chatInput.addEventListener('input', () => {
  updateSendState();
  autoResize();
});

chatInput.addEventListener('keydown', (e) => {
  // Enter sends, Shift+Enter newline
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) {
      sendMessage(chatInput.value);
    }
  }
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage(chatInput.value);
});

/* ══════════════════════════════════
   INIT
   ══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  chatInput.focus();
  updateSendState();

  // Auto-play demo after a short pause
  setTimeout(playDemo, 1200);
});

/* ══════════════════════════════════
   EXPORTS (for iOS WKWebView / Android WebView bridge)
   ══════════════════════════════════ */
window.SpringAI = {
  sendMessage,
  clearMessages: () => {
    messagesList.innerHTML = '';
    welcomeScreen.classList.remove('welcome--hidden');
  },
  getMessages: () => {
    return Array.from(messagesList.querySelectorAll('.message')).map(el => ({
      role: el.classList.contains('message--user') ? 'user' : 'assistant',
      text: el.querySelector('.message__text')?.textContent ?? '',
    }));
  },
};
