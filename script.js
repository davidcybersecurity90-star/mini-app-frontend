const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const BACKEND_URL = "https://ваш-backend-домен.com"; // заменить после деплоя backend
const userId = tg.initDataUnsafe?.user?.id || 0;

const chatEl = document.getElementById('chat');
const roles = [
    { key: 'general', emoji: '🧠', name: 'Универсальный' },
    { key: 'python', emoji: '🐍', name: 'Python Dev' },
    { key: 'english', emoji: '🇬🇧', name: 'English Tutor' },
    { key: 'copywriter', emoji: '✍️', name: 'Копирайтер' },
    { key: 'physics', emoji: '🧲', name: 'Физика' }
];

let currentRole = 'general';

function renderRoleChips() {
    const container = document.getElementById('roles');
    container.innerHTML = '';
    roles.forEach(role => {
        const chip = document.createElement('div');
        chip.className = 'role-chip' + (role.key === currentRole ? ' active' : '');
        chip.innerText = `${role.emoji} ${role.name}`;
        chip.onclick = () => selectRole(role.key);
        container.appendChild(chip);
    });
}

function selectRole(roleKey) {
    currentRole = roleKey;
    renderRoleChips();
    tg.sendData(JSON.stringify({ type: 'role', value: roleKey }));
    tg.HapticFeedback.impactOccurred('light');
}

function createMessageElement(role, content) {
    const row = document.createElement('div');
    row.className = `message-row ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = content;

    row.appendChild(bubble);
    return row;
}

function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message-row assistant';
    row.id = 'typing-row';
    row.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatEl.appendChild(row);
    scrollToBottom();
}

function hideTypingIndicator() {
    const el = document.getElementById('typing-row');
    if (el) el.remove();
}

function scrollToBottom() {
    chatEl.scrollTop = chatEl.scrollHeight;
}

function showState(icon, text) {
    chatEl.innerHTML = `
        <div class="state-screen">
            <div class="state-icon">${icon}</div>
            <div>${text}</div>
        </div>
    `;
}

async function loadHistory() {
    chatEl.innerHTML = `
        <div class="state-screen">
            <div class="spinner"></div>
            <div>Загружаю историю...</div>
        </div>
    `;

    try {
        const response = await fetch(`${BACKEND_URL}/messages/${userId}`);
        if (!response.ok) throw new Error('Bad response');
        const messages = await response.json();

        chatEl.innerHTML = '';

        if (messages.length === 0) {
            showState('💬', 'Пока нет сообщений.\nНачните диалог в чате с ботом.');
            return;
        }

        messages.forEach((msg, index) => {
            const el = createMessageElement(msg.role, msg.content);
            el.style.animationDelay = `${index * 0.03}s`;
            chatEl.appendChild(el);
        });

        scrollToBottom();
    } catch (e) {
        showState('⚠️', 'Не удалось загрузить историю.\nПроверьте подключение.');
    }
}

renderRoleChips();
loadHistory();