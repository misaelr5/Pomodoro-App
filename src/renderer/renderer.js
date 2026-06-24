const STORAGE_KEY = "futureFocusDataV1";
const THEME_KEY = "futureFocusTheme";
const SETTINGS_KEY = "israFocusSettingsV1";
const TIMER_KEY = "israFocusTimerStateV1";
const TODAY = getDateKey(new Date());

// Nota mia: dejo constantes y reglas de negocio arriba para no mezclar dominio con UI.
const defaultCategories = [
  { name: "Trabajo", color: "#2563eb" },
  { name: "Estudio", color: "#0891b2" },
  { name: "Personal", color: "#7c3aed" },
  { name: "Otro", color: "#64748b" }
];

const openingMessages = [
  "¿Cuánto tiempo le vas a invertir a tu futuro hoy?",
  "Un bloque a la vez. Eso es todo lo que hace falta.",
  "El que trabaja hoy, decide mañana.",
  "No necesitás motivación. Necesitás empezar.",
  "Cada pomodoro es una versión mejor de vos.",
  "¿Qué versión de vos aparece hoy?",
  "Enfocate 50 minutos. El resto del día te lo ganás.",
  "Las horas que invertís hoy, nadie te las quita.",
  "Hoy es un buen día para ser disciplinado.",
  "El esfuerzo de hoy es el resultado de mañana.",
  "No hace falta estar listo. Hace falta empezar.",
  "¿Cuántos bloques le das hoy a lo que importa?"
];

const modes = [
  {
    id: "classic",
    name: "Clasico",
    focusMinutes: 25,
    breakMinutes: 5,
    time: "25 min foco + 5 min descanso",
    ideal: "Estudiar, empezar tareas, evitar procrastinar"
  },
  {
    id: "intermediate",
    name: "Intermedio",
    focusMinutes: 40,
    breakMinutes: 10,
    time: "40 min foco + 10 min descanso",
    ideal: "Lectura, programacion, teoria larga"
  },
  {
    id: "deep",
    name: "Profundo",
    focusMinutes: 50,
    breakMinutes: 10,
    time: "50 min foco + 10 min descanso",
    ideal: "Trabajo serio sin cortar tanto el ritmo"
  },
  {
    id: "ultrafocus",
    name: "Ultrafoco",
    focusMinutes: 90,
    breakMinutes: 25,
    time: "90 min foco + 20/30 min descanso",
    ideal: "Proyectos grandes, coding, estudio intenso"
  }
];

const defaultSettings = {
  sound: "soft",
  volume: 35,
  longBreakEvery: 4,
  longBreakMinutes: 25,
  alwaysOnTop: true
};

const elements = {
  modeList: document.getElementById("modeList"),
  openingMessage: document.getElementById("openingMessage"),
  themeToggle: document.getElementById("themeToggle"),
  startFocusButton: document.getElementById("startFocusButton"),
  mainMinimizeButton: document.getElementById("mainMinimizeButton"),
  finishDayButton: document.getElementById("finishDayButton"),
  quickStartButton: document.getElementById("quickStartButton"),
  soundSelect: document.getElementById("soundSelect"),
  volumeInput: document.getElementById("volumeInput"),
  longBreakEverySelect: document.getElementById("longBreakEverySelect"),
  longBreakMinutesSelect: document.getElementById("longBreakMinutesSelect"),
  alwaysOnTopInput: document.getElementById("alwaysOnTopInput"),
  pauseButton: document.getElementById("pauseButton"),
  resumeButton: document.getElementById("resumeButton"),
  toBreakButton: document.getElementById("toBreakButton"),
  resetButton: document.getElementById("resetButton"),
  phaseLabel: document.getElementById("phaseLabel"),
  activeModeName: document.getElementById("activeModeName"),
  activeTaskLabel: document.getElementById("activeTaskLabel"),
  timeSummary: document.getElementById("timeSummary"),
  timerDisplay: document.getElementById("timerDisplay"),
  timerCaption: document.getElementById("timerCaption"),
  progressValue: document.getElementById("progressValue"),
  sessionCount: document.getElementById("sessionCount"),
  streakCount: document.getElementById("streakCount"),
  completionCard: document.getElementById("completionCard"),
  completionMessage: document.getElementById("completionMessage"),
  taskForm: document.getElementById("taskForm"),
  taskTitleInput: document.getElementById("taskTitleInput"),
  taskCategorySelect: document.getElementById("taskCategorySelect"),
  customCategoryWrap: document.getElementById("customCategoryWrap"),
  customCategoryInput: document.getElementById("customCategoryInput"),
  taskEstimateSelect: document.getElementById("taskEstimateSelect"),
  taskList: document.getElementById("taskList"),
  historyList: document.getElementById("historyList"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  weeklyChart: document.getElementById("weeklyChart"),
  weeklySummary: document.getElementById("weeklySummary"),
  categoryBreakdown: document.getElementById("categoryBreakdown"),
  statsCategoryFilter: document.getElementById("statsCategoryFilter"),
  accuracySummary: document.getElementById("accuracySummary"),
  noteDialog: document.getElementById("noteDialog"),
  noteForm: document.getElementById("noteForm"),
  noteInput: document.getElementById("noteInput"),
  summaryDialog: document.getElementById("summaryDialog"),
  summaryForm: document.getElementById("summaryForm"),
  summaryTitle: document.getElementById("summaryTitle"),
  summaryContent: document.getElementById("summaryContent"),
  confirmCloseButton: document.getElementById("confirmCloseButton"),
  miniPlayer: document.getElementById("miniPlayer"),
  miniDragHandle: document.getElementById("miniDragHandle"),
  miniCover: document.getElementById("miniCover"),
  miniTime: document.getElementById("miniTime"),
  miniPhase: document.getElementById("miniPhase"),
  miniMode: document.getElementById("miniMode"),
  miniCaption: document.getElementById("miniCaption"),
  miniPlayPauseButton: document.getElementById("miniPlayPauseButton"),
  miniNextButton: document.getElementById("miniNextButton"),
  miniResetButton: document.getElementById("miniResetButton"),
  miniMinimizeButton: document.getElementById("miniMinimizeButton"),
  miniExpandButton: document.getElementById("miniExpandButton"),
  miniCloseButton: document.getElementById("miniCloseButton"),
  miniLauncher: document.getElementById("miniLauncher"),
  tabs: Array.from(document.querySelectorAll(".tab-button")),
  panels: {
    tasks: document.getElementById("tasksPanel"),
    history: document.getElementById("historyPanel"),
    stats: document.getElementById("statsPanel"),
    settings: document.getElementById("settingsPanel")
  }
};

// Estado vivo de la pantalla. Los datos persistentes van por separado en localStorage.
const state = {
  selectedModeId: "classic",
  phase: "setup",
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  timerId: null,
  timerEndsAt: null,
  isBackground: false,
  focusStartIso: null,
  activeBreakSeconds: 0,
  activeTaskId: null,
  activeTab: "tasks",
  pendingHistoryId: null,
  miniPlayerClosed: true,
  miniLauncherVisible: false,
  miniPlayerMinimized: true,
  miniPlayerExpanded: false
};

let data = loadData();
let settings = loadSettings();
let currentTheme = localStorage.getItem(THEME_KEY) === "space" ? "space" : "light";

const radius = 112;
const circumference = 2 * Math.PI * radius;
elements.progressValue.style.strokeDasharray = `${circumference}`;

// =========================
// Persistence
// =========================

function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeData(parsed);
  } catch {
    return normalizeData(null);
  }
}

function normalizeData(value) {
  const base = value && typeof value === "object" ? value : {};
  const categories = Array.isArray(base.categories) && base.categories.length
    ? base.categories
    : defaultCategories;
  return {
    tasks: Array.isArray(base.tasks) ? base.tasks.map((task) => ({
      id: task.id ?? uid("task"),
      title: task.title ?? "Tarea sin titulo",
      category: task.category ?? "Otro",
      estimate: Number(task.estimate ?? 1),
      actualPomodoros: Number(task.actualPomodoros ?? 0),
      done: Boolean(task.done),
      createdDate: task.createdDate ?? TODAY,
      completedDate: task.completedDate ?? ""
    })) : [],
    history: Array.isArray(base.history) ? base.history.map((entry) => ({
      id: entry.id ?? uid("pomodoro"),
      date: entry.date ?? getDateKey(new Date(entry.endIso ?? Date.now())),
      startIso: entry.startIso ?? entry.endIso ?? new Date().toISOString(),
      endIso: entry.endIso ?? new Date().toISOString(),
      durationMinutes: Number(entry.durationMinutes ?? 25),
      mode: entry.mode ?? "Clasico",
      taskId: entry.taskId ?? null,
      task: entry.task ?? "",
      category: entry.category ?? "Otro",
      estimate: entry.estimate ?? "",
      real: entry.real ?? "",
      notes: entry.notes ?? ""
    })) : [],
    completedDays: Array.isArray(base.completedDays) ? base.completedDays : [],
    categories
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function saveTimerState() {
  const payload = {
    selectedModeId: state.selectedModeId,
    phase: state.phase,
    totalSeconds: state.totalSeconds,
    remainingSeconds: state.remainingSeconds,
    timerEndsAt: state.timerEndsAt,
    focusStartIso: state.focusStartIso,
    activeBreakSeconds: state.activeBreakSeconds,
    activeTaskId: state.activeTaskId,
    savedAt: Date.now()
  };
  localStorage.setItem(TIMER_KEY, JSON.stringify(payload));
}

function restoreTimerState() {
  try {
    const saved = JSON.parse(localStorage.getItem(TIMER_KEY));
    if (!saved || !modes.some((mode) => mode.id === saved.selectedModeId)) return;
    state.selectedModeId = saved.selectedModeId;
    state.phase = saved.phase ?? "setup";
    state.totalSeconds = Number(saved.totalSeconds ?? getSelectedMode().focusMinutes * 60);
    state.remainingSeconds = Number(saved.remainingSeconds ?? state.totalSeconds);
    state.timerEndsAt = saved.timerEndsAt ?? null;
    state.focusStartIso = saved.focusStartIso ?? null;
    state.activeBreakSeconds = Number(saved.activeBreakSeconds ?? 0);
    state.activeTaskId = saved.activeTaskId ?? null;

    if (state.timerEndsAt && (state.phase === "focus" || state.phase === "break")) {
      syncRemainingSeconds();
      if (state.remainingSeconds > 0) {
        runCountdown();
      } else {
        state.remainingSeconds = 0;
        state.timerEndsAt = null;
      }
    }
  } catch {
    localStorage.removeItem(TIMER_KEY);
  }
}

// =========================
// Theme
// =========================

function applyTheme() {
  document.body.classList.toggle("theme-space", currentTheme === "space");
  elements.themeToggle.checked = currentTheme === "space";
}

function setOpeningMessage() {
  const index = Math.floor(Math.random() * openingMessages.length);
  elements.openingMessage.textContent = openingMessages[index];
}

function toggleTheme() {
  currentTheme = elements.themeToggle.checked ? "space" : "light";
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme();
}

function applySettings() {
  elements.soundSelect.value = settings.sound;
  elements.volumeInput.value = String(settings.volume);
  elements.longBreakEverySelect.value = String(settings.longBreakEvery);
  elements.longBreakMinutesSelect.value = String(settings.longBreakMinutes);
  elements.alwaysOnTopInput.checked = settings.alwaysOnTop;
  window.futureFocus?.setMiniAlwaysOnTop?.(settings.alwaysOnTop);
}

function updateSettings() {
  settings = {
    sound: elements.soundSelect.value,
    volume: Number(elements.volumeInput.value),
    longBreakEvery: Number(elements.longBreakEverySelect.value),
    longBreakMinutes: Number(elements.longBreakMinutesSelect.value),
    alwaysOnTop: elements.alwaysOnTopInput.checked
  };
  saveSettings();
  applySettings();
  render();
}

// =========================
// Domain helpers
// =========================

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSelectedMode() {
  return modes.find((mode) => mode.id === state.selectedModeId) ?? modes[0];
}

function getTask(taskId) {
  return data.tasks.find((task) => task.id === taskId) ?? null;
}

function getCategory(name) {
  return data.categories.find((category) => category.name === name) ?? defaultCategories[3];
}

function getTodayHistory() {
  return data.history.filter((entry) => entry.date === TODAY);
}

function getTodayTasks() {
  return data.tasks.filter((task) => task.createdDate === TODAY);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatHumanMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  return `${hours} h ${rest} min`;
}

function formatClock(iso) {
  return new Date(iso).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function calculateStreak() {
  const days = new Set(data.completedDays);
  if (!days.has(TODAY)) {
    return days.has(addDays(TODAY, -1)) ? countBackwards(addDays(TODAY, -1), days) : 0;
  }
  return countBackwards(TODAY, days);
}

function countBackwards(startDay, days) {
  let count = 0;
  let cursor = startDay;
  while (days.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

function markCompletedDay() {
  if (!data.completedDays.includes(TODAY)) {
    data.completedDays.push(TODAY);
  }
}

function getSessionSummary() {
  const todayHistory = getTodayHistory();
  const focusMinutes = todayHistory.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const pomodoros = todayHistory.length;
  const message = pomodoros < 2 ? "Algo es algo" : pomodoros <= 5 ? "Buen dia" : "Dia excelente";
  return { todayHistory, focusMinutes, pomodoros, message, streak: calculateStreak() };
}

function setProgress() {
  const elapsed = state.totalSeconds - state.remainingSeconds;
  const progress = state.totalSeconds === 0 ? 1 : elapsed / state.totalSeconds;
  elements.progressValue.style.strokeDashoffset = `${circumference * (1 - progress)}`;
  elements.miniCover.style.setProperty("--mini-progress", `${progress * 360}deg`);
}

function getProgressRatio() {
  if (state.totalSeconds === 0) return 1;
  return (state.totalSeconds - state.remainingSeconds) / state.totalSeconds;
}

function syncRemainingSeconds() {
  if (state.timerEndsAt === null) return;
  state.remainingSeconds = Math.max(0, Math.ceil((state.timerEndsAt - Date.now()) / 1000));
}

function getTickDelay() {
  return state.isBackground ? 5000 : 1000;
}

// =========================
// Side effects
// =========================

function playNotification() {
  if (settings.sound === "none") return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  const gain = audioContext.createGain();
  const volume = Math.max(0.001, settings.volume / 100);
  const soundMap = {
    soft: [523.25, 659.25, 783.99],
    bell: [659.25, 987.77, 1318.51],
    short: [880, 880]
  };
  const notes = soundMap[settings.sound] ?? soundMap.soft;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume * 0.55, audioContext.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.85);
  gain.connect(audioContext.destination);

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(audioContext.currentTime + index * 0.11);
    oscillator.stop(audioContext.currentTime + 0.55 + index * 0.11);
  });
}

function notifyUser(title, body) {
  window.futureFocus?.notify?.({ title, body });
}

// =========================
// Rendering
// =========================

function renderModes() {
  elements.modeList.innerHTML = "";
  modes.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mode-card";
    button.dataset.active = String(mode.id === state.selectedModeId);
    button.innerHTML = `
      <span>
        <strong>${escapeHtml(mode.name)}</strong>
        <small>${escapeHtml(mode.ideal)}</small>
      </span>
      <em>${escapeHtml(mode.time)}</em>
    `;
    button.addEventListener("click", () => selectMode(mode.id));
    elements.modeList.appendChild(button);
  });
}

function renderTaskControls() {
  elements.taskEstimateSelect.innerHTML = "";
  for (let amount = 1; amount <= 8; amount += 1) {
    const option = document.createElement("option");
    option.value = String(amount);
    option.textContent = `${amount} pomodoro${amount > 1 ? "s" : ""}`;
    elements.taskEstimateSelect.appendChild(option);
  }

  elements.taskCategorySelect.innerHTML = "";
  data.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    elements.taskCategorySelect.appendChild(option);
  });
  const customOption = document.createElement("option");
  customOption.value = "__custom";
  customOption.textContent = "Crear categoria";
  elements.taskCategorySelect.appendChild(customOption);

  const previousFilter = elements.statsCategoryFilter.value || "__all";
  elements.statsCategoryFilter.innerHTML = `<option value="__all">Todas</option>`;
  data.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    elements.statsCategoryFilter.appendChild(option);
  });
  elements.statsCategoryFilter.value = Array.from(elements.statsCategoryFilter.options)
    .some((option) => option.value === previousFilter) ? previousFilter : "__all";
}

function renderTasks() {
  const tasks = getTodayTasks();
  elements.taskList.innerHTML = "";

  if (!tasks.length) {
    elements.taskList.innerHTML = `<p class="empty-state">Agrega una tarea para asociarla al proximo bloque de focus.</p>`;
    return;
  }

  tasks.forEach((task) => {
    const category = getCategory(task.category);
    const row = document.createElement("article");
    row.className = "task-item";
    row.dataset.done = String(task.done);
    row.dataset.active = String(task.id === state.activeTaskId);
    row.innerHTML = `
      <label class="task-check">
        <input type="checkbox" ${task.done ? "checked" : ""} data-task-done="${task.id}" />
        <span>${escapeHtml(task.title)}</span>
      </label>
      <div class="task-meta">
        <button class="category-chip" type="button" style="--chip-color: ${category.color}" data-task-active="${task.id}">
          ${task.id === state.activeTaskId ? "Activa" : "Usar"} · ${task.category}
        </button>
        <small>Estimado ${task.estimate} · Real ${task.actualPomodoros}</small>
      </div>
    `;
    elements.taskList.appendChild(row);
  });
}

function renderHistory() {
  const history = getTodayHistory().slice().reverse();
  elements.historyList.innerHTML = "";

  if (!history.length) {
    elements.historyList.innerHTML = `<p class="empty-state">Todavia no hay pomodoros registrados hoy.</p>`;
    return;
  }

  history.forEach((entry) => {
    const category = getCategory(entry.category);
    const row = document.createElement("article");
    row.className = "history-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(entry.mode)}</strong>
        <p>${escapeHtml(entry.task || "Sin tarea asociada")}</p>
        <small>${formatClock(entry.startIso)} - ${formatClock(entry.endIso)} · ${entry.durationMinutes} min</small>
      </div>
      <div class="history-side">
        <span class="category-chip readonly" style="--chip-color: ${category.color}">${escapeHtml(entry.category)}</span>
        <small>${escapeHtml(entry.notes || "Sin notas")}</small>
      </div>
    `;
    elements.historyList.appendChild(row);
  });
}

function renderStats() {
  const selectedCategory = elements.statsCategoryFilter.value || "__all";
  const last7 = Array.from({ length: 7 }, (_, index) => addDays(TODAY, index - 6));
  const rows = last7.map((dateKey) => {
    const entries = data.history.filter((entry) => {
      const matchesDate = entry.date === dateKey;
      const matchesCategory = selectedCategory === "__all" || entry.category === selectedCategory;
      return matchesDate && matchesCategory;
    });
    const minutes = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    return { dateKey, entries, minutes, pomodoros: entries.length };
  });
  const maxPomodoros = Math.max(1, ...rows.map((row) => row.pomodoros));

  elements.weeklyChart.innerHTML = rows.map((row) => {
    const height = Math.max(8, Math.round((row.pomodoros / maxPomodoros) * 120));
    const label = row.dateKey.slice(5).replace("-", "/");
    return `
      <div class="bar-item">
        <div class="bar-value" style="height: ${height}px">${row.pomodoros}</div>
        <small>${label}</small>
        <small>${formatHumanMinutes(row.minutes)}</small>
      </div>
    `;
  }).join("");

  const bestDay = rows.slice().sort((a, b) => b.pomodoros - a.pomodoros)[0];
  const peak = getPeakProductivity();
  elements.weeklySummary.innerHTML = `
    <p><strong>Dia mas productivo:</strong> ${bestDay.pomodoros ? bestDay.dateKey : "Sin datos"}</p>
    <p><strong>Foco semanal:</strong> ${formatHumanMinutes(rows.reduce((sum, row) => sum + row.minutes, 0))}</p>
    <p><strong>Hora pico:</strong> ${peak}</p>
  `;

  const categoryTotals = new Map();
  const categoryEntries = data.history.filter((entry) => last7.includes(entry.dateKey ?? entry.date));
  categoryEntries.forEach((entry) => {
    categoryTotals.set(entry.category, (categoryTotals.get(entry.category) ?? 0) + 1);
  });
  const maxCategory = Math.max(1, ...Array.from(categoryTotals.values()));
  elements.categoryBreakdown.innerHTML = Array.from(categoryTotals.entries()).map(([name, count]) => {
    const category = getCategory(name);
    return `
      <div class="category-row">
        <span class="category-chip readonly" style="--chip-color: ${category.color}">${escapeHtml(name)}</span>
        <div class="category-meter">
          <span style="width: ${(count / maxCategory) * 100}%; --chip-color: ${category.color}"></span>
        </div>
        <strong>${count}</strong>
      </div>
    `;
  }).join("") || `<p class="empty-state">Sin categorias registradas.</p>`;

  elements.accuracySummary.innerHTML = getAccuracySummary();
}

function getAccuracySummary() {
  const completedTasks = data.tasks.filter((task) => task.done && task.actualPomodoros > 0);
  if (!completedTasks.length) {
    return `<p>No hay tareas completadas con datos reales todavia.</p>`;
  }
  const precision = completedTasks.reduce((sum, task) => {
    const diff = Math.abs(task.estimate - task.actualPomodoros);
    const score = Math.max(0, 100 - (diff / Math.max(task.estimate, task.actualPomodoros)) * 100);
    return sum + score;
  }, 0) / completedTasks.length;

  return `
    <p><strong>Precision promedio:</strong> ${Math.round(precision)}%</p>
    <p><strong>Tareas medidas:</strong> ${completedTasks.length}</p>
  `;
}

function getPeakProductivity() {
  const startDate = addDays(TODAY, -13);
  const buckets = new Map();
  data.history
    .filter((entry) => entry.date >= startDate)
    .forEach((entry) => {
      const hour = new Date(entry.endIso).getHours();
      const bucketStart = Math.floor(hour / 2) * 2;
      buckets.set(bucketStart, (buckets.get(bucketStart) ?? 0) + 1);
    });

  if (!buckets.size) {
    return "Sin datos suficientes";
  }

  const [hour] = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1])[0];
  return `Tu hora pico es entre las ${formatHour(hour)} y ${formatHour(hour + 2)} 🚀`;
}

function formatHour(hour24) {
  const hour = hour24 % 24;
  const suffix = hour >= 12 ? "pm" : "am";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${suffix}`;
}

function renderTabs() {
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === state.activeTab;
    tab.dataset.active = String(isActive);
    elements.panels[tab.dataset.tab].hidden = !isActive;
  });
}

function render({ full = false } = {}) {
  const mode = getSelectedMode();
  const isRunning = state.timerId !== null;
  const isFocus = state.phase === "focus";
  const isBreak = state.phase === "break";
  const isSetup = state.phase === "setup";
  const isComplete = state.phase === "complete";
  const activeTask = getTask(state.activeTaskId);
  const todayHistory = getTodayHistory();

  elements.activeModeName.textContent = mode.name;
  elements.timeSummary.textContent = mode.time;
  elements.timerDisplay.textContent = formatTime(state.remainingSeconds);
  elements.sessionCount.textContent = todayHistory.length;
  elements.streakCount.textContent = calculateStreak();
  elements.activeTaskLabel.textContent = activeTask ? `Tarea activa: ${activeTask.title}` : "Sin tarea activa";

  elements.phaseLabel.textContent = {
    setup: "Preparacion",
    focus: "Focus",
    break: "Descanso",
    complete: "Sesion finalizada"
  }[state.phase];

  elements.timerCaption.textContent = {
    setup: "Listo para empezar",
    focus: isRunning ? "Focus activo" : "Focus en pausa",
    break: isRunning ? "Descanso activo" : "Descanso en pausa",
    complete: "Pomodoro completado"
  }[state.phase];

  elements.startFocusButton.disabled = isRunning || isFocus || isBreak;
  elements.pauseButton.disabled = !isRunning || isSetup || isComplete;
  elements.resumeButton.disabled = isRunning || isSetup || isComplete || state.remainingSeconds === 0;
  elements.toBreakButton.textContent = shouldUseLongBreak() ? "Pasar a descanso largo" : "Pasar a descanso";
  elements.toBreakButton.disabled = !(isFocus && !isRunning && state.remainingSeconds === 0);

  elements.completionCard.hidden = !isComplete;
  if (isComplete) {
    const summary = getSessionSummary();
    elements.completionMessage.textContent =
      `Invertiste ${formatHumanMinutes(summary.focusMinutes)} en estudio y completaste ${summary.pomodoros} pomodoros.`;
  }

  elements.miniPlayer.hidden = state.miniPlayerClosed;
  elements.miniLauncher.hidden = !state.miniLauncherVisible;
  elements.miniPlayer.dataset.minimized = String(state.miniPlayerMinimized);
  elements.miniPlayer.dataset.expanded = String(state.miniPlayerExpanded);
  elements.miniCover.dataset.running = String(isRunning);
  elements.miniTime.textContent = formatTime(state.remainingSeconds);
  elements.miniPhase.textContent = elements.phaseLabel.textContent;
  elements.miniMode.textContent = mode.name;
  elements.miniCaption.textContent = elements.timerCaption.textContent;
  elements.miniNextButton.textContent = shouldUseLongBreak() ? "Largo" : "Descanso";
  elements.miniNextButton.disabled = !(isFocus && !isRunning && state.remainingSeconds === 0);
  elements.miniPlayPauseButton.textContent = getMiniPlayPauseLabel(isRunning, isSetup, isComplete);
  sendMiniSnapshot({ mode, isRunning, isSetup, isComplete, isFocus });

  setProgress();

  // Nota mia: el timer corre cada segundo, asi que el render pesado solo se dispara cuando cambia data/UI.
  if (full) {
    renderTabs();
    renderModes();
    renderTasks();
    renderHistory();
    renderStats();
  }
}

function sendMiniSnapshot({ mode, isRunning, isSetup, isComplete, isFocus }) {
  window.futureFocus?.sendMiniSnapshot?.({
    time: formatTime(state.remainingSeconds),
    phase: elements.phaseLabel.textContent,
    mode: mode.name,
    caption: elements.timerCaption.textContent,
    isRunning,
    progress: getProgressRatio(),
    playPauseLabel: getMiniPlayPauseLabel(isRunning, isSetup, isComplete),
    nextLabel: shouldUseLongBreak() ? "Largo" : "Descanso",
    canStartBreak: isFocus && !isRunning && state.remainingSeconds === 0,
    canChangeMode: !isRunning && !isFocus && state.phase !== "break"
  });
}

function refreshWorkspace() {
  render({ full: true });
}

function getMiniPlayPauseLabel(isRunning, isSetup, isComplete) {
  if (isRunning) return "Pausar";
  if (isSetup || isComplete || state.remainingSeconds === 0) return "Iniciar";
  return "Continuar";
}

function selectMode(modeId) {
  if (state.timerId !== null || state.phase === "focus" || state.phase === "break") return;
  const mode = modes.find((item) => item.id === modeId);
  state.selectedModeId = mode.id;
  state.totalSeconds = mode.focusMinutes * 60;
  state.remainingSeconds = state.totalSeconds;
  state.phase = "setup";
  saveTimerState();
  refreshWorkspace();
}

function cycleSelectedMode(direction) {
  if (state.timerId !== null || state.phase === "focus" || state.phase === "break") return;
  const currentIndex = modes.findIndex((mode) => mode.id === state.selectedModeId);
  const nextIndex = (currentIndex + direction + modes.length) % modes.length;
  selectMode(modes[nextIndex].id);
}

function startTimer(phase, seconds) {
  clearTimer();
  state.phase = phase;
  state.totalSeconds = seconds;
  state.remainingSeconds = seconds;
  state.timerEndsAt = Date.now() + seconds * 1000;
  if (phase === "focus") {
    state.focusStartIso = new Date().toISOString();
  }
  elements.completionCard.hidden = true;
  runCountdown();
  saveTimerState();
  render();
}

function runCountdown() {
  syncRemainingSeconds();
  if (state.remainingSeconds <= 0) {
    clearTimer();
    handlePhaseFinished();
    render();
    return;
  }

  render();
  state.timerId = window.setTimeout(runCountdown, getTickDelay());
  saveTimerState();
}

function clearTimer() {
  if (state.timerId !== null) {
    window.clearTimeout(state.timerId);
    state.timerId = null;
  }
}

function rescheduleCountdown() {
  if (state.timerId === null) return;
  clearTimer();
  runCountdown();
}

function handlePhaseFinished() {
  playNotification();
  if (state.phase === "focus") {
    notifyUser("Bloque de focus terminado", "Anota una idea rapida y pasa al descanso cuando estes listo.");
    registerPomodoro();
  } else if (state.phase === "break") {
    state.activeBreakSeconds = 0;
    state.timerEndsAt = null;
    state.phase = "complete";
    notifyUser("Descanso terminado", "Pomodoro completado. Buen trabajo.");
    saveTimerState();
  }
}

function registerPomodoro() {
  const mode = getSelectedMode();
  const activeTask = getTask(state.activeTaskId);
  const endIso = new Date().toISOString();
  const entry = {
    id: uid("pomodoro"),
    date: TODAY,
    startIso: state.focusStartIso ?? endIso,
    endIso,
    durationMinutes: mode.focusMinutes,
    mode: mode.name,
    taskId: activeTask?.id ?? null,
    task: activeTask?.title ?? "",
    category: activeTask?.category ?? "Otro",
    estimate: activeTask?.estimate ?? "",
    real: activeTask ? activeTask.actualPomodoros + 1 : "",
    notes: ""
  };

  data.history.push(entry);
  markCompletedDay();
  state.timerEndsAt = null;
  if (activeTask) {
    activeTask.actualPomodoros += 1;
  }
  state.pendingHistoryId = entry.id;
  saveData();
  saveTimerState();
  refreshWorkspace();
  showNoteDialog();
}

function shouldUseLongBreak() {
  const todayCount = getTodayHistory().length;
  return todayCount > 0 && todayCount % settings.longBreakEvery === 0;
}

function startFocus() {
  const mode = getSelectedMode();
  startTimer("focus", mode.focusMinutes * 60);
}

function quickStart() {
  if (state.timerId !== null) return;
  if (state.phase === "focus" || state.phase === "break") {
    resumeTimer();
    return;
  }
  startFocus();
}

function pauseTimer() {
  syncRemainingSeconds();
  clearTimer();
  saveTimerState();
  render();
}

function resumeTimer() {
  if (state.phase === "focus" || state.phase === "break") {
    clearTimer();
    state.timerEndsAt = Date.now() + state.remainingSeconds * 1000;
    runCountdown();
    saveTimerState();
    render();
  }
}

function startBreak() {
  const mode = getSelectedMode();
  state.activeBreakSeconds = shouldUseLongBreak() ? settings.longBreakMinutes * 60 : mode.breakMinutes * 60;
  startTimer("break", state.activeBreakSeconds);
}

function resetSession() {
  const mode = getSelectedMode();
  clearTimer();
  state.phase = "setup";
  state.totalSeconds = mode.focusMinutes * 60;
  state.remainingSeconds = state.totalSeconds;
  state.timerEndsAt = null;
  state.activeBreakSeconds = 0;
  saveTimerState();
  render();
}

function handleTaskSubmit(event) {
  event.preventDefault();
  const title = elements.taskTitleInput.value.trim();
  if (!title) return;
  let category = elements.taskCategorySelect.value;
  if (category === "__custom") {
    category = elements.customCategoryInput.value.trim() || "Otro";
    if (!data.categories.some((item) => item.name.toLowerCase() === category.toLowerCase())) {
      data.categories.push({ name: category, color: makeCategoryColor(data.categories.length) });
    }
  }

  const task = {
    id: uid("task"),
    title,
    category,
    estimate: Number(elements.taskEstimateSelect.value),
    actualPomodoros: 0,
    done: false,
    createdDate: TODAY,
    completedDate: ""
  };
  data.tasks.push(task);
  state.activeTaskId = task.id;
  elements.taskForm.reset();
  elements.customCategoryWrap.hidden = true;
  saveData();
  renderTaskControls();
  refreshWorkspace();
}

function makeCategoryColor(index) {
  const colors = ["#0ea5e9", "#16a34a", "#f97316", "#db2777", "#9333ea", "#0f766e"];
  return colors[index % colors.length];
}

function handleTaskListClick(event) {
  const doneInput = event.target.closest("[data-task-done]");
  const activeButton = event.target.closest("[data-task-active]");
  if (doneInput) {
    const task = getTask(doneInput.dataset.taskDone);
    task.done = doneInput.checked;
    task.completedDate = task.done ? TODAY : "";
    saveData();
    refreshWorkspace();
  }
  if (activeButton) {
    state.activeTaskId = activeButton.dataset.taskActive;
    refreshWorkspace();
  }
}

function handleCategoryChange() {
  elements.customCategoryWrap.hidden = elements.taskCategorySelect.value !== "__custom";
}

function showNoteDialog() {
  elements.noteInput.value = "";
  if (typeof elements.noteDialog.showModal === "function") {
    elements.noteDialog.showModal();
  }
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const submitter = event.submitter?.value;
  const entry = data.history.find((item) => item.id === state.pendingHistoryId);
  if (entry && submitter === "save") {
    entry.notes = elements.noteInput.value.trim().slice(0, 200);
    saveData();
  }
  state.pendingHistoryId = null;
  elements.noteDialog.close();
  refreshWorkspace();
}

function showSummaryDialog({ closing = false } = {}) {
  const summary = getSessionSummary();
  elements.summaryTitle.textContent = closing ? "Resumen antes de cerrar" : "Resumen del dia";
  elements.confirmCloseButton.hidden = !closing;
  elements.summaryContent.innerHTML = `
    <article><strong>${summary.pomodoros}</strong><small>Pomodoros completados</small></article>
    <article><strong>${formatHumanMinutes(summary.focusMinutes)}</strong><small>Tiempo total de foco</small></article>
    <article><strong>${summary.streak}</strong><small>Racha actual</small></article>
    <article><strong>${summary.message}</strong><small>Mensaje del dia</small></article>
  `;
  if (typeof elements.summaryDialog.showModal === "function") {
    elements.summaryDialog.showModal();
  }
}

function handleSummarySubmit(event) {
  event.preventDefault();
  const shouldClose = event.submitter?.value === "confirm";
  elements.summaryDialog.close();
  if (shouldClose && window.futureFocus?.confirmClose) {
    window.futureFocus.confirmClose();
  }
}

function exportCsv() {
  const rows = [
    ["Fecha", "Hora inicio", "Hora fin", "Duracion (min)", "Modo", "Tarea", "Categoria", "Notas"],
    ...data.history.map((entry) => [
      entry.date,
      formatClock(entry.startIso),
      formatClock(entry.endIso),
      entry.durationMinutes,
      entry.mode,
      entry.task,
      entry.category,
      entry.notes
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `israfocus-historial-${TODAY}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function handleMiniPlayPause() {
  const isRunning = state.timerId !== null;
  if (isRunning) {
    pauseTimer();
    return;
  }
  if ((state.phase === "focus" || state.phase === "break") && state.remainingSeconds > 0) {
    resumeTimer();
    return;
  }
  startFocus();
}

function toggleMiniMinimized() {
  state.miniPlayerMinimized = !state.miniPlayerMinimized;
  state.miniPlayerExpanded = false;
  render();
}

function toggleMiniExpanded() {
  state.miniPlayerExpanded = !state.miniPlayerExpanded;
  state.miniPlayerMinimized = false;
  render();
}

function closeMiniPlayer() {
  state.miniPlayerClosed = true;
  state.miniLauncherVisible = true;
  render();
}

function openMiniPlayer() {
  state.miniPlayerClosed = false;
  state.miniLauncherVisible = false;
  render();
}

function openMiniPlayerFromMain() {
  window.futureFocus?.openMiniWindow?.();
  render();
}

function moveMiniPlayer(x, y) {
  const bounds = elements.miniPlayer.getBoundingClientRect();
  const safeX = Math.min(Math.max(12, x), window.innerWidth - bounds.width - 12);
  const safeY = Math.min(Math.max(12, y), window.innerHeight - bounds.height - 12);
  elements.miniPlayer.style.left = `${safeX}px`;
  elements.miniPlayer.style.top = `${safeY}px`;
  elements.miniPlayer.style.right = "auto";
  elements.miniPlayer.style.bottom = "auto";
}

function enableMiniPlayerDrag() {
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let isDragging = false;
  elements.miniDragHandle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const bounds = elements.miniPlayer.getBoundingClientRect();
    dragOffsetX = event.clientX - bounds.left;
    dragOffsetY = event.clientY - bounds.top;
    isDragging = true;
    elements.miniDragHandle.setPointerCapture(event.pointerId);
  });
  elements.miniDragHandle.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    moveMiniPlayer(event.clientX - dragOffsetX, event.clientY - dragOffsetY);
  });
  elements.miniDragHandle.addEventListener("pointerup", (event) => {
    isDragging = false;
    elements.miniDragHandle.releasePointerCapture(event.pointerId);
  });
}

function bindEvents() {
  window.addEventListener("blur", () => {
    state.isBackground = true;
    rescheduleCountdown();
  });
  window.addEventListener("focus", () => {
    state.isBackground = false;
    rescheduleCountdown();
    render();
  });
  elements.themeToggle.addEventListener("change", toggleTheme);
  elements.quickStartButton.addEventListener("click", quickStart);
  elements.soundSelect.addEventListener("change", updateSettings);
  elements.volumeInput.addEventListener("input", updateSettings);
  elements.longBreakEverySelect.addEventListener("change", updateSettings);
  elements.longBreakMinutesSelect.addEventListener("change", updateSettings);
  elements.alwaysOnTopInput.addEventListener("change", updateSettings);
  elements.startFocusButton.addEventListener("click", startFocus);
  elements.mainMinimizeButton.addEventListener("click", openMiniPlayerFromMain);
  elements.finishDayButton.addEventListener("click", () => showSummaryDialog());
  elements.pauseButton.addEventListener("click", pauseTimer);
  elements.resumeButton.addEventListener("click", resumeTimer);
  elements.toBreakButton.addEventListener("click", startBreak);
  elements.resetButton.addEventListener("click", resetSession);
  elements.taskForm.addEventListener("submit", handleTaskSubmit);
  elements.taskCategorySelect.addEventListener("change", handleCategoryChange);
  elements.statsCategoryFilter.addEventListener("change", refreshWorkspace);
  elements.taskList.addEventListener("click", handleTaskListClick);
  elements.noteForm.addEventListener("submit", handleNoteSubmit);
  elements.summaryForm.addEventListener("submit", handleSummarySubmit);
  elements.exportCsvButton.addEventListener("click", exportCsv);
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTab = tab.dataset.tab;
      refreshWorkspace();
    });
  });
  elements.miniPlayPauseButton.addEventListener("click", handleMiniPlayPause);
  elements.miniNextButton.addEventListener("click", startBreak);
  elements.miniResetButton.addEventListener("click", resetSession);
  elements.miniMinimizeButton.addEventListener("click", toggleMiniMinimized);
  elements.miniExpandButton.addEventListener("click", toggleMiniExpanded);
  elements.miniCloseButton.addEventListener("click", closeMiniPlayer);
  elements.miniLauncher.addEventListener("click", openMiniPlayer);

  if (window.futureFocus?.onCloseRequest) {
    window.futureFocus.onCloseRequest(() => showSummaryDialog({ closing: true }));
  }
  if (window.futureFocus?.onMiniCommand) {
    window.futureFocus.onMiniCommand((command) => {
      if (command === "playPause") handleMiniPlayPause();
      if (command === "startBreak") startBreak();
      if (command === "reset") resetSession();
      if (command === "requestSnapshot") render();
      if (command.startsWith("cycleMode:")) {
        cycleSelectedMode(Number(command.split(":")[1]));
      }
    });
  }
}

renderTaskControls();
setOpeningMessage();
applyTheme();
applySettings();
restoreTimerState();
bindEvents();
enableMiniPlayerDrag();
refreshWorkspace();
