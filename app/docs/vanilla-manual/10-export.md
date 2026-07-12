# 10 · Exporting to CSV

EliteGrid can download the grid's data as a CSV file. You set defaults in the `export` group and trigger the download with `api.exportCSV()`.

> **What is CSV?** CSV stands for **Comma-Separated Values** — the simplest, most universal way to store a table as plain text. Each row is one line, and the cells on that line are separated by commas:
>
> ```
> name,department,salary
> Ada Lovelace,Engineering,120000
> Alan Turing,Research,135000
> ```
>
> Every spreadsheet program (Excel, Google Sheets, Numbers) opens `.csv` files, which is why it's the go-to format for "download this table".

> **How the download works.** `api.exportCSV()` builds the CSV text in the browser, wraps it in a temporary file, and tells the browser to download it. Nothing is sent to a server — the file is generated entirely on the user's machine from the data already loaded in the grid.

---

## Default export options

```ts
const grid = createGrid<Employee>({
  columns,
  data,
  export: {
    filename: 'employees',   // file saved as employees.csv
    scope: 'filtered',       // which rows to include (see below)
  },
})
```

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `filename` | `string` | `'export'` | File name (without `.csv`) |
| `scope` | `'all' \| 'filtered' \| 'page' \| 'selected'` | `'filtered'` | Which rows to export |

### Scopes explained

The **scope** answers "which rows go in the file?" Pick based on what the user most likely expects from the button they clicked:

- **`all`** — every row, **ignoring** any filters. Use for a full backup/export.
- **`filtered`** — only rows that pass the current filters (the default). This matches "export what I'm looking at" when a filter is active.
- **`page`** — only the rows on the current page.
- **`selected`** — only the rows the user has ticked (see [Chapter 06](/docs/vanilla/selection)). Pair this with a checkbox column and an "Export selected" button.

---

## Triggering the export

Call `api.exportCSV()`. With no arguments it uses the defaults from the `export` group:

```ts
api.exportCSV()
```

Or override per-call:

```ts
api.exportCSV({
  filename: 'q1-report',
  scope: 'selected',
  columns: ['name', 'department', 'salary'], // only these columns
  includeHeader: true,                       // include the header row (default true)
  delimiter: ',',                            // change to ';' or '\t' if needed
})
```

| Option | Type | Meaning |
| --- | --- | --- |
| `filename` | `string` | Overrides the default filename |
| `scope` | `'all' \| 'filtered' \| 'page' \| 'selected'` | Overrides the default scope |
| `columns` | `string[]` | Only export these column fields, in this order |
| `includeHeader` | `boolean` | Include the header row (default `true`) |
| `delimiter` | `string` | Field separator (default `,`) |

> **`includeHeader`** controls whether the first line holds the column titles (`name,department,salary`). Leave it on unless you're appending to a file that already has headers.
>
> **`delimiter`** is the character placed *between* cells. The default comma is standard, but some locales (e.g. parts of Europe) use a semicolon `;` because the comma is their decimal separator. Use `'\t'` (a tab) for "TSV" files, which paste cleanly into spreadsheets.

---

## Formatting exported values

By default each cell exports using its `display.formatter`. If that produces spreadsheet-unfriendly text (like `$50,000`), give the column an `exportFormatter` for a clean value — see [Chapter 08](/docs/vanilla/formatting-values#exportformatter--a-different-format-for-csv).

```ts
{
  field: 'salary',
  header: 'Salary',
  display: {
    formatter: (v) => `$${Number(v).toLocaleString()}`, // screen: $50,000
    exportFormatter: (v) => String(v),                  // CSV: 50000
  },
}
```

---

## Example — an "Export selected" button

```ts
const exportBtn = document.querySelector<HTMLButtonElement>('#export-selected')!

exportBtn.addEventListener('click', () => {
  api.exportCSV({ filename: 'selected-employees', scope: 'selected' })
})
```

---

## Column order and hidden columns

Without a `columns` override, `exportCSV()` includes every **currently visible** column, in their current on-screen order — so if the user has reordered or hidden columns (see [Chapter 02](/docs/vanilla/columns)), the export matches what they see. Pass `columns` explicitly when you want the export to be independent of whatever the user has done to the layout:

```ts
// Always export these three fields, in this order, regardless of on-screen state
api.exportCSV({ columns: ['name', 'department', 'salary'] })
```

> To include a column that the user currently has **hidden**, you must list it explicitly in `columns` — hidden columns are skipped by default, the same as they're skipped on screen.

---

## Accented characters look wrong in Excel

If names or text with accents (`é`, `ü`, `ñ`…) show up as garbled symbols after opening the CSV in Excel on Windows, that's an Excel quirk, not a bug in your data: Excel sometimes guesses the wrong text encoding for a plain UTF-8 file. Opening the same file in Google Sheets or Numbers usually shows it correctly. If your users are mostly on Windows Excel, mention importing via **Data → From Text/CSV** and explicitly choosing UTF-8, rather than double-clicking the file.

---

## Common export mistakes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Exported numbers have `$` and commas baked in | No `exportFormatter`, so the `display.formatter` output (meant for the screen) was used | Add an `exportFormatter` that returns the plain value — see [Chapter 08](/docs/vanilla/formatting-values#exportformatter--a-different-format-for-csv) |
| CSV is empty | `scope: 'selected'` with nothing selected, or `scope: 'filtered'` with a filter that matches zero rows | Check `api.getSelectedIds().size` or `api.getFilterModel()` before exporting, and show a message instead of downloading an empty file |
| Export includes a column the user can't even see | `columns` wasn't passed, and a "hidden" column was actually just narrow/scrolled off, not truly hidden | Use `api.setColumnVisible()` (see [Chapter 02](/docs/vanilla/columns)) to actually hide columns you don't want exported by default |
| Values with commas break the CSV columns | Not a real issue — EliteGrid quotes any cell containing the delimiter, quotes, or newlines per the CSV spec | Nothing to fix; open the file in a spreadsheet app to confirm rather than a plain text editor, which won't show the quoting |

---

Next: [11 · Events](/docs/vanilla/events)
