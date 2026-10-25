/*
 * Portfolio projects. Add an object to this array to add a card.
 *
 * id       Unique slug. Used for the address hash (#id) and keyboard focus.
 * name     Card title.
 * summary  One line on the card. Keep it factual.
 * detail   Short paragraph in the detail panel. Do not invent features.
 * tags     Short tech labels that the repo actually uses.
 * repo     GitHub URL. Omit the key if there is no repository.
 * live     Live site URL. Omit the key if there is no public site.
 */
globalThis.PORTFOLIO_PROJECTS = [
  {
    id: "prompt-folio",
    name: "The Prompt Folio",
    summary:
      "A single page that writes still-image backgrounds and short animation prompts in full sentences.",
    detail:
      "Keywords are optional. Generate replaces one plate, earlier prompts stay in History, and starred lines sit in Favourites. The word banks live in one file, there is no build step, and a GitHub Actions workflow publishes the static page.",
    tags: ["HTML", "CSS", "JavaScript"],
    repo: "https://github.com/rimkahan888/mother-of-all-prompt",
    live: "https://rimkahan888.github.io/mother-of-all-prompt/",
  },
  {
    id: "sdlc",
    name: "SDLC",
    summary:
      "A cheatsheet and prompt builder for an AI-native software lifecycle, from plan through maintain.",
    detail:
      "The page walks six stages, from plan through maintain, and shows the document each stage needs. The prompt builder asks for a choice at each stage, then assembles one prompt. The interface is Vue and the API is ASP.NET Core on .NET 10.",
    tags: ["Vue", "TypeScript", "C#", ".NET 10"],
    repo: "https://github.com/rimkahan888/SDLC",
  },
  {
    id: "rat-race-escape",
    name: "Rat Race Escape",
    summary: "A personal-finance board game in a seven-day sprint.",
    detail:
      "You take a profession, collect a paycheck, pay the bills, and try to buy assets that pay you enough to leave the monthly track. The name, rules text, numbers, and art are original. .NET 10 holds the rules, Vue 3 is the client, and money is an integer count of cents. GitHub Actions builds and tests both sides. The sprint runs 25–31 October 2026.",
    tags: ["Vue", "TypeScript", "C#", ".NET 10"],
    repo: "https://github.com/rimkahan888/rat-race-escape",
  },
  {
    id: "ui-ux-pro-max",
    name: "UI UX Pro Max",
    summary: "Reference pages for styles, palettes, fonts, and a glossary.",
    detail:
      "Static HTML pages for the UI UX Pro Max design skill: style samples, palette samples, font samples, and a glossary. Open any page in a browser. They link to each other. There is no build step.",
    tags: ["HTML"],
    repo: "https://github.com/rimkahan888/skills",
    live: "https://rimkahan888.github.io/skills/ui-ux-pro-max/",
  },
];
