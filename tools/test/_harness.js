// 🧪 Shared test harness: seed a starting save without the first-visit race.   const { seedSave } = require('./_harness');
// The race: page.goto() returns at the page's load event, but the game is still booting (WR.init fetches the data and the
// server clock). When boot finishes it calls WR.save() (tickPet / ensureDaily / a late clock answer) and writes its own
// fresh save over a save the test put in localStorage straight after goto. The reload then opens onboarding, not the map.
// seedSave() waits until the game has finished booting, stops that page from saving again, then writes the save and reloads.
const KEY = 'wordRealms.save.v1';
// the game has booted: WR is set up and a first screen (onboarding or the map) is drawn
const BOOTED = () => !!(window.WR && WR.state && WR.realms && document.querySelector('#nm, #n1, .realm-node, .topbar'));
const waitBooted = (page, timeout = 30000) => page.waitForFunction(BOOTED, null, { timeout });
// page: a Playwright page; url: the game page; save: the save object (null = start with no save);
// opts.clear: wipe all of localStorage first; opts.reload: options for page.reload (e.g. { waitUntil: 'networkidle' })
async function seedSave(page, url, save, opts = {}) {
  await page.goto(url);
  await waitBooted(page);
  await page.evaluate(([key, s, clear]) => {
    WR.save = () => { };                                     // this page is about to go: none of its late writes may land
    if (clear) localStorage.clear();
    if (s == null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(s));
  }, [KEY, save == null ? null : save, !!opts.clear]);
  await page.reload(opts.reload);
  if (save && save.name) {                                   // fail loudly if the seeded save did not stick
    await page.waitForFunction(n => window.WR && WR.state && WR.state.name === n, save.name, { timeout: 30000 })
      .catch(() => { throw new Error('seedSave: the seeded save for ' + save.name + ' was lost on reload'); });
  }
  return page;
}
module.exports = { KEY, seedSave, waitBooted };
