// Footer year + close other open FAQs when one is clicked.
// Tiny on purpose: this is a static landing page, nothing more.

document.getElementById("year").textContent = new Date().getFullYear();

const faqDetails = document.querySelectorAll(".faq details");
faqDetails.forEach(d => {
  d.addEventListener("toggle", () => {
    if (!d.open) return;
    faqDetails.forEach(other => {
      if (other !== d) other.open = false;
    });
  });
});

/* -----------------------------------------------------------------
   Live dictation demo (How it works). Mirrors the app's flow: hold
   the key, speak, words type into the focused field; then voice
   commands and voice editing. Loops only while in view; leaves the
   static HTML in place under reduced-motion. No dependencies.
   ----------------------------------------------------------------- */
(function () {
  const text = document.getElementById("demoText");
  if (!text) return;

  const root = document.getElementById("demo");
  const hud = document.getElementById("demoHud");
  const hudIc = document.getElementById("demoHudIc");
  const hudLbl = document.getElementById("demoHudLbl");
  const said = document.getElementById("demoSaid");
  const keyEl = document.getElementById("demoKey");
  const kbd = keyEl.querySelector("kbd");
  const capTitle = document.getElementById("demoCapTitle");
  const capSub = document.getElementById("demoCapSub");

  const MIC = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm6-3a6 6 0 0 1-5 5.91V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-3.09A6 6 0 0 1 6 11a1 1 0 1 1 2 0 4 4 0 0 0 8 0 1 1 0 1 1 2 0Z"/></svg>';
  const WAND = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M11 2.5l1.7 4.8 4.8 1.7-4.8 1.7L11 15.5 9.3 10.7 4.5 9l4.8-1.7L11 2.5Zm7.5 9l.95 2.55L22 15l-2.55.95L18.5 18.5l-.95-2.55L15 15l2.55-.95L18.5 11.5Z"/></svg>';

  const REC = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#ff6a5e" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="#ff6a5e"/></svg>';
  const SPIN = '<span class="demo-spin"></span>';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let buf = "";
  let livePreview = false;

  // Only Smart Typing mirrors the in-progress sentence inside the HUD pill,
  // head-truncated to its tail (the app reserves a fixed width and truncates
  // from the start). Dictate, voice commands, voice edit and meeting mode show
  // a status label in the pill instead - no live transcript.
  const HUD_MAX = 30;
  const hudTail = (s) => {
    const t = s.replace(/\s+/g, " ").trim();
    return t.length > HUD_MAX ? "…" + t.slice(-HUD_MAX) : t;
  };
  const render = () => {
    text.textContent = buf;
    if (livePreview) {
      const tail = hudTail(buf);
      hudLbl.textContent = tail || "Listening";
      hudLbl.classList.toggle("dim", !tail);
    }
  };

  const setCap = (t, s) => { capTitle.textContent = t; capSub.textContent = s; };
  const keyDown = (label) => { kbd.textContent = label; keyEl.classList.add("down"); };
  const keyUp = () => keyEl.classList.remove("down");
  const tap = async (label) => { keyDown(label); await sleep(280); keyUp(); };

  // Smart typing: the pill mirrors the live transcript.
  const hudListenLive = () => {
    hudIc.innerHTML = MIC;
    livePreview = true;
    hudLbl.textContent = "Listening";
    hudLbl.classList.add("dim");
    hud.classList.add("on", "live", "preview");
  };
  // Batch dictate / voice commands: static "Listening", no live preview.
  const hudListen = () => {
    hudIc.innerHTML = MIC;
    livePreview = false;
    hudLbl.classList.remove("dim");
    hudLbl.textContent = "Listening";
    hud.classList.add("on", "live");
    hud.classList.remove("preview");
  };
  const hudTranscribe = () => {
    hudIc.innerHTML = SPIN;
    livePreview = false;
    hudLbl.classList.remove("dim");
    hudLbl.textContent = "Transcribing";
    hud.classList.add("on");
    hud.classList.remove("live", "preview");
  };
  const hudMeeting = (label) => {
    hudIc.innerHTML = REC;
    livePreview = false;
    hudLbl.classList.remove("dim");
    hudLbl.textContent = label;
    hud.classList.add("on", "live");
    hud.classList.remove("preview");
  };
  const hudEdit = () => {
    hudIc.innerHTML = WAND;
    livePreview = false;
    hudLbl.classList.remove("dim");
    hudLbl.textContent = "Voice Edit";
    hud.classList.add("on", "live");
    hud.classList.remove("preview");
  };
  const hudHide = () => {
    livePreview = false;
    hud.classList.remove("on", "live", "preview");
    hudLbl.classList.remove("dim");
  };
  const clearStage = () => {
    hudHide();
    buf = "";
    text.classList.remove("nocaret");
    render();
    keyEl.classList.remove("down");
    kbd.textContent = "⌥";
    said.classList.remove("on");
  };

  async function say(phrase) {
    said.textContent = phrase;
    said.classList.add("on");
    await sleep(950);
    said.classList.remove("on");
    await sleep(240);
  }
  async function typeWords(str) {
    const words = str.split(" ");
    for (let i = 0; i < words.length; i++) {
      buf += (i ? " " : "") + words[i];
      render();
      await sleep(105 + Math.random() * 80);
    }
  }
  async function append(str) { buf += str; render(); await sleep(160); }
  async function deleteTo(mark) {
    while (buf.length > mark) {
      buf = buf.slice(0, -1);
      render();
      await sleep(26);
    }
  }

  // 1. Dictate (Smart Typing off): hold, speak, release; the transcript pastes
  //    in once on release. The pill shows Listening, then Transcribing.
  async function sceneDictate() {
    clearStage();
    setCap("Dictate", "Hold the key, speak, release. Your transcript pastes in.");
    await sleep(500);
    keyDown("⌥");
    hudListen();
    await sleep(1800);
    keyUp();
    hudTranscribe();
    await sleep(950);
    buf = "Let’s ship the new onboarding flow this week.";
    render();
    await sleep(350);
    hudHide();
    await sleep(1100);
  }

  // 2. Smart typing: words stream into the field live, mirrored in the pill.
  async function sceneSmart() {
    clearStage();
    setCap("Smart typing", "Words type into the focused app live as you speak.");
    await sleep(500);
    keyDown("⌥");
    hudListenLive();
    await sleep(450);
    await typeWords("Let’s ship the new onboarding flow this week.");
    await sleep(650);
    hudHide(); keyUp();
    await sleep(1100);
  }

  // 3. Voice commands: spoken commands become punctuation, breaks and deletes.
  //    Status-only pill here - no live transcript preview.
  async function sceneCommands() {
    clearStage();
    setCap("Voice commands", "Say “new paragraph”, “comma”, “period”, “scratch that”.");
    await sleep(500);
    keyDown("⌥");
    hudListen();
    await sleep(400);
    await typeWords("Ping the design team");
    await say("comma");
    await append(", ");
    await typeWords("they’ll want this before launch");
    await say("period");
    await append(".");
    const mark = buf.length;
    await say("new paragraph");
    await append("\n\n");
    await typeWords("Send the deck too");
    await say("scratch that");
    await deleteTo(mark);
    await sleep(500);
    hudHide(); keyUp();
    await sleep(1000);
  }

  // 4. Voice editing: select text, hold the edit hotkey, speak the change.
  async function sceneEdit() {
    clearStage();
    setCap("Voice editing", "Select text, hold ⌃⌥E, and speak the change.");
    text.innerHTML = "Let’s meet <span class=\"sel\" id=\"demoSel\">this week</span>.";
    await sleep(750);
    keyDown("⌃⌥E");
    hudEdit();
    await sleep(450);
    await say("change this week to Friday");
    await sleep(200);
    const sel = document.getElementById("demoSel");
    if (sel) { sel.textContent = "Friday"; sel.className = "swap"; }
    await sleep(950);
    hudHide(); keyUp();
    await sleep(1150);
  }

  // 5. Meeting mode: tap to record mic + system audio; on stop it transcribes
  //    and diarizes into a speaker-labelled Markdown transcript.
  async function sceneMeeting() {
    clearStage();
    setCap("Meeting mode", "Records your mic + system audio, labels each speaker, saves Markdown.");
    text.classList.add("nocaret");
    await sleep(500);
    await tap("⌃⌥M");
    text.innerHTML = '<span class="demo-rec"><span class="demo-recdot"></span>Recording · mic + system audio</span>';
    hudMeeting("Meeting · 0:00");
    for (let s = 1; s <= 8; s++) {
      await sleep(600);
      hudLbl.textContent = "Meeting · 0:0" + s;
    }
    await tap("⌃⌥M");
    hudTranscribe();
    await sleep(1100);
    const lines = [
      '<span class="demo-spk">Speaker 1:</span> Are we still on for Friday?',
      '<span class="demo-spk">You:</span> Yes, design hands off tomorrow.',
      '<span class="demo-spk">Speaker 2:</span> I’ll prep the release notes.'
    ];
    let html = "";
    for (const ln of lines) {
      html += (html ? "\n" : "") + ln;
      text.innerHTML = html;
      await sleep(700);
    }
    hudHide();
    await sleep(1500);
  }

  const scenes = [sceneDictate, sceneSmart, sceneCommands, sceneEdit, sceneMeeting];

  // Reduced motion: keep the static finished sentence already in the HTML.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let inView = false;
  const gate = async () => { while (!inView || document.hidden) await sleep(220); };

  async function loop() {
    for (;;) {
      for (const scene of scenes) {
        await gate();
        await scene();
      }
    }
  }

  let started = false;
  const io = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView && !started) { started = true; loop(); }
  }, { threshold: 0.25 });
  io.observe(root);
})();
