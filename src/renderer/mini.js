const elements = {
  shell: document.getElementById("miniShell"),
  cover: document.getElementById("cover"),
  time: document.getElementById("time"),
  phase: document.getElementById("phase"),
  mode: document.getElementById("mode"),
  caption: document.getElementById("caption"),
  playPauseButton: document.getElementById("playPauseButton"),
  nextButton: document.getElementById("nextButton"),
  resetButton: document.getElementById("resetButton"),
  restoreButton: document.getElementById("restoreButton"),
  closeButton: document.getElementById("closeButton")
};

let modePickerArmed = false;

function applySnapshot(snapshot) {
  if (!snapshot) return;
  elements.time.textContent = snapshot.time;
  elements.phase.textContent = snapshot.phase;
  elements.mode.textContent = snapshot.mode;
  elements.caption.textContent = snapshot.caption;
  elements.cover.dataset.running = String(snapshot.isRunning);
  elements.cover.style.setProperty("--progress", `${snapshot.progress * 360}deg`);
  elements.playPauseButton.textContent = snapshot.playPauseLabel;
  elements.nextButton.textContent = snapshot.nextLabel;
  elements.nextButton.disabled = !snapshot.canStartBreak;
  elements.mode.dataset.armed = String(modePickerArmed && snapshot.canChangeMode);
  elements.mode.title = snapshot.canChangeMode
    ? "Click y rueda para cambiar modo"
    : "Pausa o reinicia para cambiar modo";
}

elements.mode.addEventListener("click", () => {
  modePickerArmed = !modePickerArmed;
  elements.mode.dataset.armed = String(modePickerArmed);
});

elements.mode.addEventListener("wheel", (event) => {
  if (!modePickerArmed) return;
  event.preventDefault();
  window.futureFocus.miniCommand(event.deltaY > 0 ? "cycleMode:1" : "cycleMode:-1");
});

elements.playPauseButton.addEventListener("click", () => window.futureFocus.miniCommand("playPause"));
elements.nextButton.addEventListener("click", () => window.futureFocus.miniCommand("startBreak"));
elements.resetButton.addEventListener("click", () => window.futureFocus.miniCommand("reset"));
elements.restoreButton.addEventListener("click", () => window.futureFocus.restoreMainWindow());
elements.closeButton.addEventListener("click", () => window.futureFocus.closeMiniWindow());

window.futureFocus.onMiniSnapshot(applySnapshot);
