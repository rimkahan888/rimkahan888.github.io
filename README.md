# Johan Karjadi

Personal portfolio, published with GitHub Pages from the root of `main`.

Live site: https://rimkahan888.github.io/

Plain HTML, CSS, and JavaScript. There is no build step.

## Edit the bio

In `index.html`, find the comment `EDIT BIO` and replace the paragraph under it. Keep it to one or two short sentences.

Leave out email, phone, a street address, LinkedIn, and any other contact. The only profile link on the page is GitHub: https://github.com/rimkahan888

## Add a project

Projects live in one array, `PORTFOLIO_PROJECTS`, in `js/projects.js`. Append an object:

```js
{
  id: "short-slug",
  name: "Project name",
  summary: "One factual line for the card.",
  detail: "A short paragraph for the detail panel. Only what the project actually does.",
  tags: ["Vue", "C#"],
  repo: "https://github.com/rimkahan888/example",
  live: "https://example.com/"
}
```

- `id` becomes the hash (`/#short-slug`) and must be unique.
- Omit `live` when there is no public site. Omit `repo` only if there is no repository.
- Tags should be technologies the repository actually uses.
- The card icon is chosen from `id` in `js/main.js` (`ICONS`). An unknown id gets a generic mark.

Reload the page. No build.

## What the page does

- Dark theme by default. The sun/moon control, or `T`, switches to light. The choice is stored in this browser.
- Cards sit in a bento grid: two columns from about 600px of content width, one column below that (including a narrow side panel around 540px).
- Click a card, or press Enter on it, to open the detail panel. On a wide window the panel is the right half. Under 600px it is a bottom sheet at half the height. `Esc` closes it.
- The Cards and Panel sliders change card scale and panel size. Both are remembered in `localStorage`.
- Double-click a card to copy its text. A tick flashes on the card and a small “Copied” toast appears. If the copy fails, a red toast says “Could not copy”.
- `J` / `K` or the arrow keys move between cards. `?` opens the shortcut list.

`localStorage` keys:

| Key | Values |
| --- | --- |
| `jk-theme` | `dark` or `light` |
| `jk-card-size` | `80`–`140` (percent) |
| `jk-panel-size` | `30`–`70` (percent of the page) |

## Preview locally

From this folder:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/

## Publish

Push to `main`. GitHub Pages serves this repository from the root of `main` at https://rimkahan888.github.io/
