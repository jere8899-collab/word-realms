/* Realm special games: Petal Match (A1), Candy Counter Rush (A2), Fairy Lantern Quest (B1),
   Glimmerfin's Final Battle (B2), The Great Debate (C1), Riddle Duel (C2). */
(function () {
const WR = window.WR;
const mixFrom = async (rid, n) => {
  const per = await Promise.all(WR.SKILLS.map(k => WR.buildItems(rid, k.id, 4)));
  // take a couple from each skill (reading items keep their passage)
  const picked = per.flatMap(arr => WR.sample(arr, Math.ceil(n / 4)));
  return WR.shuffle(picked).slice(0, n);
};
WR.playSpecial = async rid => {
  const realm = WR.realms.find(r => r.id === rid), sp = realm.special;
  const replay = () => WR.playSpecial(rid);
  const base = { realm: rid, title: sp.name, key: "special", special: true, replay };
  switch (sp.type) {
    case "match": return petalMatch(realm);
    case "quest": return lanternQuest(realm);
    case "debate": return greatDebate(realm);
    case "candyrush": {
      const bank = await WR.bank(rid, "grammar");
      const items = WR.shuffle(bank.filter(q => q.type === "order")).map(q => WR.normalize(q));
      return WR.startLesson({ ...base, items, mode: "candy" });
    }
    case "bossmix": return WR.startLesson({ ...base, items: await mixFrom(rid, 10), mode: "boss" });
    case "riddleduel": return WR.startLesson({ ...base, items: await mixFrom(rid, 10), mode: "dragon" });
  }
};
function header(realm, title) {
  return `<div class="lesson-bg" style="background-image:${WR.bgCss(realm.bg)}"></div>
  <div class="row" style="margin:6px 0 8px"><button class="btn ghost small" id="quitBtn">← Leave</button><b class="title">${realm.special.emoji} ${WR.esc(title)}</b></div>`;
}
function finishSpecial(realm, score, stars, msg) {
  WR.recordLesson(realm.id, "special", score);
  WR.questEvent("special1"); WR.activityDone();
  const lv = WR.petGainXP(Math.round(score * 50) + 10);
  WR.addStars(stars);
  WR.view(`<div class="card result fade-in"><h1>${msg}</h1><div class="big">${"👑".repeat(WR.crowns(score))}</div>
    <h2>⭐ +${stars} stars</h2><div class="petbox bounce" style="margin:10px auto">${WR.petHTML()}</div>
    <div class="bubble">${lv ? `Level ${lv.level}! 🎉` : "That was magical! ✨"}</div>
    <div class="row" style="justify-content:center;margin-top:14px"><button class="btn" id="again">↻ Play again</button><button class="btn mint" id="back">Back to ${WR.esc(realm.name)}</button></div></div>`);
  WR.confetti(); WR.sfx("level");
  WR.$("#again").onclick = () => WR.playSpecial(realm.id);
  WR.$("#back").onclick = () => WR.go("realm", realm.id);
}
/* ---- A1 Petal Match: match picture cards to words ---- */
async function petalMatch(realm) {
  // 🎨 T16: painted word pictures (assets/words) instead of emoji; emoji only if fewer than 6 painted ones exist
  const all = (await WR.bank("a1", "vocab")).filter(q => q.pic && q.options), painted = all.filter(q => WR.asset("word_" + q.options[q.answer]));
  const vocab = painted.length >= 6 ? painted : all;
  const pairs = WR.sample(vocab, 6).map((q, i) => ({ id: i, pic: q.pic, word: q.options[q.answer], art: WR.asset("word_" + q.options[q.answer]) ? "word_" + q.options[q.answer] : null }));
  const cards = WR.shuffle(pairs.flatMap(p => [{ id: p.id, t: "emo", v: p.pic, art: p.art }, { id: p.id, t: "word", v: p.word }]));
  let sel = null, found = 0, tries = 0;
  WR.view(`${header(realm, "Petal Match")}<div class="card"><p class="muted" style="font-weight:800">Tap a picture, then its word. Say the word out loud! 🗣️</p>
    <div class="match-grid">${cards.map((c, k) => `<button class="mcard ${c.t === "emo" ? "emo" : ""}${c.art ? " painted" : ""}" data-k="${k}" ${c.art ? 'aria-label="Picture card"' : ""}>${c.art ? WR.img(c.art, "mart").replace(/alt="[^"]*"/, 'alt="picture"') : WR.esc(c.v)}</button>`).join("")}</div>
    <p class="center" id="mstat" style="font-weight:800">Pairs: 0 / 6</p></div>`);
  WR.$("#quitBtn").onclick = () => WR.go("realm", realm.id);
  document.querySelectorAll(".mcard").forEach(b => b.onclick = () => {
    const c = cards[+b.dataset.k];
    if (c.t === "word") Speech.speak(c.v, 0.85);
    if (!sel) { sel = { b, c }; b.classList.add("sel"); return; }
    if (sel.b === b) { b.classList.remove("sel"); sel = null; return; }
    tries++;
    if (sel.c.id === c.id && sel.c.t !== c.t) {
      [sel.b, b].forEach(x => { x.classList.remove("sel"); x.classList.add("done"); }); found++; WR.sfx("good");
      WR.$("#mstat").textContent = `Pairs: ${found} / 6 🌸`;
      if (found === 6) { const score = Math.max(0.3, Math.min(1, 6 / tries)); setTimeout(() => finishSpecial(realm, score, 4 + WR.crowns(score) * 2, "All petals matched! 🌸"), 500); }
    } else { [sel.b, b].forEach(x => { x.classList.remove("sel"); x.classList.add("no"); setTimeout(() => x.classList.remove("no"), 400); }); WR.sfx("bad"); }
    sel = null;
  });
}
/* ---- B1 Fairy Lantern Quest: branching story ---- */
async function lanternQuest(realm) {
  const Q = await WR.bank("b1", "quest");
  let good = 0, steps = 0;
  const show = (id, note) => {
    const n = Q.nodes[id];
    WR.view(`${header(realm, "The Fairy's Lost Lantern")}<div class="lesson"><div class="card qcard">
      ${note ? `<div class="explain ${note.good ? "good" : "bad"}">${note.good ? "✅" : "💭"} ${WR.esc(note.explain)}</div>` : ""}
      <p class="story">${WR.esc(n.text)}</p>
      <div class="opts" style="grid-template-columns:1fr">${n.choices.map((c, k) => `<button class="opt" data-k="${k}"><span class="k">${"AB"[k]}</span>${WR.esc(c.text)}</button>`).join("")}</div>
      ${n.choices.length ? "" : `<button class="btn mint" id="done">Collect your Forest Star ⭐</button>`}
      </div><div class="card side"><div class="petbox ${note ? (note.good ? "bounce" : "sad") : ""}">${WR.petHTML()}</div><div class="bubble">${note ? (note.good ? "Great choice! 💖" : "Hmm, let's fix that! 🍀") : "What should we say? 🤔"}</div></div></div>`);
    WR.$("#quitBtn").onclick = () => WR.go("realm", realm.id);
    document.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const c = n.choices[+b.dataset.k]; steps++; if (c.good) good++; WR.sfx(c.good ? "good" : "bad");
      if (c.good) { WR.state.stars += 1; WR.save(); WR.renderTop(); }
      show(c.next, c);
    });
    const d = WR.$("#done"); if (d) d.onclick = () => { const score = steps ? good / steps : 1; finishSpecial(realm, score, 5 + WR.crowns(score) * 2, "Quest complete! 🏮"); };
  };
  show(Q.start);
}
/* ---- C1 Great Debate: pick the strongest argument, spot fallacies ---- */
async function greatDebate(realm) {
  const D = WR.sample(await WR.bank("c1", "debate"), 5);
  let i = 0, meter = 50, good = 0;
  const show = () => {
    const d = D[i], opts = WR.shuffle(d.options.map((t, k) => ({ t, ok: k === d.answer })));
    WR.view(`${header(realm, "The Great Debate")}<div class="card hud"><span class="pill">Motion ${i + 1}/${D.length}</span><div class="meter"><b>Council vote</b><div class="meterbar"><span class="knob" style="left:${meter}%">⚖️</span></div></div></div>
      <div class="lesson"><div class="card qcard"><div class="passage"><b>📜 Motion:</b> ${WR.esc(d.motion)}</div><div class="qtext">${WR.esc(d.prompt)}</div>
      <div class="opts" style="grid-template-columns:1fr">${opts.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span>${WR.esc(o.t)}</button>`).join("")}</div><div id="explain"></div></div>
      <div class="card side"><div class="petbox" id="lpet">${WR.petHTML()}</div><div class="bubble" id="lbubble">Think like a judge! 🧐</div></div></div>`);
    WR.$("#quitBtn").onclick = () => WR.go("realm", realm.id);
    document.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const o = opts[+b.dataset.k];
      document.querySelectorAll(".opt").forEach(x => { x.disabled = true; if (opts[+x.dataset.k].ok) x.classList.add("right"); });
      if (!o.ok) b.classList.add("wrong");
      if (o.ok) { good++; meter = Math.min(100, meter + 12); WR.sfx("good"); } else { meter = Math.max(0, meter - 12); WR.sfx("bad"); }
      WR.$(".knob").style.left = meter + "%";
      WR.$("#lpet").classList.add(o.ok ? "cheer" : "sad"); WR.$("#lbubble").textContent = o.ok ? "The council nods! 👏" : "Hmm, the council frowns… 😟";
      WR.$("#explain").innerHTML = `<div class="explain ${o.ok ? "good" : "bad"}">💡 ${WR.esc(d.explain)}</div><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn" id="nextBtn">${i < D.length - 1 ? "Next motion →" : "Count the votes ✨"}</button></div>`;
      WR.$("#nextBtn").onclick = () => { if (++i < D.length) show(); else { const score = good / D.length; finishSpecial(realm, score, 4 + WR.crowns(score) * 3, meter > 50 ? "The Council votes with you! 🏰" : "The vote was lost… 🌧️"); } };
    });
  };
  show();
}
})();
