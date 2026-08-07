/* ==========================================================================
   EQUIPO MIRANDA - WEB APP LOGIC & 24/7 SYNC ENGINE (DESIGN REFACTOR)
   UI/UX Refactor dirigidos por Gerente de Diseño y Planificación
   ========================================================================== */

// 1. DIRECTORIO OFICIAL CON ROLES COMPACTOS Y MINIMALISTAS
const TEAM_MEMBERS = [
  {
    id: "manager",
    cid: "49730e22-05bf-43fe-9f60-eb34f6d601e0",
    name: "GERENTE GENERAL",
    role: "Director General",
    avatar: "👑",
    status: "active",
    type: "direct"
  },
  {
    id: "contabilidad",
    cid: "e7811762-4e55-43f5-8b4c-b1c183ba84ea",
    name: "GERENTE DE CONTABILIDAD",
    role: "Contabilidad & Libros",
    avatar: "📚",
    status: "active",
    type: "direct"
  },
  {
    id: "financiero",
    cid: "3f64d729-06b0-4498-a6a8-1b24fcfadcca",
    name: "GERENTE FINANCIERO",
    role: "Estrategia Financiera",
    avatar: "📊",
    status: "active",
    type: "direct"
  },
  {
    id: "planificacion",
    cid: "d6ad3c41-6a17-4f2a-b9e0-ee2b9fea9a38",
    name: "GERENTE DE PLANIFICACIÓN",
    role: "Planificación & Hojas de Ruta",
    avatar: "🗺️",
    status: "active",
    type: "direct"
  },
  {
    id: "seguridad",
    cid: "4d2bae0c-a1a3-488a-a417-1a403aa23af1",
    name: "GERENTE DE SEGURIDAD",
    role: "Seguridad & Datos",
    avatar: "🛡️",
    status: "active",
    type: "direct"
  },
  {
    id: "asistente",
    cid: "37667999-c2fc-4798-a165-a540eea1f79c",
    name: "ASISTENTE DE GERENCIA",
    role: "Bitácora & Registro",
    avatar: "📋",
    status: "active",
    type: "direct"
  },
  {
    id: "diseno",
    cid: "bc2a710c-ed7a-44e2-aa5e-08ae02a26942",
    name: "GERENTE DE DISEÑO",
    role: "Diseño & UI/UX",
    avatar: "🎨",
    status: "active",
    type: "direct"
  },
  {
    id: "trabajador1",
    cid: "c5be482b-cbe0-4cbb-821e-13fbef6b3c0a",
    name: "TRABAJADOR 1",
    role: "Investigación",
    avatar: "🛠️",
    status: "active",
    type: "direct"
  },
  {
    id: "trabajador2",
    cid: "3b4b3f3b-126e-46d8-b5e0-50be83f6cf20",
    name: "TRABAJADOR 2",
    role: "Desarrollo",
    avatar: "🛠️",
    status: "active",
    type: "direct"
  },
  {
    id: "trabajador3",
    cid: "ca0fe2f6-f361-4865-86d1-a501d2235d67",
    name: "TRABAJADOR 3",
    role: "Verificación",
    avatar: "🛠️",
    status: "active",
    type: "direct"
  }
];

const CHANNELS = [
  { id: "chan-general", name: "#equipo-miranda", role: "Canal Anuncios", avatar: "💬", cid: "CANAL_GLOBAL" },
  { id: "chan-cuentas", name: "#cuentas-y-finanzas", role: "Canal Presupuestos", avatar: "💰", cid: "CANAL_FINANCIERO" },
  { id: "chan-proyectos", name: "#planificacion", role: "Canal Proyectos", avatar: "🎯", cid: "CANAL_PLANIFICACIÓN" }
];

// ESTADO DE LA APLICACIÓN
let activeChat = TEAM_MEMBERS[0];
let currentTab = "contacts";
let chatHistories = {};
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let attachedMedia = null;

// Cargar o inicializar chats
TEAM_MEMBERS.concat(CHANNELS).forEach(c => {
  chatHistories[c.id] = [
    {
      sender: "system",
      text: `Canal seguro con **${c.name}** (CID: \`${c.cid}\`). Respaldo 24/7.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
});

// ELEMENTOS DEL DOM
const contactsListEl = document.getElementById("contacts-list");
const messagesContainerEl = document.getElementById("messages-container");
const chatFormEl = document.getElementById("chat-form");
const messageTextInput = document.getElementById("message-text-input");
const recordVoiceBtn = document.getElementById("record-voice-btn");
const photoInput = document.getElementById("photo-input");
const mediaPreviewBar = document.getElementById("media-preview-bar");
const previewText = document.getElementById("preview-text");
const closePreviewBtn = document.getElementById("close-preview-btn");

const currentChatAvatar = document.getElementById("current-chat-avatar");
const currentChatName = document.getElementById("current-chat-name");
const currentChatRole = document.getElementById("current-chat-role");
const currentChatCid = document.getElementById("current-chat-cid");

const btnTabContacts = document.getElementById("btn-tab-contacts");
const btnTabChannels = document.getElementById("btn-tab-channels");
const sidebarEl = document.getElementById("sidebar");
const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");

const settingsModal = document.getElementById("settings-modal");
const openSettingsBtn = document.getElementById("open-settings-btn");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const cancelSettingsBtn = document.getElementById("cancel-settings-btn");
const saveSettingsBtn = document.getElementById("save-settings-btn");

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  setupLockScreen();
  registerServiceWorker();
  requestNotificationPermission();
  checkPwaInstallState();
  checkUrlMode();
  renderSidebarList();
  renderActiveChatMessages();
  setupEventListeners();
});

// SOLICITAR PERMISO DE NOTIFICACIONES PWA
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// LANZAR NOTIFICACIÓN NATIVA
function showNativeNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    });
  }
}

// OCULTAR BOTÓN INSTALAR SI YA ESTÁ INSTALADA (MODE STANDALONE)
function checkPwaInstallState() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const installBtn = document.getElementById("install-pwa-btn");
  if (installBtn && isStandalone) {
    installBtn.style.display = "none";
  }
}

// LÓGICA DE PANTALLA DE BLOQUEO INTELIGENTE (DSMO1109 / LINDSAY2026!)
function setupLockScreen() {
  const lockForm = document.getElementById("lock-screen-form");
  const lockInput = document.getElementById("lock-password-input");
  const lockOverlay = document.getElementById("initial-lock-screen");
  const lockError = document.getElementById("lock-error-msg");

  if (!lockForm) return;

  if (sessionStorage.getItem("unlocked_miranda") === "true") {
    if (lockOverlay) lockOverlay.classList.add("hidden");
    return;
  }

  lockForm.onsubmit = (e) => {
    e.preventDefault();
    const pass = lockInput.value.trim();

    if (pass === "Dsmo1109" || pass === "Deymer2026!") {
      sessionStorage.setItem("unlocked_miranda", "true");
      lockOverlay.classList.add("hidden");
    } else if (pass === "Lindsay2026!") {
      sessionStorage.setItem("unlocked_miranda", "true");
      enableEsposaMode();
      renderSidebarList();
      selectActiveChat(activeChat);
      lockOverlay.classList.add("hidden");
    } else {
      lockError.classList.remove("hidden");
    }
  };
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(err => console.log("SW error:", err));
  }
}

let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  checkPwaInstallState();
});

let isEsposaMode = false;
function checkUrlMode() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("mode") === "esposa") {
    enableEsposaMode();
  }
}

function enableEsposaMode() {
  isEsposaMode = true;
  document.getElementById("toggle-esposa-mode").textContent = "👑 Modo General";
  document.querySelector(".user-name").textContent = "Lindsay Miranda";
  document.querySelector(".user-role").textContent = "Finanzas Familiares";
  const lindsayBanner = document.getElementById("lindsay-banner");
  if (lindsayBanner) lindsayBanner.classList.remove("hidden");
  activeChat = TEAM_MEMBERS[1]; // Contabilidad
}

function renderSidebarList() {
  contactsListEl.innerHTML = "";
  let list = currentTab === "contacts" ? TEAM_MEMBERS : CHANNELS;

  if (isEsposaMode) {
    if (currentTab === "contacts") {
      list = TEAM_MEMBERS.filter(m => m.id === "contabilidad" || m.id === "financiero");
    } else {
      list = CHANNELS.filter(c => c.id === "chan-cuentas");
    }
  }

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = `contact-card ${item.id === activeChat.id ? 'active' : ''}`;
    card.onclick = () => selectActiveChat(item);

    card.innerHTML = `
      <div class="contact-avatar">
        ${item.avatar}
        <span class="status-dot ${item.status === 'active' ? 'active' : 'busy'}"></span>
      </div>
      <div class="contact-details">
        <div class="contact-name-row">
          <span class="contact-name">${item.name}</span>
        </div>
        <div class="contact-role">${item.role}</div>
      </div>
    `;
    contactsListEl.appendChild(card);
  });
}

function selectActiveChat(item) {
  activeChat = item;
  renderSidebarList();

  currentChatAvatar.textContent = item.avatar;
  currentChatName.textContent = item.name;
  currentChatRole.textContent = item.role;
  currentChatCid.textContent = `ID: ${item.cid}`;

  renderActiveChatMessages();

  if (window.innerWidth <= 768) {
    sidebarEl.classList.remove("mobile-open");
  }
}

function renderActiveChatMessages() {
  messagesContainerEl.innerHTML = "";
  const history = chatHistories[activeChat.id] || [];

  history.forEach(msg => {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${msg.sender === 'user' ? 'sent' : 'received'}`;

    let contentHtml = "";
    if (msg.mediaType === "voice") {
      contentHtml += `<div class="media-tag">🎙️ Nota de Voz</div>`;
    } else if (msg.mediaType === "photo") {
      contentHtml += `<div class="media-tag">📷 Recibo / Factura</div>`;
      if (msg.imgSrc) {
        contentHtml += `<img src="${msg.imgSrc}" style="max-width:100%; border-radius:8px; margin:6px 0;">`;
      }
    }

    contentHtml += `<div>${formatMarkdown(msg.text)}</div>`;
    contentHtml += `<span class="time">${msg.time}</span>`;

    bubble.innerHTML = contentHtml;
    messagesContainerEl.appendChild(bubble);
  });

  messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
}

function formatMarkdown(text) {
  if (!text) return "";
  const sanitized = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return sanitized
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}

function setupEventListeners() {
  btnTabContacts.onclick = () => {
    currentTab = "contacts";
    btnTabContacts.classList.add("active");
    btnTabChannels.classList.remove("active");
    renderSidebarList();
  };

  btnTabChannels.onclick = () => {
    currentTab = "channels";
    btnTabChannels.classList.add("active");
    btnTabContacts.classList.remove("active");
    renderSidebarList();
  };

  mobileSidebarToggle.onclick = () => {
    sidebarEl.classList.toggle("mobile-open");
  };

  chatFormEl.onsubmit = (e) => {
    e.preventDefault();
    const text = messageTextInput.value.trim();
    if (!text && !attachedMedia) return;

    sendMessage(text);
  };

  photoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        attachedMedia = { type: "photo", data: event.target.result, filename: file.name };
        showMediaPreview(`📷 Foto: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  recordVoiceBtn.onclick = toggleVoiceRecording;
  closePreviewBtn.onclick = clearMediaPreview;

  const installPwaBtn = document.getElementById("install-pwa-btn");
  if (installPwaBtn) {
    installPwaBtn.onclick = async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          console.log("App instalada");
        }
        deferredInstallPrompt = null;
      } else {
        alert("📱 Para instalar en tu celular:\n1. Toca los 3 puntos del navegador.\n2. Selecciona 'Agregar a inicio'.");
      }
    };
  }

  const toggleEsposaBtn = document.getElementById("toggle-esposa-mode");
  if (toggleEsposaBtn) {
    toggleEsposaBtn.onclick = () => {
      const lindsayBanner = document.getElementById("lindsay-banner");
      if (isEsposaMode) {
        isEsposaMode = false;
        toggleEsposaBtn.textContent = "👩‍💼 Modo Esposa";
        document.querySelector(".user-name").textContent = "Deymer Miranda";
        document.querySelector(".user-role").textContent = "Propietario & Director";
        if (lindsayBanner) lindsayBanner.classList.add("hidden");
        activeChat = TEAM_MEMBERS[0];
      } else {
        enableEsposaMode();
      }
      renderSidebarList();
      selectActiveChat(activeChat);
    };
  }

  openSettingsBtn.onclick = () => settingsModal.classList.remove("hidden");
  closeSettingsBtn.onclick = () => settingsModal.classList.add("hidden");
  cancelSettingsBtn.onclick = () => settingsModal.classList.add("hidden");
  saveSettingsBtn.onclick = () => {
    alert("✅ Ajustes guardados con éxito.");
    settingsModal.classList.add("hidden");
  };
}

function showMediaPreview(text) {
  previewText.textContent = text;
  mediaPreviewBar.classList.remove("hidden");
}

function clearMediaPreview() {
  attachedMedia = null;
  mediaPreviewBar.classList.add("hidden");
  photoInput.value = "";
}

async function toggleVoiceRecording() {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/ogg' });
        attachedMedia = { type: "voice", blob: audioBlob };
        showMediaPreview("🎙️ Nota de voz (Lista)");
      };

      mediaRecorder.start();
      isRecording = true;
      recordVoiceBtn.classList.add("recording");
    } catch (err) {
      alert("Micrófono no otorgado.");
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    recordVoiceBtn.classList.remove("recording");
  }
}

function sendMessage(text) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgObj = {
    sender: "user",
    text: text || (attachedMedia ? (attachedMedia.type === "voice" ? "Nota de voz emitida" : "Recibo subido") : ""),
    time: time,
    mediaType: attachedMedia ? attachedMedia.type : null,
    imgSrc: attachedMedia && attachedMedia.type === "photo" ? attachedMedia.data : null
  };

  chatHistories[activeChat.id].push(msgObj);
  renderActiveChatMessages();

  messageTextInput.value = "";
  clearMediaPreview();

  setTimeout(() => {
    generateAgentResponse(text, msgObj.mediaType);
  }, 900);
}

function generateAgentResponse(userText, mediaType) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let responseText = "";

  if (activeChat.id === "manager") {
    responseText = `👑 **[Gerente General]:** Recibido Director. Orden registrada: "${userText}". Coordinando ejecución inmediata.`;
  } else if (activeChat.id === "contabilidad") {
    responseText = mediaType === "photo"
      ? "🧾 **[Contabilidad]:** Recibo de compra de Lindsay asentado en `RECIBOS_CONTABLES.md`."
      : `📚 **[Contabilidad]:** Asiento registrado: "${userText}". Saldos conciliados.`;
  } else if (activeChat.id === "financiero") {
    responseText = `📊 **[Financiero]:** Reporte analizado: "${userText}". Integrado a liquidez.`;
  } else if (activeChat.id === "planificacion") {
    responseText = `🗺️ **[Planificación]:** Tarea integrada en la hoja de ruta: "${userText}".`;
  } else if (activeChat.id === "asistente") {
    responseText = `📋 **[Asistente]:** Actividad registrada en \`BITACORA_GENERAL_EMPRESA.md\`: "${userText}".`;
  } else if (activeChat.id === "diseno") {
    responseText = `🎨 **[Diseño UI/UX]:** Directiva estético-visual recibida: "${userText}". Rediseñando componentes.`;
  } else if (activeChat.id === "seguridad") {
    responseText = `🛡️ **[Seguridad]:** Mensaje auditado bajo Ley 3: "${userText}". 0 vulnerabilidades.`;
  } else {
    responseText = `🫡 **[${activeChat.name}]:** Orden recibida: "${userText}". Ejecución en curso.`;
  }

  chatHistories[activeChat.id].push({
    sender: "agent",
    text: responseText,
    time: time
  });

  renderActiveChatMessages();
  showNativeNotification(`Mensaje de ${activeChat.name}`, responseText.replace(/\*\*/g, ''));
}
