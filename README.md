# Gowtham Kumar — Interactive Flashlight Portfolio

Two portfolios in one site, switchable from the header:

- **Product** - the amber marketing page, opened by a flashlight intro.
- **Console** - a Git Bash-coloured developer terminal that types itself out,
  with a working command line and a portrait drawn as 0s and 1s.

A dark, discoverable developer portfolio. The visitor lands in near-darkness,
picks up a torch, explores the page with a beam that follows the pointer, finds
the **Turn On Lights** button in the header, and flips it to reveal the full
site.

Built with Next.js 16, React 19, Tailwind v4, shadcn/ui (Radix) and Motion.

## Getting started

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Where things live

```
src/
  app/
    layout.tsx              root layout + the pre-paint no-flash script
    page.tsx                composes the sections, wrapped in <Discoverable>
    blog/page.tsx           placeholder route so the Blog nav link is not dead
    api/g0/route.ts         the AI companion endpoint (the only dynamic route)
    globals.css             theme tokens for both the dark and lit palettes
  components/
    terminal/               the developer-console skin
      terminal-portfolio    nav, panes and footer for the console
      terminal-hero         whoami, ls projects/, the portrait
      terminal-panes        welcome, projects, skills tree, updates, closing
      binary-portrait       the portrait, drawn live as 0s and 1s on canvas
      portrait-stage        the portrait area and its margin notes, as rows
      command-line          a working shell: help, projects, open, exit
      typed                 the character-by-character typing effect
      skin-toggle           swaps between the two portfolios
      primitives            Prompt, Pane, Caret
    experience/             everything that exists only while the lights are off
      experience-provider   the state machine + discovery registry
      beam-canvas           the darkness, the beam, and the discovery scan
      intro-screen          "pick up the torch"
      lights-button         the switch, living in the header
      sound-toggle          mute control
      discoverable          wraps a section as a discovery zone
      torch-experience      composes the above; unmounts entirely once lit
    sections/
      site-header           brand, nav, and the lights button
      hero                  headline, stats, and the CSS workbench scene
      featured-work         the project rail
      built-with-ai         the AI statement, workflow and tech stack panels
      call-to-action        "Have a Project in Mind?"
      site-footer
    icons/                  brand and tech marks (lucide v1 has no logos)
    ui/                     shadcn components
  data/portfolio.ts         all copy and content - edit this first
  data/terminal.ts          console content: commands, tree, log lines
  lib/
    beam.ts                 beam geometry, kept outside React
    experience-store.ts     the mode, read from the DOM via useSyncExternalStore
    image-to-binary.ts      pixel analysis: portrait -> grid of 0s and 1s
    skin-store.ts           which portfolio is showing
    terminal-commands.ts    the command set, pure and DOM-free
    g0/knowledge.ts         what G0 is allowed to know
    g0/rate-limit.ts        pluggable limiter; in-memory or durable
    sound.ts                the two synthesised cues
    typing.ts               typing cadence, shared with server components
```

## Making it yours

1. **Content** — everything is in `src/data/portfolio.ts`. Name, headline,
   stats, projects, workflow, tech stack, CTA copy, social links.
2. **Project screenshots** — each project carries a `shots` array in
   `portfolio.ts`, and `work-collection.tsx` renders it as a scroll-snap
   carousel. The files live in `public/shots` and are all **1280x720 webp**;
   anything else works but will letterbox against its neighbours. A project
   with an empty `shots` array simply loses its carousel — no placeholder.
3. **The portraits** — one per skin. The lit hero renders
   `public/gowtham-v2.png`, which carries an alpha channel so there is no
   rectangle to hide. The console never displays a photo at all: it reads
   `public/gowtham-source.png` pixel by pixel and redraws it as digits, and
   because that one is shot against black, `BACKGROUND_CUTOFF` in
   `image-to-binary.ts` is what separates him from the backdrop. Swapping in a
   portrait on a lighter background means raising that cutoff or cutting the
   subject out first. Give any replacement a **new name** — Next's image
   optimizer caches by URL and will happily keep serving the old one.
4. **The hero scene** — `WorkbenchScene` in `hero.tsx` is built entirely in CSS
   (chalked wall, light cone, torch, desk). Swap the whole component for a
   `next/image` if you shoot the real photo.
5. **Colours** — the palettes are the `:root` and
   `html[data-mode="intro|torch|flipping"]` blocks in `globals.css`. Every
   shadcn component follows those tokens, so the whole surface cross-fades when
   the lights come on.
6. **The accent** — every colour in the lit palette is written against one
   number, `--hue`, so a theme is a single line: `html[data-accent="azure"] {
   --hue: 245 }`. Add one there, add it to `accents` in `lib/accent-store.ts`
   and to the whitelist in the pre-paint script in `layout.tsx`, and the picker
   in the header grows an entry. `?accent=emerald` forces one without touching
   storage, the way `?intro` forces the dark opening. **Rainbow** is the same
   number on a 24s keyframe — which is why `--hue` is a registered
   `@property`: an unregistered custom property is a string to the animation
   engine, and a string cannot be interpolated. It holds still under
   `prefers-reduced-motion`. None of this reaches the console skin, which
   overrides `--primary` with phosphor green outright.
7. **Tech logos** — `icons/tech.tsx` holds simplified marks. Drop in the real
   SVGs if you want exact brand logos.
8. **CV** — put `resume.pdf` in `public/`, or change `profile.resumeUrl`.

## How the effect works

**The beam is a canvas, not a CSS gradient.** Animating a full-screen
`radial-gradient` repaints the whole viewport every frame and drops frames on
large displays. Instead `beam-canvas.tsx` fills a flat colour and punches a hole
with `destination-out` compositing — one cheap operation per frame, with a soft
falloff for free. A second layer, moved with `transform` only, adds the warm
tint on the compositor.

**Pointer state never touches React.** `lib/beam.ts` is a plain mutable object.
The pointer handler and the rAF loop both write to it; React only hears about
discrete events, like a zone being discovered.

**Discovery is sticky and throttled.** Every six frames the loop measures the
distance from the beam to each registered zone's rect. Once found, a zone stays
found — re-hiding explored content is infuriating.

**The switch is the header button.** `Turn On Lights` registers itself as a
discovery zone, so it is the thing the beam has to find; once the lights are on
the same button becomes `Turn Off Lights` and replays the intro. One control,
one place.

**The sounds are synthesised, not sampled.** `lib/sound.ts` builds a torch
click and a switch snap out of filtered noise bursts and short pitched tones via
the Web Audio API — no audio files to fetch or license. Every hit is scheduled
on the audio clock, so the snap sits under the button animation and the "lights
flooding" swell under the screen flash. The `AudioContext` is created lazily
inside the click that plays the first sound, so autoplay policy never blocks it.

**The assembly cue is scored to the animation.** As the portrait's digits pull
into a face, 26 blips fire on a square curve so they crowd the start and thin
out - the same ease-out the particles actually move on - with their pitch
spread narrowing as they converge, a low tone gathering underneath, a noise bed
*closing* rather than opening, and a short terminal confirm on the settle.

Unlike the torch cues this runs on page load rather than on a click, so a
browser blocks it on a cold visit with no prior interaction - and once the
console skin is remembered, *every* reload is a cold visit. Arriving via the
Console button it plays immediately, because that click is the gesture. When it
is refused the cue reports back rather than failing silently, and the portrait
re-runs the entire assembly - picture and sound together - on the visitor's
first click or keypress. Playing the audio alone at that point would be a noise
with nothing attached to it.

**The console is a second palette, not a second stylesheet.** Every component
already reads the shadcn tokens, so `html[data-skin="terminal"]` in
`globals.css` repaints the whole surface and swaps the font to JetBrains Mono.

**It wears Git Bash's colours, and uses them to mean something.** The first
pass tinted every token green; the result read as a screenshot filter rather
than a shell. Now the body is grey on near-black and colour carries
information, the way an actual terminal does: `user@host` green, the path
yellow, project directories blue (that is what `ls` does), section headings
cyan, `Live` green against `In Progress` yellow, errors red, and a white block
cursor. The ANSI-ish palette lives as `--term-*` tokens on `:root` and is
exposed to Tailwind as `text-term-green` and friends.

The skin is chosen in the same pre-paint script as the lights, so a visitor who
picked the console last time never sees the product site flash first.

**The typing effect keeps the text real.** `typed.tsx` renders every character
up front and animates only its `opacity`. Nothing reflows, because each glyph
reserves its box from the first paint, and `h1.textContent` is exactly
"Gowtham Kumar" — an earlier version used a screen-reader-only twin alongside a
growing visible copy, which made the heading read "GowthamGowtham KumarKumar"
to anything that walks the DOM. `prefers-reduced-motion` fills every line in
immediately.

**The portrait is computed, and the photograph is never displayed.**
`public/gowtham-source.png` is a data source for the canvas, nothing more - no
`<img>` renders it. `image-to-binary.ts` draws it
once into a 92-column analysis canvas, reads the pixels back with
`getImageData`, converts each to perceived brightness
(`0.299R + 0.587G + 0.114B`) and emits `1` for dark cells and `0` for light
ones. `binary-portrait.tsx` then animates those ~5,600 glyphs.

**The cut-out is a flood fill, not a colour key.** The photo shipped on a solid
black backdrop. Keying out "everything dark" would have punched holes through
the hair and the suit, which measure 0.13-0.16 brightness against a backdrop
under 0.02 — close enough that no single threshold separates them. So the
cut-out floods inward from the frame's borders and only removes darkness
*connected to the edge*: 45% of pixels go, the corner ends up fully
transparent, and the suit and hair survive at full opacity. The mask is
box-blurred twice so the edge is feathered rather than stair-stepped.

That alpha channel is what separates subject from background: `image-to-binary`
tests `alpha < 30` rather than guessing at a brightness cutoff, and
`BACKGROUND_CUTOFF` drops to 0.02 as a guard against stray black instead of
being the main test. Nothing displays the photo, but without the cut-out the
figure would be a solid block of `1`s.

**`fillText` beats a glyph atlas.** Bucketing cells by opacity so `fillStyle`
is set ten times a frame instead of ~6,800 costs **6.1ms/frame**. Setting it
per glyph costs 17.5ms; pre-rendering the glyphs and blitting them with
`drawImage` — the obvious "faster" answer — costs 21.3ms.

**The portrait area is a single composition.** The figure fills the frame,
nudged left so the notes on the right sit over background rather than over his
arm, and its left edge is erased on a gradient - cropping him with a hard
vertical cut looked like a mistake, dissolving it reads as him emerging from
the dark. Falling columns of digits sit behind in their own smaller type, and a
wide glowing arc gives him a horizon to stand on.

**Hover sets it alight.** The glyphs themselves catch fire rather than a glow
being painted behind them - the field *is* the picture, so lighting it from
outside would read as a filter. An eight-stop ramp runs ember-red to pale
flame, hottest at the base and licking upward on two out-of-phase waves so it
wanders instead of pulsing. Hover also dims the `1`s - the dark half of the picture - so the face gains
definition instead of the whole field lifting together. Measured cool
`rgb(102,248,110)` uniformly; hovered,
`rgb(215,81,19)` at the top against `rgb(254,205,113)` at the bottom.

It is close to free. Buckets run one per (fire step x opacity level), so
`fillStyle` is set at most 80 times a frame instead of 6,800 - 16.6ms cool
versus 17.1ms alight.

The field starts as scattered noise and eases into the face over 1.5s, and
glyphs brighten within 170px of the pointer. `prefers-reduced-motion` skips
straight to the settled portrait with no wave.

**The command line actually works.** `terminal-commands.ts` holds the command
set as pure functions — each returns lines plus an intent (`navigate`, `open`,
`clear`, `leave`) and never touches the DOM, so `command-line.tsx` is the only
thing performing effects. `help`, `whoami`, `about`, `projects`, `skills`,
`contact`, `open <project>`, `resume`, `clear`, `exit`, plus shell-ish aliases
(`ls`, `cat`, `man`, `cv`). Arrow keys walk the history, Tab completes a command
name, Ctrl+L clears. The input's own text is transparent and a mirrored span is
painted instead, so the line ends in a solid block cursor rather than the
browser's thin one.

**The lights-on transition is a token swap.** `setMode("lit")` writes
`data-mode` on `<html>`; the custom properties are registered with `@property`
so they animate rather than cut. The beam expands to the viewport diagonal at
the same time and the overlay unmounts.

## G0, the AI companion

Ask it anything from the console: `ask why firebase`, or the `g0` alias. Answers
stream into the scrollback line by line. It is grounded in `lib/g0/knowledge.ts`,
which is generated from the same data the page renders, so the two cannot drift.

Set `OPENAI_API_KEY` to switch it on - see `.env.example`. Without it the
endpoint returns 503 and the rest of the portfolio is unaffected.

**The knowledge base is the bottleneck, not the code.** `projectNotes` is
stubbed and empty. Every field left blank is a question G0 has to decline, and
it is told to decline rather than guess - an invented claim about your
experience is far worse for you than "ask Gowtham". The `decisions` entries
matter most; they are what a technical visitor actually probes.

**Rate limiting refuses to pretend.** An in-memory limiter is close to useless
on serverless: Vercel may run each request in a fresh instance, and concurrent
instances each keep their own counter, so a `Map` that looks perfect locally
offers almost no protection over a spendable API key. The store is therefore
pluggable - in-memory (correct on a single long-lived Node process) or an
Upstash-compatible REST store - and when it detects a serverless platform
*without* a durable store it returns 503 instead of serving. Measured: ten
requests through, the eleventh 429s with a `retry-after`; per-IP buckets are
independent; a simulated Vercel deploy with no store refuses outright.

The endpoint also caps history to 8 turns, questions to 500 characters and
replies to 400 tokens, and only accepts `user`/`assistant` roles - a `system`
role in the payload is rejected rather than merged into the prompt.

`GET /api/g0` reports which limiter a deploy actually ended up with.

## Deliberate constraints

- **The intro is never a barrier.** Skip is always visible and always
  focusable, the choice is remembered in `localStorage`, and a returning
  visitor goes straight to the lit portfolio with no flash of darkness.
- **…but it is always reachable again.** `Turn Off Lights` in the header drops
  you back into the dark. `?intro` on the URL forces the opening even for a
  visitor who has already skipped it.
- **The torch is a home-page thing.** Any other route (`/blog`) loads lit.
- **The portfolio is fully rendered from the first byte.** The darkness is
  presentational; crawlers and screen readers see the complete page. With
  JavaScript off, the visitor simply gets the finished site.
- **Keyboard users skip automatically.** Tab or Escape exits the intro — a
  torch hunt is not a keyboard-accessible interaction.
- **`prefers-reduced-motion` skips the intro entirely,** decided before first
  paint.
- **Sound has a visible off switch** in both skins - next to Skip intro during
  the intro, and in the console header - and one mute governs all of it. Muted,
  no AudioContext is created at all.
- **Touch gets the torch, not the scroll.** While dragging, page scrolling is
  disabled and the beam auto-scrolls near the screen edges. The beam also sits
  ~70px above the finger so a hand doesn't cover what it reveals.

- **The console is navigable without typing.** Every command has an equivalent
  link or nav item; the command line is a bonus for people who enjoy it, never
  the only way to reach something.

## Not built

`/blog` is a placeholder with no post list. The reference design has no contact form — `Get In Touch` is a `mailto:`. The
earlier form, its Zod schema and its server action were removed with it;
`react-hook-form`, `zod` and `@hookform/resolvers` are still installed if you
want one back.
