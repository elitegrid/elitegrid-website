import type { Demo } from './shell'

// People directory — the editing showcase.
//
// The least glamorous tile and probably the most persuasive: this is the
// screen most people are actually being paid to build. Everything here is
// the boring half of a grid done properly.
//
//   edit.type per column        text, dropdown, date, number, each with the
//                               right control rather than a text box
//   edit.validator              a rejected value that says why
//   grouping + aggregate        headcount and average salary per department
//   rowDetail.renderer          the full profile behind a row
//   rowNumbers                  an ordinal strip that is not a column
//
// Double-click any cell to edit it.

const CSS = `
  .person { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: grid; place-items: center;
    font-size: 0.6875rem; font-weight: 700; color: #fff;
  }
  .person-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
  .person-name { font-weight: 600; font-size: 0.8125rem; }
  .person-mail {
    font-size: 0.6875rem; color: var(--eg-muted-text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .chip {
    font-size: 0.6875rem; font-weight: 600;
    padding: 2px 9px; border-radius: 999px;
  }
  .chip-active   { color: #15803d; background: rgba(21,128,61,0.11); }
  .chip-remote   { color: #1d4ed8; background: rgba(29,78,216,0.11); }
  .chip-leave    { color: #b45309; background: rgba(180,83,9,0.11); }
  .chip-notice   { color: #be123c; background: rgba(190,18,60,0.11); }
  [data-theme='dark'] .chip-active { color: #4ade80; background: rgba(74,222,128,0.13); }
  [data-theme='dark'] .chip-remote { color: #60a5fa; background: rgba(96,165,250,0.13); }
  [data-theme='dark'] .chip-leave  { color: #fbbf24; background: rgba(251,191,36,0.13); }
  [data-theme='dark'] .chip-notice { color: #fb7185; background: rgba(251,113,133,0.13); }

  /* ── Profile panel ────────────────────────────────────────── */
  .profile {
    display: flex; gap: 22px; padding: 16px 20px;
    background: var(--eg-row-striped-bg);
  }
  .profile-main { flex: 1; min-width: 0; }
  .profile-name { font-size: 1rem; font-weight: 700; color: var(--eg-text); }
  .profile-role { font-size: 0.8125rem; color: var(--eg-muted-text); margin-bottom: 10px; }
  .profile-bio {
    font-size: 0.8125rem; line-height: 1.6; color: var(--eg-cell-text);
    max-width: 62ch;
  }
  .profile-facts {
    display: grid; grid-template-columns: auto auto; gap: 4px 16px;
    align-content: start;
  }
  .fact-k {
    font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--eg-muted-text); white-space: nowrap;
  }
  .fact-v {
    font-size: 0.75rem; color: var(--eg-cell-text);
    font-family: 'JetBrains Mono', monospace;
  }
  @media (max-width: 680px) { .profile { flex-direction: column; gap: 12px; } }
`

const SCRIPT = `
    const h = React.createElement

    const DEPTS = {
      Engineering: ['Software Engineer','Senior Engineer','Staff Engineer','Engineering Manager','QA Engineer','SRE'],
      Design: ['Product Designer','UX Researcher','Design Lead','Brand Designer'],
      Product: ['Product Manager','Senior PM','Director of Product'],
      Marketing: ['Content Strategist','Growth Marketer','Marketing Manager','SEO Specialist'],
      Sales: ['Account Executive','Sales Development Rep','Regional Sales Manager'],
      Finance: ['Financial Analyst','Accountant','Finance Manager'],
      People: ['Recruiter','People Partner','People Operations Lead'],
      Support: ['Support Specialist','Customer Success Manager','Support Lead'],
    }
    const BASE = {
      Engineering: 128000, Product: 134000, Design: 104000, Finance: 98000,
      Marketing: 88000, Sales: 94000, People: 84000, Support: 72000,
    }
    const HUE = {
      Engineering: 215, Design: 290, Product: 265, Marketing: 20,
      Sales: 160, Finance: 185, People: 330, Support: 45,
    }
    const LOCATIONS = ['San Francisco','New York','Austin','Seattle','Chicago',
                       'London','Berlin','Lisbon','Toronto','Bengaluru','Remote']
    const STATUSES = ['Active','Active','Active','Remote','On Leave','Notice']
    const FIRST = ['Amara','Mateo','Priya','Jonas','Leila','Hugo','Ines','Tomas','Zara','Felix',
                   'Noor','Diego','Astrid','Kwame','Yuki','Oscar','Sofia','Rafael','Hana','Lucas',
                   'Nadia','Emil','Clara','Idris','Maya','Viktor','Rania','Teo','Ingrid','Samir']
    const LAST = ['Okafor','Reyes','Nair','Lindqvist','Haddad','Moreau','Santos','Vargas','Ahmed','Brandt',
                  'Rahman','Castillo','Johansen','Mensah','Tanaka','Lindgren','Ferreira','Duarte','Kim','Oliveira',
                  'Benali','Novak','Weiss','Diallo','Kapoor','Petrov','Aziz','Markovic','Sorensen','Haider']

    let seed = 4242
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
    const pick = (a) => a[Math.floor(rnd() * a.length)]

    const deptNames = Object.keys(DEPTS)
    const people = []
    for (let i = 0; i < 240; i++) {
      const dept = deptNames[i % deptNames.length]
      const first = FIRST[Math.floor(rnd() * FIRST.length)]
      const last = LAST[Math.floor(rnd() * LAST.length)]
      const role = pick(DEPTS[dept])
      const year = 2015 + Math.floor(rnd() * 11)
      people.push({
        id: 'E' + String(1000 + i),
        name: first + ' ' + last,
        email: (first + '.' + last).toLowerCase() + '@elitegrid.dev',
        department: dept,
        role,
        location: pick(LOCATIONS),
        status: pick(STATUSES),
        salary: Math.round((BASE[dept] * (0.78 + rnd() * 0.62)) / 500) * 500,
        startDate: year + '-' +
                   String(1 + Math.floor(rnd() * 12)).padStart(2, '0') + '-' +
                   String(1 + Math.floor(rnd() * 28)).padStart(2, '0'),
        manager: pick(FIRST) + ' ' + pick(LAST),
        timezone: 'UTC' + (rnd() > 0.5 ? '+' : '-') + Math.floor(rnd() * 9),
      })
    }

    const money = (v) => '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })
    const initials = (name) => name.split(' ').map((p) => p[0]).join('').slice(0, 2)

    // ── Renderers ─────────────────────────────────────────────────
    const personCell = (_v, row) =>
      h('div', { className: 'person' },
        h('div', {
          className: 'avatar',
          style: { background: 'hsl(' + (HUE[row.department] ?? 220) + ' 58% 48%)' },
        }, initials(row.name)),
        h('div', { className: 'person-text' },
          h('span', { className: 'person-name' }, row.name),
          h('span', { className: 'person-mail' }, row.email),
        ),
      )

    const STATUS_CLASS = {
      'Active': 'chip-active', 'Remote': 'chip-remote',
      'On Leave': 'chip-leave', 'Notice': 'chip-notice',
    }
    const statusCell = (v) =>
      h('span', { className: 'chip ' + (STATUS_CLASS[v] ?? 'chip-active') }, String(v))

    const profilePanel = ({ row }) =>
      h('div', { className: 'profile' },
        h('div', { className: 'profile-main' },
          h('div', { className: 'profile-name' }, row.name),
          h('div', { className: 'profile-role' }, row.role + ' · ' + row.department),
          h('p', { className: 'profile-bio' },
            row.name.split(' ')[0] + ' joined in ' + row.startDate.slice(0, 4) +
            ' and works from ' + row.location + '. Reports to ' + row.manager +
            '. Every field on this row is editable — double-click a cell and the ' +
            'right control opens for its type.'),
        ),
        h('div', { className: 'profile-facts' },
          h('span', { className: 'fact-k' }, 'Employee ID'), h('span', { className: 'fact-v' }, row.id),
          h('span', { className: 'fact-k' }, 'Manager'),     h('span', { className: 'fact-v' }, row.manager),
          h('span', { className: 'fact-k' }, 'Timezone'),    h('span', { className: 'fact-v' }, row.timezone),
          h('span', { className: 'fact-k' }, 'Start date'),  h('span', { className: 'fact-v' }, row.startDate),
          h('span', { className: 'fact-k' }, 'Salary'),      h('span', { className: 'fact-v' }, money(row.salary)),
        ),
      )

    // ── Columns ───────────────────────────────────────────────────
    const columns = [
      { field: 'name', header: 'Employee',
        size: { width: 230 },
        display: { pinned: 'left', cellRenderer: personCell, tooltip: (_v, r) => r.email },
        filter: { type: 'text' },
        edit: {
          enabled: true, type: 'text',
          // A validator returns the REASON, not a boolean — the grid shows
          // the string, so the rejection explains itself.
          validator: (v) => {
            const s = String(v ?? '').trim()
            if (!s) return 'Name is required'
            if (!s.includes(' ')) return 'Enter a first and last name'
            return null
          },
        } },

      { field: 'department', header: 'Department',
        size: { width: 150 },
        filter: { type: 'set' },
        edit: { enabled: true, type: 'dropdown', options: deptNames } },

      { field: 'role', header: 'Role',
        size: { width: 190 },
        filter: { type: 'text' },
        edit: { enabled: true, type: 'text' } },

      { field: 'status', header: 'Status',
        size: { width: 118 },
        display: { cellRenderer: statusCell },
        filter: { type: 'set' },
        edit: { enabled: true, type: 'dropdown', options: ['Active','Remote','On Leave','Notice'] } },

      { field: 'location', header: 'Location',
        size: { width: 142 },
        filter: { type: 'set' },
        edit: { enabled: true, type: 'dropdown', options: LOCATIONS } },

      { field: 'salary', header: 'Salary',
        size: { width: 124 },
        display: { formatter: money, cellClass: 'num' },
        filter: { type: 'number' },
        // Averaged per department. Summing salaries across a group would be
        // a number nobody wants.
        value: { aggregate: 'avg' },
        edit: {
          enabled: true, type: 'number', min: 30000, max: 400000,
          parser: (raw) => Number(String(raw).replace(/[^0-9.]/g, '')),
          validator: (v) => (Number(v) < 30000 ? 'Below the minimum band' : null),
        } },

      { field: 'startDate', header: 'Start date',
        size: { width: 130 },
        filter: { type: 'date' },
        edit: { enabled: true, type: 'date' } },

      { field: 'manager', header: 'Manager',
        size: { width: 160 },
        filter: { type: 'text' },
        edit: { enabled: true, type: 'text' } },
    ]

    let api = null

    const grid = createGrid({
      modules: [AllModules],
      columns,
      data: people,
      rowId: 'id',
      sorting: { enabled: true, multiSort: true },
      filtering: {
        enabled: true, searchBar: true, floatingFilters: true,
        searchPlaceholder: 'Search people…',
      },
      editing: {
        enabled: true, trigger: 'doubleClick',
        confirmOnEnter: true, cancelOnEscape: true, moveOnTab: true,
      },
      grouping: {
        model: ['department'],
        expandedByDefault: 1,
        showCounts: true,
      },
      rowDetail: { renderer: profilePanel, estimatedHeight: 170 },
      rowNumbers: true,
      selection: { mode: 'multiple', showCheckboxes: true },
      appearance: { rowHeight: 46, headerHeight: 36, rowStriping: true },
      export: { filename: 'elitegrid-people', scope: 'filtered' },
      events: {
        onReady: (a) => { api = a; ready({ rowCount: people.length }) },
      },
    })

    createRoot(mountEl).render(h(Grid, { grid }))

    onMessage('EXPORT_CSV', () =>
      api && api.exportCSV({ filename: 'elitegrid-people', scope: 'filtered' }))
`

export const hr: Demo = {
  slug: 'hr-directory',
  css: CSS,
  script: SCRIPT,
}
