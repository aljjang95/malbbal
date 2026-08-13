(() => {
  "use strict";

  const FILLER_WORDS = ["약간", "좀", "그냥", "뭐랄까", "솔직히", "일단"];
  const HEDGE_WORDS = [
    "죄송", "미안", "혹시", "것 같", "아닌가", "아닐까", "아마",
    "싶은데", "같아요", "거든요", "될까요", "해도 될까", "조금",
    "아무래도", "괜히", "사실은", "저어", "그게", "아니 그게"
  ];
  const DECISION_MARKS = [
    "합니다", "안됩니다", "안 됩니다", "못합니다", "못 합니다",
    "됩니다", "아닙니다", "결정", "이유", "오늘", "지금", "선은", "못합니다"
  ];

  const PANS = [
    {
      id: "interview",
      no: "01",
      name: "면접",
      tag: "왜 왔는지, 한 줄로 서게.",
      lines: [
        "우리 회사 왜 지원하셨어요? 솔직히 말해보세요.",
        "경력 공백이 보이는데요. 그 기간에 뭐 하셨죠?",
        "이 직무, 다른 지원자보다 당신이 나은 이유를 서른 초로. 변명은 빼요."
      ],
      rewrites: {
        hedge: "결론부터 말합니다. 이 일을 이미 해왔고, 여기서 그 방식을 바로 씁니다.",
        thin: "이 직무의 빈칸을 제가 메웁니다. 근거는 제가 낸 결과입니다.",
        fat: "군더더기를 걷습니다. 지원 이유는 성과이고, 합류하면 그다음 주부터 그 일을 합니다.",
        sharp: "비교 질문에 겸손을 넣지 않습니다. 제가 한 일이 이 자리의 공백을 메웁니다."
      }
    },
    {
      id: "refuse",
      no: "02",
      name: "거절하기",
      tag: "미안함으로 거절하지 마십시오.",
      lines: [
        "이번만 좀 도와주면 안 돼? 네가 아니면 진짜 막막해.",
        "다들 하는데 너만 빠지면 분위기 이상해지잖아.",
        "거절하면 앞으로 부탁하기 어려울 것 같은데. 생각해봐."
      ],
      rewrites: {
        hedge: "이번엔 못 합니다. 이유는 일정이고, 가능한 선은 여기까지입니다.",
        thin: "거절입니다. 가능한 한 가지는 여기까지이고, 그 위로는 열지 않습니다.",
        fat: "미안함은 빼겠습니다. 못 하는 일이고, 분위기가 아니라 제 한도입니다.",
        sharp: "자리가 어색해져도 한도는 지킵니다. 부탁은 여기까지, 이후는 받지 않습니다."
      }
    },
    {
      id: "bargain",
      no: "03",
      name: "가격깎기",
      tag: "깎는 게 아니라 선을 긋는 일.",
      lines: [
        "이 가격이 최저예요. 더 깎으면 저희도 남는 게 없어요.",
        "다른 데 가보셔도 이 퀄리티는 이 값입니다.",
        "오늘 결정 안 하시면 이 조건은 사라져요."
      ],
      rewrites: {
        hedge: "오늘 계약하면 이 금액입니다. 그 위에서 움직이지 않습니다.",
        thin: "퀄리티는 인정합니다. 가격은 이 선에서 맞춰 주십시오.",
        fat: "최저라는 말에 올라타지 않습니다. 제가 지불할 숫자는 이미 정해 뒀습니다.",
        sharp: "조건을 급하게 닫지 마십시오. 숫자는 이것이고, 오늘 이 자리에서 맞춥니다."
      }
    },
    {
      id: "dating",
      no: "04",
      name: "소개팅",
      tag: "호감이 아니라 입장을 말하십시오.",
      lines: [
        "첫인상 어땠어요? 좀 긴장한 것 같아서.",
        "취미가 뭐예요? 저랑 맞는 사람인지 궁금해서.",
        "다음에 또 볼 생각 있어요? 솔직하게요."
      ],
      rewrites: {
        hedge: "긴장보다 흥미가 먼저입니다. 오늘 이 자리에서 그걸 확인하러 왔습니다.",
        thin: "맞는지 재는 자리입니다. 제 쪽은 이렇게 삽니다.",
        fat: "솔직히·그냥을 빼고 말합니다. 다음에 볼 의사는 있고, 이유는 오늘 대화입니다.",
        sharp: "호감을 돌려 말하지 않습니다. 한 번 더 만나고 싶습니다."
      }
    },
    {
      id: "apology",
      no: "05",
      name: "사과",
      tag: "변명과 사과를 한 문장에 섞지 마십시오.",
      lines: [
        "지금 변명하는 거예요, 사과하는 거예요?",
        "그게 최선이었다고요? 피해는 그대로인데.",
        "다시는 안 그럴 수 있어요? 말로만."
      ],
      rewrites: {
        hedge: "변명 없습니다. 판단이 잘못이었고, 조치는 오늘 안에 시작합니다.",
        thin: "최선이 아니었습니다. 부족한 판단이 피해를 냈고, 복구 순서는 이겁니다.",
        fat: "죄송하다는 말을 세 번 하지 않습니다. 잘못을 한 줄로 받고, 다음 행동을 말합니다.",
        sharp: "말만 두지 않습니다. 같은 구멍을 닫는 방법을 이미 정해 두었습니다."
      }
    },
    {
      id: "opening",
      no: "06",
      name: "발표오프닝",
      tag: "첫 문장이 자리를 먹습니다.",
      lines: [
        "자, 시간 없습니다. 한 줄로 요점부터요.",
        "청중이 벌써 휴대폰을 보고 있어요. 붙잡으세요.",
        "왜 지금 이 이야기여야 하는지, 첫 문장에서 결정됩니다."
      ],
      rewrites: {
        hedge: "오늘 가져갈 숫자 하나입니다. 나머지는 그걸 증명합니다.",
        thin: "휴대폰을 내려놓게 만들 문장입니다. 이해관계가 지금 걸려 있습니다.",
        fat: "인사와 목차를 버립니다. 한 줄 요점, 그리고 왜 오늘인지만 남깁니다.",
        sharp: "첫 문장이 결론입니다. 이 자리가 필요한 이유를 지금 닫습니다."
      }
    }
  ];

  const state = {
    pan: null,
    variant: 0,
    streak: 0,
    timeLimit: 20,
    remaining: 20,
    timerId: null,
    recState: "idle",
    stream: null,
    recorder: null,
    chunks: [],
    recUrl: null,
    recognition: null,
    transcript: "",
    interim: "",
    startedAt: 0,
    endedAt: 0,
    fallback: false,
    holding: false,
    roundOpenAt: 0
  };

  const $ = (id) => document.getElementById(id);
  const screens = {
    landing: $("screen-landing"),
    pick: $("screen-pick"),
    round: $("screen-round"),
    result: $("screen-result")
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      const on = key === name;
      el.classList.toggle("is-on", on);
      if (on) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function hangulLen(text) {
    const m = String(text || "").match(/[가-힣]/g);
    return m ? m.length : 0;
  }

  function countFillers(text) {
    if (!text) return 0;
    const t = text.replace(/\s+/g, " ").trim();
    let n = 0;
    n += (t.match(/(?:^|[\s,.\-…])음+(?=[요\s,.\-…]|$)/g) || []).length;
    n += (t.match(/(?:^|[\s,.\-…])어+(?=[네요\s,.\-…]|$)/g) || []).length;
    n += (t.match(/(?:^|[\s,])그(?:[\s,]|$)/g) || []).length;
    FILLER_WORDS.forEach((w) => {
      const re = new RegExp(w, "g");
      n += (t.match(re) || []).length;
    });
    return n;
  }

  function countHedges(text) {
    if (!text) return 0;
    return HEDGE_WORDS.reduce((n, w) => n + (text.split(w).length - 1), 0);
  }

  function countApology(text) {
    if (!text) return 0;
    return (text.match(/죄송|미안|실례/g) || []).length;
  }

  function startsWeak(text) {
    if (!text) return false;
    const s = text.trim();
    return /^(아+|어+|음+|저[,.\s]|그게|아니\s?그게|솔직히|일단|그냥|혹시|죄송|미안)/.test(s);
  }

  function decisionHits(text) {
    if (!text) return 0;
    return DECISION_MARKS.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
  }

  function eojelCount(text) {
    if (!text) return 0;
    const spaced = text.trim().split(/\s+/).filter(Boolean);
    if (spaced.length >= 3) return spaced.length;
    const h = hangulLen(text);
    return Math.max(1, Math.round(h / 3.2));
  }

  function pickMime() {
    if (typeof MediaRecorder === "undefined") return "";
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      "audio/ogg;codecs=opus"
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  }

  function getRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function stopTTS() {
    try {
      if (window.speechSynthesis) speechSynthesis.cancel();
    } catch (_) { /* ignore */ }
  }

  function speakKorean(text) {
    if (!window.speechSynthesis || !text) return;
    stopTTS();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.96;
    u.pitch = 0.98;
    const apply = () => {
      const voices = speechSynthesis.getVoices() || [];
      const ko = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ko"));
      if (ko) u.voice = ko;
    };
    apply();
    if (!(speechSynthesis.getVoices() || []).length) {
      speechSynthesis.addEventListener("voiceschanged", apply, { once: true });
    }
    speechSynthesis.speak(u);
  }

  async function analyzeAudio(blob) {
    if (!blob || blob.size < 80) {
      return { duration: 0, longestPause: 0, speechRatio: 0, speechSec: 0 };
    }
    let ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return { duration: 0, longestPause: 0, speechRatio: 0, speechSec: 0 };
      ctx = new AC();
      const arr = await blob.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr.slice(0));
      const data = buf.getChannelData(0);
      const sr = buf.sampleRate;
      const hop = Math.max(1, Math.floor(sr * 0.02));
      const rms = [];
      for (let i = 0; i < data.length; i += hop) {
        let s = 0;
        const end = Math.min(i + hop, data.length);
        for (let j = i; j < end; j++) s += data[j] * data[j];
        rms.push(Math.sqrt(s / (end - i)));
      }
      const sorted = rms.slice().sort((a, b) => a - b);
      const noise = sorted[Math.floor(sorted.length * 0.18)] || 0.008;
      const th = Math.max(0.012, noise * 3.4);
      const voiced = rms.map((v) => v > th);
      let a = 0;
      let b = voiced.length - 1;
      while (a < voiced.length && !voiced[a]) a++;
      while (b > a && !voiced[b]) b--;
      let longest = 0;
      let cur = 0;
      let speech = 0;
      for (let i = a; i <= b; i++) {
        if (!voiced[i]) {
          cur += 1;
          if (cur > longest) longest = cur;
        } else {
          cur = 0;
          speech += 1;
        }
      }
      const frame = hop / sr;
      return {
        duration: buf.duration,
        longestPause: longest * frame,
        speechRatio: b >= a ? speech / (b - a + 1) : 0,
        speechSec: speech * frame
      };
    } catch (_) {
      return { duration: 0, longestPause: 0, speechRatio: 0, speechSec: 0, error: true };
    } finally {
      if (ctx) {
        try { await ctx.close(); } catch (_) { /* ignore */ }
      }
    }
  }

  function scoreAll(text, audio, durationSec, typed) {
    const fillerCount = countFillers(text);
    const hedges = countHedges(text);
    const apology = countApology(text);
    const weak = startsWeak(text);
    const decisions = decisionHits(text);
    const chars = hangulLen(text);
    const contentChars = Math.max(0, chars - fillerCount * 2);
    const speechSec = audio.speechSec || (durationSec * (audio.speechRatio || 0.6));
    const talkSec = Math.max(typed ? durationSec : speechSec || durationSec, 0.6);

    let fillerScore = 100;
    fillerScore -= fillerCount * 14;
    fillerScore -= (text.match(/음어|어음/g) || []).length * 8;
    if (!text && !typed) fillerScore = 48;
    fillerScore = clamp(Math.round(fillerScore), 0, 100);

    let edge = 100;
    edge -= apology * 18;
    edge -= hedges * 9;
    if (weak) edge -= 22;
    if (fillerCount >= 4) edge -= 10;
    if (text && /것 같아요|아닌가요|될까요/.test(text)) edge -= 8;
    if (!text && !typed) edge = 45;
    edge = clamp(Math.round(edge), 0, 100);

    let density = 100;
    if (!text && !typed) {
      const r = audio.speechRatio || 0;
      density = clamp(Math.round(r * 70 + 12), 8, 72);
    } else if (contentChars < 8) {
      density = 16 + contentChars * 2;
    } else {
      const cps = contentChars / talkSec;
      const target = 7.5;
      const dist = Math.abs(cps - target);
      density = 92 - dist * 10;
      const ratio = fillerCount / Math.max(eojelCount(text), 1);
      density -= ratio * 80;
      density += Math.min(12, decisions * 5);
      if (contentChars < 18) density -= 18;
    }
    density = clamp(Math.round(density), 0, 100);

    let breath = 100;
    const pause = audio.longestPause || 0;
    const eojel = eojelCount(text);
    const wpm = talkSec > 0 && (text || typed) ? (eojel / talkSec) * 60 : 0;
    if (typed) {
      breath = 62;
      if ((text.match(/[…\.]{2,}|음|어/g) || []).length > 2) breath -= 14;
      if (text.length > 0 && text.length < 12) breath -= 10;
    } else {
      if (pause > 1.6) breath -= Math.min(40, (pause - 1.6) * 16);
      if (pause > 3.2) breath -= 12;
      const r = audio.speechRatio || 0;
      if (r < 0.4) breath -= 22;
      if (r > 0.94 && talkSec > 6) breath -= 8;
      if (wpm && wpm < 55) breath -= 18;
      if (wpm && wpm > 210) breath -= 16;
      if (!text && audio.error) breath = 50;
    }
    breath = clamp(Math.round(breath), 0, 100);

    return {
      density,
      edge,
      breath,
      filler: fillerScore,
      fillerCount,
      wpm: wpm ? Math.round(wpm) : 0,
      pause,
      weak,
      apology,
      hedges,
      typed: !!typed,
      hasText: !!text
    };
  }

  function rewriteFor(pan, flags) {
    const r = pan.rewrites;
    if (flags.weak || flags.apology > 0) return r.hedge;
    if (!flags.hasText || (flags.thin)) return r.thin;
    if (flags.fillerCount >= 3) return r.fat;
    return r.sharp;
  }

  function coachLines(pan, scores, text) {
    const lines = [];
    if (scores.weak || scores.apology > 0) {
      lines.push("첫 문장이 변명입니다. 결론부터.");
    }
    if (scores.fillerCount >= 2) {
      lines.push("음/어가 뜻을 먹기 전에 길을 막습니다.");
    }
    if (scores.density < 45) {
      lines.push("말이 길어진 자리에 판단이 없습니다. 숫자나 결정을 넣으십시오.");
    }
    if (scores.edge < 50 && !lines.some((l) => l.includes("변명"))) {
      lines.push("죄송하다는 말이 칼끝을 무디게 합니다.");
    }
    if (scores.breath < 48 && !scores.typed) {
      lines.push("침묵이 너무 깁니다. 숨은 가져가되 자리는 내주지 마세요.");
    } else if (scores.breath < 55 && scores.wpm > 200) {
      lines.push("속도가 쫓깁니다. 한 박자 낮추고 문장을 닫으세요.");
    }
    if (!text) {
      lines.push("인식은 실패했습니다. 녹음이 남았다면 뼈는 거기서 들립니다.");
    }

    const lowest = [
      ["밀도", scores.density],
      ["칼집", scores.edge],
      ["호흡", scores.breath],
      ["군더더기", scores.filler]
    ].sort((a, b) => a[1] - b[1])[0];

    if (lines.length === 0) {
      if (lowest[1] >= 80) {
        lines.push("뼈는 섰습니다. 첫 문장만 더 차갑게.");
      } else if (lowest[0] === "칼집") {
        lines.push("칼은 있는데 손끝이 흔들립니다.");
      } else if (lowest[0] === "밀도") {
        lines.push("빈 문장이 시간을 먹었습니다.");
      } else if (lowest[0] === "군더더기") {
        lines.push("일단, 솔직히, 그냥 — 이 세 단어가 신뢰를 깎습니다.");
      } else {
        lines.push("듣는 사람이 먼저 결론을 지어버립니다. 호흡을 닫으십시오.");
      }
    }

    if (scores.typed) {
      lines.push("타이핑은 폴백입니다. 다음 판은 입으로 서십시오.");
    }

    return lines.slice(0, 3).join(" ");
  }

  function setRecUI(mode) {
    state.recState = mode;
    const btn = $("btn-record");
    const label = $("record-label");
    const hint = $("record-hint");
    btn.classList.remove("is-idle", "is-listening", "is-processing", "is-denied");
    btn.classList.add("is-" + mode);
    const map = {
      idle: ["누르고 말하기", "누르는 동안만 녹음됩니다"],
      listening: ["듣는 중", "떼면 채점합니다"],
      processing: ["채점 중", "녹음은 이 기기 안에만 있습니다"],
      denied: ["마이크 거부", "아래 폴백으로 한 판을 마치십시오"]
    };
    label.textContent = map[mode][0];
    hint.textContent = map[mode][1];
    btn.setAttribute("aria-label", map[mode][0]);
  }

  function showFallback(reason) {
    state.fallback = true;
    $("fallback").hidden = false;
    if (reason === "denied") setRecUI("denied");
    $("record-hint").textContent =
      reason === "denied"
        ? "권한을 켜지 않으셨습니다. 폴백은 연습의 본길이 아닙니다."
        : "이 환경에선 마이크가 닫혀 있습니다. 폴백으로 제출하십시오.";
  }

  function hideFallback() {
    state.fallback = false;
    $("fallback").hidden = true;
    $("typed").value = "";
  }

  function clearTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function paintTimer() {
    const el = $("timer");
    el.textContent = String(Math.max(0, Math.ceil(state.remaining)));
    el.classList.toggle("is-late", state.remaining <= 5);
  }

  function startTimer() {
    clearTimer();
    state.remaining = state.timeLimit;
    paintTimer();
    const t0 = Date.now();
    state.timerId = setInterval(() => {
      const elapsed = (Date.now() - t0) / 1000;
      state.remaining = Math.max(0, state.timeLimit - elapsed);
      paintTimer();
      if (state.remaining <= 0) {
        clearTimer();
        if (state.holding) stopRecording(true);
        else if (state.recState === "idle" && !state.fallback) {
          showFallback("timeout");
          $("record-hint").textContent = "시간이 닫혔습니다. 폴백으로 제출하거나 다시 판을 여십시오.";
        }
      }
    }, 200);
  }

  function killStream() {
    if (state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
    }
  }

  function stopRecognition() {
    if (state.recognition) {
      try {
        state.recognition.onresult = null;
        state.recognition.onerror = null;
        state.recognition.onend = null;
        state.recognition.stop();
      } catch (_) { /* ignore */ }
      state.recognition = null;
    }
  }

  function startRecognition() {
    stopRecognition();
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    try {
      const rec = new Ctor();
      rec.lang = "ko-KR";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        let finalText = "";
        let interim = "";
        for (let i = 0; i < ev.results.length; i++) {
          const piece = ev.results[i][0] ? ev.results[i][0].transcript : "";
          if (ev.results[i].isFinal) finalText += piece;
          else interim += piece;
        }
        if (finalText) state.transcript = (state.transcript + " " + finalText).trim();
        state.interim = interim;
      };
      rec.onerror = () => { /* 인식 실패는 결과에서 정직하게 */ };
      rec.onend = () => {
        if (state.holding && state.recognition === rec) {
          try { rec.start(); } catch (_) { /* ignore */ }
        }
      };
      rec.start();
      state.recognition = rec;
    } catch (_) {
      state.recognition = null;
    }
  }

  async function beginRecording() {
    if (state.recState === "processing" || state.holding) return;
    if (state.recState === "denied") return;
    stopTTS();
    state.transcript = "";
    state.interim = "";
    state.chunks = [];
    state.holding = true;
    state.startedAt = Date.now();
    setRecUI("listening");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      state.holding = false;
      setRecUI("denied");
      showFallback("denied");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      if (!state.holding) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      state.stream = stream;
      const mime = pickMime();
      const rec = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      state.recorder = rec;
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size) state.chunks.push(e.data);
      };
      rec.start(120);
      startRecognition();
    } catch (err) {
      state.holding = false;
      const name = err && err.name ? err.name : "";
      setRecUI("denied");
      showFallback("denied");
      if (name === "NotFoundError") {
        $("record-hint").textContent = "마이크를 찾지 못했습니다. 폴백으로 제출하십시오.";
      }
    }
  }

  function recorderStop() {
    return new Promise((resolve) => {
      const rec = state.recorder;
      if (!rec || rec.state === "inactive") {
        resolve();
        return;
      }
      rec.onstop = () => resolve();
      try { rec.stop(); } catch (_) { resolve(); }
    });
  }

  async function stopRecording() {
    if (!state.holding && state.recState !== "listening") return;
    if (state.recState === "processing") return;
    state.holding = false;
    if (!state.recorder) {
      if (state.recState === "listening") setRecUI("idle");
      return;
    }
    setRecUI("processing");
    clearTimer();
    state.endedAt = Date.now();
    stopRecognition();
    await recorderStop();
    killStream();
    state.recorder = null;

    const mime = (state.chunks[0] && state.chunks[0].type) || "audio/webm";
    const blob = state.chunks.length ? new Blob(state.chunks, { type: mime }) : null;
    const duration = Math.max(0.4, (state.endedAt - state.startedAt) / 1000);
    const text = (state.transcript || state.interim || "").replace(/\s+/g, " ").trim();
    const audio = blob ? await analyzeAudio(blob) : { duration, longestPause: 0, speechRatio: 0, speechSec: 0 };
    finishRound({ text, blob, duration, audio, typed: false });
  }

  function submitTyped() {
    const text = ($("typed").value || "").replace(/\s+/g, " ").trim();
    if (!text) {
      $("typed").focus();
      return;
    }
    clearTimer();
    stopTTS();
    stopRecognition();
    killStream();
    const duration = Math.max(0.8, (Date.now() - state.roundOpenAt) / 1000);
    finishRound({
      text,
      blob: null,
      duration,
      audio: { duration, longestPause: 0, speechRatio: 0, speechSec: 0 },
      typed: true
    });
  }

  function finishRound({ text, blob, duration, audio, typed }) {
    const pan = state.pan;
    const flags = scoreAll(text, audio, duration, typed);
    flags.thin = hangulLen(text) < 14;
    const scores = {
      density: flags.density,
      edge: flags.edge,
      breath: flags.breath,
      filler: flags.filler
    };

    if (state.recUrl) {
      URL.revokeObjectURL(state.recUrl);
      state.recUrl = null;
    }

    $("result-label").textContent = pan.name + " · " + (state.streak + 1) + "판";
    $("coach").textContent = coachLines(pan, flags, text);

    const axes = [
      ["밀도", "말이 비지 않는지", scores.density],
      ["칼집", "주저 · 완곡 · 사과남발", scores.edge],
      ["호흡", "침묵 · 속도", scores.breath],
      ["군더더기", "음 · 어 · 그 · 약간 · 좀 · 그냥", scores.filler]
    ];
    $("axes").innerHTML = axes
      .map(
        ([name, sub, v], i) =>
          `<li class="axis">
            <div class="axis-head">
              <span class="axis-name">${name}</span>
              <span class="axis-sub">${sub}</span>
              <span class="axis-val">${v}</span>
            </div>
            <div class="axis-track" aria-hidden="true"><div class="axis-fill" data-i="${i}"></div></div>
          </li>`
      )
      .join("");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        axes.forEach(([, , v], i) => {
          const fill = $("axes").querySelector('.axis-fill[data-i="' + i + '"]');
          if (fill) fill.style.width = v + "%";
        });
      });
    });

    $("stat-filler").textContent = String(flags.fillerCount);
    $("stat-wpm").textContent = flags.wpm ? String(flags.wpm) : "—";
    if (typed) $("stat-pause").textContent = "— (타이핑)";
    else if (audio.error || !blob) $("stat-pause").textContent = "—";
    else $("stat-pause").textContent = (Math.round(flags.pause * 10) / 10).toFixed(1) + "초";

    $("transcript").textContent = text || "인식 실패 — 녹음은 남음";
    $("rewrite").textContent = rewriteFor(pan, flags);

    const wrap = $("playback-wrap");
    const audioEl = $("playback");
    if (blob) {
      state.recUrl = URL.createObjectURL(blob);
      audioEl.src = state.recUrl;
      wrap.hidden = false;
    } else {
      audioEl.removeAttribute("src");
      wrap.hidden = true;
    }

    showScreen("result");
    setRecUI("idle");
  }

  function cleanupRound() {
    clearTimer();
    stopTTS();
    stopRecognition();
    try { $("playback").pause(); } catch (_) {}
    state.holding = false;
    if (state.recorder && state.recorder.state !== "inactive") {
      try { state.recorder.stop(); } catch (_) { /* ignore */ }
    }
    state.recorder = null;
    killStream();
  }

  function openRound() {
    hideFallback();
    cleanupRound();
    const pan = state.pan;
    const line = pan.lines[state.variant % pan.lines.length];
    $("round-label").textContent = pan.name + " · " + (state.streak + 1) + "판";
    $("opponent-line").textContent = line;
    setRecUI("idle");
    $("record-zone").hidden = false;
    state.roundOpenAt = Date.now();
    showScreen("round");
    startTimer();
    speakKorean(line);
  }

  function renderBoard() {
    const board = $("board");
    board.innerHTML = "";
    PANS.forEach((pan) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ticket";
      btn.innerHTML =
        `<span class="ticket-stub">
           <span class="ticket-no">${pan.no}</span>
           <span class="ticket-mark"></span>
         </span>
         <span class="ticket-body">
           <span class="ticket-name">${pan.name}</span>
           <span class="ticket-tag">${pan.tag}</span>
         </span>`;
      btn.addEventListener("click", () => {
        state.pan = pan;
        state.variant = 0;
        state.streak = 0;
        state.timeLimit = 20;
        openRound();
      });
      board.appendChild(btn);
    });
  }

  function bindRecord() {
    const btn = $("btn-record");
    const start = (ev) => {
      if (ev) {
        ev.preventDefault();
        if (ev.pointerId != null && btn.setPointerCapture) {
          try { btn.setPointerCapture(ev.pointerId); } catch (_) { /* ignore */ }
        }
      }
      beginRecording();
    };
    const end = (ev) => {
      if (ev) ev.preventDefault();
      if (state.holding) stopRecording();
    };
    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointercancel", end);
    btn.addEventListener("lostpointercapture", () => {
      if (state.holding) stopRecording();
    });
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => e.preventDefault());
    btn.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!state.holding) beginRecording();
      }
    });
    btn.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (state.holding) stopRecording();
      }
    });
  }

  function bind() {
    $("btn-enter").addEventListener("click", () => {
      try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (_) {}
      showScreen("pick");
    });
    $("btn-pick-back").addEventListener("click", () => showScreen("landing"));
    $("btn-round-quit").addEventListener("click", () => {
      cleanupRound();
      showScreen("pick");
    });
    $("btn-speak").addEventListener("click", () => {
      if (!state.pan) return;
      speakKorean(state.pan.lines[state.variant % state.pan.lines.length]);
    });
    $("btn-submit-typed").addEventListener("click", submitTyped);
    $("btn-again").addEventListener("click", () => {
      state.streak += 1;
      state.variant = (state.variant + 1) % 3;
      state.timeLimit = Math.max(14, 20 - state.streak * 2);
      openRound();
    });
    $("btn-other").addEventListener("click", () => {
      cleanupRound();
      if (state.recUrl) {
        URL.revokeObjectURL(state.recUrl);
        state.recUrl = null;
      }
      showScreen("pick");
    });
    bindRecord();
  }

  renderBoard();
  bind();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.holding) stopRecording();
  });
})();
