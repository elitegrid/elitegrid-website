'use client'

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import Editor, { loader } from '@monaco-editor/react'

// Pre-warm Monaco workers as soon as this module is imported (browser only).
// Next.js evaluates modules on the server too, so the typeof guard is required.
if (typeof window !== 'undefined') loader.init().catch(() => {})

// Cache built iframe HTML across navigations — srcDoc is expensive to
// rebuild and identical for the same origin+framework combination.
const _srcDocCache: Record<string, string> = {}

// ── EliteGrid TypeScript definitions ─────────────────────────────────────────
const ELITEGRID_TYPES = `
  type SortDirection = 'asc' | 'desc'

  export interface ColumnDef<TData = unknown> {
    field: string
    header: string
    size?: {
      width?: number
      minWidth?: number
      maxWidth?: number
      flex?: number
      resizable?: boolean
    }
    display?: {
      pinned?: 'left' | 'right' | null
      visible?: boolean
      cellClass?: string | ((value: unknown, row: TData) => string)
      headerClass?: string
      formatter?: (value: unknown, row: TData) => string
      exportFormatter?: (value: unknown, row: TData) => string
    }
    sort?: {
      enabled?: boolean
      defaultDirection?: SortDirection
      comparator?: (a: unknown, b: unknown) => number
      nullsFirst?: boolean
    }
    filter?: {
      enabled?: boolean
      type?: 'text' | 'number' | 'date' | 'boolean'
      customFilter?: (value: unknown, row: TData) => boolean
    }
    edit?: {
      enabled?: boolean | ((row: TData) => boolean)
      type?: 'text' | 'number' | 'dropdown' | 'date' | 'boolean'
      options?: string[]
      min?: number
      max?: number
      parser?: (value: string) => unknown
      validator?: (value: unknown, row: TData) => string | null | Promise<string | null>
    }
    value?: {
      getter?: (row: TData) => unknown
      setter?: (row: TData, value: unknown) => TData
    }
  }

  export interface GridAPI<TData = unknown> {
    setData(rows: TData[]): void
    getData(): TData[]
    getDisplayedRows(): TData[]
    refreshData(): Promise<void>
    addRow(row: TData, index?: number): void
    updateRow(id: string, changes: Partial<TData>): void
    deleteRow(id: string): void
    deleteRows(ids: string[]): void
    setColumnVisible(id: string, visible: boolean): void
    setColumnWidth(id: string, width: number): void
    setColumnPinned(id: string, position: 'left' | 'right' | null): void
    moveColumn(id: string, toIndex: number): void
    setSortModel(model: Array<{ columnId: string; direction: SortDirection }>): void
    getSortModel(): Array<{ columnId: string; direction: SortDirection }>
    clearSort(): void
    setFilterModel(model: Record<string, unknown>): void
    getFilterModel(): Record<string, unknown>
    setColumnFilter(columnId: string, filter: unknown): void
    clearColumnFilter(columnId: string): void
    clearFilters(): void
    selectRow(id: string): void
    deselectRow(id: string): void
    selectAll(): void
    deselectAll(): void
    getSelectedRows(): TData[]
    getSelectedIds(): Set<string>
    setPage(page: number): void
    setPageSize(size: number): void
    nextPage(): void
    previousPage(): void
    getPaginationState(): {
      currentPage: number; pageSize: number; totalRows: number
      totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean
    }
    exportCSV(options?: {
      filename?: string
      scope?: 'all' | 'filtered' | 'page' | 'selected'
      columns?: string[]
      includeHeader?: boolean
      delimiter?: string
    }): void
    destroy(): void
  }

  export interface GridOptions<TData = unknown> {
    columns: ColumnDef<TData>[]
    data?: TData[]
    rowId?: keyof TData | ((row: TData) => string)
    sorting?: { enabled?: boolean; multiSort?: boolean; multiSortKey?: 'shift' | 'ctrl' }
    filtering?: { enabled?: boolean; caseSensitive?: boolean; debounceMs?: number }
    pagination?: {
      enabled?: boolean; pageSize?: number; pageSizeOptions?: number[]
      showPageSizeSelector?: boolean; showRowCount?: boolean; showPageNumbers?: boolean
    }
    selection?: {
      mode?: 'none' | 'single' | 'multiple'
      selectAllScope?: 'page' | 'all'
      showCheckboxes?: boolean; selectOnRowClick?: boolean; checkboxOnly?: boolean
    }
    editing?: {
      enabled?: boolean; trigger?: 'click' | 'doubleClick'
      confirmOnEnter?: boolean; cancelOnEscape?: boolean; moveOnTab?: boolean
    }
    appearance?: {
      theme?: 'light' | 'dark' | 'auto'; density?: 'compact' | 'normal' | 'comfortable'
      rowHeight?: number; headerHeight?: number; rowStriping?: boolean
      showColumnBorders?: boolean; showHoverHighlight?: boolean
      className?: string; style?: { [key: string]: any }
    }
    scroll?: { bufferSize?: number }
    export?: { filename?: string; scope?: 'all' | 'filtered' | 'page' | 'selected' }
    events?: {
      onReady?: (api: GridAPI<TData>) => void
      onRowClick?: (row: TData, event: MouseEvent) => void
      onRowDoubleClick?: (row: TData, event: MouseEvent) => void
      onEditStart?: (rowId: string, field: string) => void
      onEditCommit?: (rowId: string, field: string, value: unknown) => void
      onEditCancel?: (rowId: string, field: string) => void
      onSortChange?: (model: Array<{ columnId: string; direction: SortDirection }>) => void
      onFilterChange?: (model: Record<string, unknown>) => void
      onSelectionChange?: (rows: TData[]) => void
      onPageChange?: (page: number, pageSize: number) => void
      onColumnResize?: (columnId: string, width: number) => void
      onColumnReorder?: (columnIds: string[]) => void
      onRowAdd?: (row: TData) => void
      onRowUpdate?: (id: string, changes: Partial<TData>) => void
      onRowDelete?: (id: string) => void
    }
  }

  export interface GridInstance<TData = unknown> {
    readonly options: GridOptions<TData>
    updateEvents(events: GridOptions<TData>['events']): void
  }

  export function createGrid<TData = unknown>(options: GridOptions<TData>): GridInstance<TData>
  export function useCreateGrid<TData = unknown>(options: GridOptions<TData>): GridInstance<TData>
  export function Grid<TData = unknown>(props: {
    grid: GridInstance<TData>
    style?: { [key: string]: any }
    className?: string
  }): any
`

// ── Types ─────────────────────────────────────────────────────────────────────
type Framework = 'react' | 'vue'
type ExampleKey = 'performance' | 'api' | 'editable' | 'export'

interface ExampleDef {
  label: string
  badge: string
  desc: string
  filename: string
  code: string
}

// ── React examples ────────────────────────────────────────────────────────────
const REACT_EXAMPLES: Record<ExampleKey, ExampleDef> = {
  performance: {
    label: 'Virtual Scroll',
    badge: '10K rows',
    desc: '10,000 rows rendered with virtual scrolling — buttery smooth at 60fps',
    filename: 'Performance.tsx',
    code: `import { createGrid, Grid } from '@elitegrid/react'

const DEPTS     = ['Engineering','Design','Marketing','HR','Sales','Finance']
const LOCATIONS = ['New York','London','Berlin','Tokyo','Sydney','Toronto']
const NAMES     = ['Alice','Bob','Carol','David','Eva','Frank','Grace','Henry',
                   'Isabel','Jack','Karen','Leo','Mia','Nate','Olivia','Pete']

const grid = createGrid({
  columns: [
    { field: 'id',       header: 'ID',         size: { width: 70 } },
    { field: 'name',     header: 'Name',       size: { flex: 2, minWidth: 140 },
      filter: { type: 'text' } },
    { field: 'dept',     header: 'Department', size: { flex: 1, minWidth: 120 },
      filter: { type: 'text' } },
    { field: 'salary',   header: 'Salary',     size: { flex: 1, minWidth: 110 },
      filter: { type: 'number' },
      display: { formatter: v => '$' + Number(v).toLocaleString() } },
    { field: 'location', header: 'Location',   size: { flex: 1, minWidth: 110 },
      filter: { type: 'text' } },
    { field: 'status',   header: 'Status',     size: { width: 90 },
      display: { formatter: v => v ? 'Active' : 'Inactive' } },
  ],
  data: Array.from({ length: 10000 }, (_, i) => ({
    id:       i + 1,
    name:     NAMES[i % NAMES.length] + ' ' + (Math.floor(i / NAMES.length) + 1),
    dept:     DEPTS[i % DEPTS.length],
    salary:   50000 + ((i * 317) % 100000),
    location: LOCATIONS[i % LOCATIONS.length],
    status:   i % 7 !== 0,
  })),
  sorting:    { enabled: true, multiSort: true },
  filtering:  { enabled: true },
  pagination: { enabled: true, pageSize: 100, pageSizeOptions: [50, 100, 200, 500] },
  selection:  { mode: 'multiple', showCheckboxes: true },
  appearance: { rowHeight: 36, headerHeight: 44, rowStriping: true },
})

export default function App() {
  return <Grid grid={grid} style={{ height: '100%' }} />
}`,
  },
  api: {
    label: 'Real API',
    badge: 'Live fetch',
    desc: 'Fetch from a real API — sort, filter and paginate live data instantly',
    filename: 'RealAPI.tsx',
    code: `import { createGrid, Grid } from '@elitegrid/react'

const grid = createGrid({
  columns: [
    { field: 'id',      header: 'ID',      size: { width: 60 } },
    { field: 'name',    header: 'Name',    size: { flex: 2, minWidth: 140 },
      filter: { type: 'text' } },
    { field: 'email',   header: 'Email',   size: { flex: 2, minWidth: 160 },
      filter: { type: 'text' } },
    { field: 'phone',   header: 'Phone',   size: { flex: 1, minWidth: 120 } },
    { field: 'company', header: 'Company', size: { flex: 1, minWidth: 120 },
      filter: { type: 'text' } },
    { field: 'city',    header: 'City',    size: { flex: 1, minWidth: 100 },
      filter: { type: 'text' } },
  ],
  data: [],
  sorting:    { enabled: true, multiSort: true },
  filtering:  { enabled: true },
  pagination: { enabled: true, pageSize: 10 },
  appearance: { rowHeight: 36, headerHeight: 44, rowStriping: true },
  events: {
    onReady: (api) => {
      fetch('https://jsonplaceholder.typicode.com/users')
        .then(r => r.json())
        .then(users => api.setData(users.map((u: any) => ({
          id:      u.id,
          name:    u.name,
          email:   u.email,
          phone:   u.phone,
          company: u.company.name,
          city:    u.address.city,
        }))))
    },
  },
})

export default function App() {
  return <Grid grid={grid} style={{ height: '100%' }} />
}`,
  },
  editable: {
    label: 'Inline Edit',
    badge: 'Validated',
    desc: 'Double-click any cell to edit — type-safe validators, dropdowns, Tab/Enter nav',
    filename: 'Editable.tsx',
    code: `import { createGrid, Grid } from '@elitegrid/react'

const grid = createGrid({
  columns: [
    { field: 'name',   header: 'Name',       size: { flex: 2 },
      edit: { enabled: true, type: 'text',
              validator: v => (!v || !String(v).trim()) ? 'Name is required' : null } },
    { field: 'dept',   header: 'Department', size: { flex: 1 },
      edit: { enabled: true, type: 'dropdown',
              options: ['Engineering','Design','Marketing','HR','Finance'] } },
    { field: 'role',   header: 'Role',       size: { flex: 1 },
      edit: { enabled: true, type: 'dropdown',
              options: ['Engineer','Designer','Manager','Lead','Director'] } },
    { field: 'salary', header: 'Salary',     size: { flex: 1 },
      display: { formatter: v => '$' + Number(v).toLocaleString() },
      edit: { enabled: true, type: 'number', min: 0, max: 1000000,
              parser: raw => Number(raw),
              validator: v => Number(v) < 30000 ? 'Min salary is $30,000' : null } },
    { field: 'active', header: 'Active',     size: { width: 80 },
      display: { formatter: v => v ? 'Yes' : 'No' },
      edit: { enabled: true, type: 'boolean' } },
  ],
  data: Array.from({ length: 20 }, (_, i) => ({
    id:     i + 1,
    name:   'Employee ' + (i + 1),
    dept:   ['Engineering','Design','Marketing','HR'][i % 4],
    role:   ['Engineer','Designer','Manager','Lead'][i % 4],
    salary: 70000 + i * 2500,
    active: i % 3 !== 0,
  })),
  editing:    { enabled: true, trigger: 'doubleClick',
                confirmOnEnter: true, cancelOnEscape: true, moveOnTab: true },
  sorting:    { enabled: true },
  pagination: { enabled: true, pageSize: 20 },
  appearance: { rowHeight: 40, headerHeight: 44, rowStriping: true },
  events: {
    onEditCommit: (rowId, field, value) =>
      console.log('Saved:', { rowId, field, value }),
  },
})

export default function App() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
                  gap: 8, padding: 8, boxSizing: 'border-box' }}>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#52525b', fontFamily: 'system-ui' }}>
        Double-click any cell to edit · Tab moves · Enter saves · Esc cancels
      </p>
      <Grid grid={grid} style={{ flex: 1 }} />
    </div>
  )
}`,
  },
  export: {
    label: 'CSV Export',
    badge: 'Multi-scope',
    desc: 'Export all, filtered, or selected rows — with separate export formatters',
    filename: 'Export.tsx',
    code: `import { createGrid, Grid } from '@elitegrid/react'

let api: any = null

const grid = createGrid({
  columns: [
    { field: 'id',     header: 'ID',         size: { width: 60 } },
    { field: 'name',   header: 'Name',       size: { flex: 2 }, filter: { type: 'text' } },
    { field: 'role',   header: 'Role',       size: { flex: 1 }, filter: { type: 'text' } },
    { field: 'salary', header: 'Salary',     size: { flex: 1 }, filter: { type: 'number' },
      display: {
        formatter:       v => '$' + Number(v).toLocaleString(),
        exportFormatter: v => String(v),
      } },
    { field: 'dept',   header: 'Department', size: { flex: 1 }, filter: { type: 'text' } },
  ],
  data: Array.from({ length: 100 }, (_, i) => ({
    id:     i + 1,
    name:   'Employee ' + (i + 1),
    role:   ['Engineer','Designer','PM','QA'][i % 4],
    salary: 65000 + i * 500,
    dept:   ['Engineering','Design','Marketing','HR'][i % 4],
  })),
  sorting:    { enabled: true },
  filtering:  { enabled: true },
  selection:  { mode: 'multiple', showCheckboxes: true },
  pagination: { enabled: true, pageSize: 25 },
  appearance: { rowHeight: 36, headerHeight: 44, rowStriping: true },
  events: { onReady: (a) => { api = a } },
})

const Btn = ({ label, onClick, primary = false }: any) => (
  <button onClick={onClick} style={{
    padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, fontFamily: 'system-ui',
    background: primary ? '#e8ff47' : 'rgba(255,255,255,0.07)',
    color:      primary ? '#09090b' : '#a1a1aa',
  }}>{label}</button>
)

export default function App() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
                  gap: 8, padding: 8, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Btn label="Export All"      primary onClick={() => api?.exportCSV({ scope: 'all',      filename: 'all-employees'      })} />
        <Btn label="Export Filtered"         onClick={() => api?.exportCSV({ scope: 'filtered', filename: 'filtered-employees' })} />
        <Btn label="Export Selected"         onClick={() => api?.exportCSV({ scope: 'selected', filename: 'selected-rows'      })} />
      </div>
      <Grid grid={grid} style={{ flex: 1 }} />
    </div>
  )
}`,
  },
}

// ── Vue examples — defineComponent + h() (no SFC compiler needed) ─────────────
const VUE_EXAMPLES: Record<ExampleKey, ExampleDef> = {
  performance: {
    label: 'Virtual Scroll',
    badge: '10K rows',
    desc: 'Identical config, Vue 3 render function — 10,000 rows, same 60fps performance',
    filename: 'Performance.ts',
    code: `import { defineComponent, h } from 'vue'
import { createGrid, Grid } from '@elitegrid/vue'

const DEPTS     = ['Engineering','Design','Marketing','HR','Sales','Finance']
const LOCATIONS = ['New York','London','Berlin','Tokyo','Sydney','Toronto']
const NAMES     = ['Alice','Bob','Carol','David','Eva','Frank','Grace','Henry',
                   'Isabel','Jack','Karen','Leo','Mia','Nate','Olivia','Pete']

const grid = createGrid({
  columns: [
    { field: 'id',       header: 'ID',         size: { width: 70 } },
    { field: 'name',     header: 'Name',       size: { flex: 2, minWidth: 140 },
      filter: { type: 'text' } },
    { field: 'dept',     header: 'Department', size: { flex: 1, minWidth: 120 },
      filter: { type: 'text' } },
    { field: 'salary',   header: 'Salary',     size: { flex: 1, minWidth: 110 },
      filter: { type: 'number' },
      display: { formatter: (v) => '$' + Number(v).toLocaleString() } },
    { field: 'location', header: 'Location',   size: { flex: 1, minWidth: 110 },
      filter: { type: 'text' } },
    { field: 'status',   header: 'Status',     size: { width: 90 },
      display: { formatter: (v) => (v ? 'Active' : 'Inactive') } },
  ],
  data: Array.from({ length: 10000 }, (_, i) => ({
    id:       i + 1,
    name:     NAMES[i % NAMES.length] + ' ' + (Math.floor(i / NAMES.length) + 1),
    dept:     DEPTS[i % DEPTS.length],
    salary:   50000 + ((i * 317) % 100000),
    location: LOCATIONS[i % LOCATIONS.length],
    status:   i % 7 !== 0,
  })),
  sorting:    { enabled: true, multiSort: true },
  filtering:  { enabled: true },
  pagination: { enabled: true, pageSize: 100, pageSizeOptions: [50, 100, 200, 500] },
  selection:  { mode: 'multiple', showCheckboxes: true },
  appearance: { rowHeight: 36, headerHeight: 44, rowStriping: true },
})

export default defineComponent({
  setup() {
    return () => h(Grid, { grid, style: { height: '100%' } })
  },
})`,
  },
  api: {
    label: 'Real API',
    badge: 'Live fetch',
    desc: 'Fetch live API data in Vue 3 — same grouped config, same onReady callback',
    filename: 'RealAPI.ts',
    code: `import { defineComponent, h } from 'vue'
import { createGrid, Grid } from '@elitegrid/vue'

const grid = createGrid({
  columns: [
    { field: 'id',      header: 'ID',      size: { width: 60 } },
    { field: 'name',    header: 'Name',    size: { flex: 2, minWidth: 140 },
      filter: { type: 'text' } },
    { field: 'email',   header: 'Email',   size: { flex: 2, minWidth: 160 },
      filter: { type: 'text' } },
    { field: 'phone',   header: 'Phone',   size: { flex: 1 } },
    { field: 'company', header: 'Company', size: { flex: 1 },
      filter: { type: 'text' } },
    { field: 'city',    header: 'City',    size: { flex: 1 },
      filter: { type: 'text' } },
  ],
  data: [],
  sorting:    { enabled: true, multiSort: true },
  filtering:  { enabled: true },
  pagination: { enabled: true, pageSize: 10 },
  appearance: { rowHeight: 36, headerHeight: 44, rowStriping: true },
  events: {
    onReady: (api) => {
      fetch('https://jsonplaceholder.typicode.com/users')
        .then((r) => r.json())
        .then((users) => api.setData(users.map((u: any) => ({
          id:      u.id,
          name:    u.name,
          email:   u.email,
          phone:   u.phone,
          company: u.company.name,
          city:    u.address.city,
        }))))
    },
  },
})

export default defineComponent({
  setup() {
    return () => h(Grid, { grid, style: { height: '100%' } })
  },
})`,
  },
  editable: {
    label: 'Inline Edit',
    badge: 'Validated',
    desc: 'Same type-safe inline editing in Vue 3 — identical validators and dropdown config',
    filename: 'Editable.ts',
    code: `import { defineComponent, h } from 'vue'
import { createGrid, Grid } from '@elitegrid/vue'

const grid = createGrid({
  columns: [
    { field: 'name',   header: 'Name',       size: { flex: 2 },
      edit: { enabled: true, type: 'text',
              validator: (v) => (!v || !String(v).trim()) ? 'Name is required' : null } },
    { field: 'dept',   header: 'Department', size: { flex: 1 },
      edit: { enabled: true, type: 'dropdown',
              options: ['Engineering','Design','Marketing','HR','Finance'] } },
    { field: 'role',   header: 'Role',       size: { flex: 1 },
      edit: { enabled: true, type: 'dropdown',
              options: ['Engineer','Designer','Manager','Lead','Director'] } },
    { field: 'salary', header: 'Salary',     size: { flex: 1 },
      display: { formatter: (v) => '$' + Number(v).toLocaleString() },
      edit: { enabled: true, type: 'number', min: 0, max: 1000000,
              parser: (raw) => Number(raw),
              validator: (v) => Number(v) < 30000 ? 'Min salary is $30,000' : null } },
    { field: 'active', header: 'Active',     size: { width: 80 },
      display: { formatter: (v) => (v ? 'Yes' : 'No') },
      edit: { enabled: true, type: 'boolean' } },
  ],
  data: Array.from({ length: 20 }, (_, i) => ({
    id:     i + 1,
    name:   'Employee ' + (i + 1),
    dept:   ['Engineering','Design','Marketing','HR'][i % 4],
    role:   ['Engineer','Designer','Manager','Lead'][i % 4],
    salary: 70000 + i * 2500,
    active: i % 3 !== 0,
  })),
  editing:    { enabled: true, trigger: 'doubleClick',
                confirmOnEnter: true, cancelOnEscape: true, moveOnTab: true },
  sorting:    { enabled: true },
  pagination: { enabled: true, pageSize: 20 },
  appearance: { rowHeight: 40, headerHeight: 44, rowStriping: true },
  events: {
    onEditCommit: (rowId, field, value) =>
      console.log('Saved:', { rowId, field, value }),
  },
})

export default defineComponent({
  setup() {
    return () => h('div', {
      style: { height: '100%', display: 'flex', flexDirection: 'column',
               gap: '8px', padding: '8px', boxSizing: 'border-box' },
    }, [
      h('p', { style: { margin: 0, fontSize: '0.8rem', color: '#52525b', fontFamily: 'system-ui' } },
        'Double-click any cell to edit · Tab moves · Enter saves · Esc cancels'),
      h(Grid, { grid, style: { flex: '1' } }),
    ])
  },
})`,
  },
  export: {
    label: 'CSV Export',
    badge: 'Multi-scope',
    desc: 'Export all, filtered, or selected rows from a Vue 3 component via the Grid API',
    filename: 'Export.ts',
    code: `import { defineComponent, h } from 'vue'
import { createGrid, Grid } from '@elitegrid/vue'

let api: any = null

const grid = createGrid({
  columns: [
    { field: 'id',     header: 'ID',         size: { width: 60 } },
    { field: 'name',   header: 'Name',       size: { flex: 2 }, filter: { type: 'text' } },
    { field: 'role',   header: 'Role',       size: { flex: 1 }, filter: { type: 'text' } },
    { field: 'salary', header: 'Salary',     size: { flex: 1 }, filter: { type: 'number' },
      display: {
        formatter:       (v) => '$' + Number(v).toLocaleString(),
        exportFormatter: (v) => String(v),
      } },
    { field: 'dept',   header: 'Department', size: { flex: 1 }, filter: { type: 'text' } },
  ],
  data: Array.from({ length: 100 }, (_, i) => ({
    id:     i + 1,
    name:   'Employee ' + (i + 1),
    role:   ['Engineer','Designer','PM','QA'][i % 4],
    salary: 65000 + i * 500,
    dept:   ['Engineering','Design','Marketing','HR'][i % 4],
  })),
  sorting:    { enabled: true },
  filtering:  { enabled: true },
  selection:  { mode: 'multiple', showCheckboxes: true },
  pagination: { enabled: true, pageSize: 25 },
  appearance: { rowHeight: 36, headerHeight: 44, rowStriping: true },
  events: { onReady: (a) => { api = a } },
})

const btn = (label: string, primary: boolean, onClick: () => void) =>
  h('button', {
    onClick,
    style: {
      padding: '7px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
      fontSize: '0.8rem', fontWeight: '600', fontFamily: 'system-ui',
      background: primary ? '#e8ff47' : 'rgba(255,255,255,0.07)',
      color:      primary ? '#09090b' : '#a1a1aa',
    },
  }, label)

export default defineComponent({
  setup() {
    return () => h('div', {
      style: { height: '100%', display: 'flex', flexDirection: 'column',
               gap: '8px', padding: '8px', boxSizing: 'border-box' },
    }, [
      h('div', { style: { display: 'flex', gap: '8px', flexShrink: '0' } }, [
        btn('Export All',      true,  () => api?.exportCSV({ scope: 'all',      filename: 'all-employees'      })),
        btn('Export Filtered', false, () => api?.exportCSV({ scope: 'filtered', filename: 'filtered-employees' })),
        btn('Export Selected', false, () => api?.exportCSV({ scope: 'selected', filename: 'selected-rows'      })),
      ]),
      h(Grid, { grid, style: { flex: '1' } }),
    ])
  },
})`,
  },
}


// ── Shared iframe CSS (used in both React and Vue sandboxes) ─────────────────
const IFRAME_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: #09090b;
    color: #e4e4e7;
  }
  :root, body {
    --eg-primary: #e8ff47; --eg-primary-text: #09090b;
    --eg-primary-light: rgba(232,255,71,0.08); --eg-primary-hover: #d4eb3a;
    --eg-error: #f87171; --eg-error-text: #09090b;
    --eg-error-bg: rgba(248,113,113,0.08); --eg-surface: #111113;
    --eg-overlay-bg: rgba(9,9,11,0.97); --eg-header-bg: #0d0d0f;
    --eg-header-text: #52525b; --eg-header-border: 1px solid rgba(255,255,255,0.06);
    --eg-header-active-bg: #18181b; --eg-row-bg: #09090b;
    --eg-row-striped-bg: #0f0f11; --eg-row-border: 1px solid rgba(255,255,255,0.04);
    --eg-row-hover-bg: rgba(232,255,71,0.045);
    --eg-row-selected-bg: rgba(232,255,71,0.08);
    --eg-row-selected-border: 1px solid rgba(232,255,71,0.22);
    --eg-row-selected-outline: transparent; --eg-cell-text: #d4d4d8;
    --eg-cell-border: 1px solid rgba(255,255,255,0.04); --eg-text: #e4e4e7;
    --eg-muted-text: #52525b; --eg-border: rgba(255,255,255,0.07);
    --eg-border-hover: rgba(232,255,71,0.28); --eg-sort-active-color: #e8ff47;
    --eg-sort-icon-color: #3f3f46; --eg-btn-bg: rgba(232,255,71,0.08);
    --eg-btn-text: #e8ff47; --eg-skeleton-base: #18181b;
    --eg-skeleton-highlight: #27272a; --eg-empty-icon-bg: #18181b;
  }
  .yg-header { font-size:.6875rem!important; font-weight:600!important;
    letter-spacing:.09em!important; text-transform:uppercase!important; color:#3f3f46!important; }
  .yg-header-cell--sortable:hover { background:#18181b!important; }
  .yg-header-cell--sorted { color:#e8ff47!important; }
  .yg-row { transition:background .1s ease; font-size:.875rem!important; }
  .yg-cell { font-size:.875rem!important; color:#d4d4d8!important;
    font-family:'Inter',system-ui,sans-serif!important; letter-spacing:-.01em; }
  .yg-pagination { font-size:.8125rem!important;
    border-top:1px solid rgba(255,255,255,.05)!important;
    background:#0a0a0c!important; padding:0 16px!important; color:#3f3f46!important; }
  .yg-row[aria-selected="true"] { background:rgba(232,255,71,.07)!important; }
  .yg-cell:focus { outline:2px solid rgba(232,255,71,.3)!important; outline-offset:-2px; }
  .yg-sort-indicator { opacity:.25; transition:opacity .15s; }
  .yg-header-cell--sorted .yg-sort-indicator { opacity:1!important; color:#e8ff47!important; }
  .yg-header-cell--filtered svg { color:#e8ff47!important; }
  .yg-resize-handle:hover>div { background:rgba(232,255,71,.3)!important; }
  input[type="checkbox"] { accent-color:#e8ff47; width:14px!important; height:14px!important; cursor:pointer; }
  .yg-pagination select {
    appearance: none; -webkit-appearance: none;
    height: 28px !important; padding: 0 26px 0 10px !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 6px !important;
    background-color: rgba(255,255,255,0.05) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23e8ff47' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 8px center !important;
    color: #a1a1aa !important;
    font-size: 0.8rem !important;
    font-family: inherit !important;
    cursor: pointer !important;
    outline: none !important;
    transition: border-color 0.15s, background-color 0.15s;
  }
  .yg-pagination select:hover {
    border-color: rgba(232,255,71,0.3) !important;
    background-color: rgba(232,255,71,0.06) !important;
    color: #e8ff47 !important;
  }
  .yg-pagination select:focus {
    border-color: rgba(232,255,71,0.4) !important;
    box-shadow: 0 0 0 2px rgba(232,255,71,0.1) !important;
  }
  .yg-pagination select option { background: #18181b; color: #e4e4e7; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(232,255,71,.15); border-radius:999px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(232,255,71,.35); }
  ::-webkit-scrollbar-corner { background:transparent; }
`

const ROOT_STYLE = `height:100%;display:flex;flex-direction:column;
  --eg-primary:#e8ff47; --eg-primary-text:#09090b; --eg-primary-light:rgba(232,255,71,0.08);
  --eg-primary-hover:#d4eb3a; --eg-error:#f87171; --eg-error-text:#09090b;
  --eg-error-bg:rgba(248,113,113,0.08); --eg-surface:#111113;
  --eg-overlay-bg:rgba(9,9,11,0.97); --eg-header-bg:#0d0d0f; --eg-header-text:#52525b;
  --eg-header-border:1px solid rgba(255,255,255,0.06); --eg-header-active-bg:#18181b;
  --eg-row-bg:#09090b; --eg-row-striped-bg:#0f0f11;
  --eg-row-border:1px solid rgba(255,255,255,0.04);
  --eg-row-hover-bg:rgba(232,255,71,0.045); --eg-row-selected-bg:rgba(232,255,71,0.08);
  --eg-row-selected-border:1px solid rgba(232,255,71,0.22);
  --eg-row-selected-outline:transparent; --eg-cell-text:#d4d4d8;
  --eg-cell-border:1px solid rgba(255,255,255,0.04); --eg-text:#e4e4e7;
  --eg-muted-text:#52525b; --eg-border:rgba(255,255,255,0.07);
  --eg-border-hover:rgba(232,255,71,0.28); --eg-sort-active-color:#e8ff47;
  --eg-sort-icon-color:#3f3f46; --eg-btn-bg:rgba(232,255,71,0.08); --eg-btn-text:#e8ff47;
  --eg-skeleton-base:#18181b; --eg-skeleton-highlight:#27272a; --eg-empty-icon-bg:#18181b;`

// ── React playground iframe ───────────────────────────────────────────────────
function buildReactIframeSrcDoc(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>${IFRAME_CSS}</style>
  <script type="importmap">{
    "imports":{
      "react":"https://esm.sh/react@18.3.1",
      "react-dom":"https://esm.sh/react-dom@18.3.1",
      "react-dom/client":"https://esm.sh/react-dom@18.3.1/client",
      "react/jsx-runtime":"https://esm.sh/react@18.3.1/jsx-runtime",
      "@elitegrid/core":"${origin}/cdn/core.js",
      "@elitegrid/react":"${origin}/cdn/react.js"
    }
  }</script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"></script>
</head>
<body>
  <div id="root" style="${ROOT_STYLE}"></div>
  <script type="module">
    import React          from 'react'
    import ReactDOM       from 'react-dom'
    import{createRoot}    from 'react-dom/client'
    import*as ReactAll    from 'react'
    import*as EliteReact  from '@elitegrid/react'
    import*as EliteCore   from '@elitegrid/core'

    const require=mod=>{
      const m={'react':ReactAll,'react-dom':ReactDOM,'react-dom/client':{createRoot},
               '@elitegrid/react':EliteReact,'@elitegrid/core':EliteCore}
      if(m[mod])return m[mod]
      throw new Error('Module not available: '+mod)
    }
    const rootEl=document.getElementById('root')
    let reactRoot=null

    function showError(msg){
      if(reactRoot){try{reactRoot.unmount()}catch(_){}reactRoot=null}
      rootEl.innerHTML='<div style="padding:24px;font-family:monospace;font-size:12.5px;'+
        'color:#f87171;background:rgba(248,113,113,0.06);border-left:2px solid rgba(248,113,113,0.5);'+
        'white-space:pre-wrap;overflow:auto;height:100%;box-sizing:border-box;line-height:1.6;">'+
        msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'
    }

    function runCode(raw){
      const Babel=window.Babel
      if(!Babel){showError('Babel not ready yet.');return}
      let t
      try{t=Babel.transform(raw,{presets:[['react',{runtime:'classic'}],
        ['typescript',{allExtensions:true,isTSX:true}],
        ['env',{targets:{esmodules:true},modules:'commonjs'}]],filename:'app.tsx'}).code}
      catch(e){showError('Syntax error:\\n\\n'+e.message);return}
      const w='"use strict";\\nvar exports={__esModule:true};\\nvar module={exports:exports};\\n'+
        t+'\\nreturn exports["default"]||module.exports["default"]||module.exports;'
      let App
      try{App=(new Function('require','React',w))(require,ReactAll)}
      catch(e){showError('Runtime error:\\n\\n'+e.message);return}
      if(typeof App!=='function'){showError('Export a default React component.');return}
      try{
        if(reactRoot){reactRoot.unmount();reactRoot=null}
        rootEl.innerHTML=''
        reactRoot=createRoot(rootEl)
        reactRoot.render(React.createElement(App))
      }catch(e){showError('Render error:\\n\\n'+e.message)}
    }

    window.addEventListener('message',e=>{if(e.data?.type==='RUN_CODE')runCode(e.data.code)})
    window.parent.postMessage({type:'IFRAME_READY'},'*')
  </script>
</body></html>`
}

// ── Vue playground iframe ─────────────────────────────────────────────────────
function buildVueIframeSrcDoc(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>${IFRAME_CSS}</style>
  <script type="importmap">{
    "imports":{
      "vue":"https://esm.sh/vue@3.4.33",
      "@elitegrid/core":"${origin}/cdn/core.js",
      "@elitegrid/vue":"${origin}/cdn/vue.js"
    }
  }</script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"></script>
</head>
<body>
  <div id="root" style="${ROOT_STYLE}"></div>
  <script type="module">
    import*as VueAll    from 'vue'
    import*as EliteVue  from '@elitegrid/vue'
    import*as EliteCore from '@elitegrid/core'

    const require=mod=>{
      const m={'vue':VueAll,'@elitegrid/vue':EliteVue,'@elitegrid/core':EliteCore}
      if(m[mod])return m[mod]
      throw new Error('Module not available: '+mod)
    }
    const rootEl=document.getElementById('root')
    let vueApp=null

    function showError(msg){
      if(vueApp){try{vueApp.unmount()}catch(_){}vueApp=null}
      rootEl.innerHTML='<div style="padding:24px;font-family:monospace;font-size:12.5px;'+
        'color:#f87171;background:rgba(248,113,113,0.06);border-left:2px solid rgba(248,113,113,0.5);'+
        'white-space:pre-wrap;overflow:auto;height:100%;box-sizing:border-box;line-height:1.6;">'+
        msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'
    }

    function runCode(raw){
      const Babel=window.Babel
      if(!Babel){showError('Babel not ready yet.');return}
      let t
      try{t=Babel.transform(raw,{presets:[
        ['typescript',{allExtensions:true}],
        ['env',{targets:{esmodules:true},modules:'commonjs'}]
      ],filename:'app.ts'}).code}
      catch(e){showError('Syntax error:\\n\\n'+e.message);return}
      const w='"use strict";\\nvar exports={__esModule:true};\\nvar module={exports:exports};\\n'+
        t+'\\nreturn exports["default"]||module.exports["default"]||module.exports;'
      let comp
      try{comp=(new Function('require',w))(require)}
      catch(e){showError('Runtime error:\\n\\n'+e.message);return}
      if(!comp){showError('Export a default Vue component.\\n\\nExample:\\n  export default defineComponent({\\n    setup() { return () => h(Grid, { grid }) }\\n  })');return}
      if(vueApp){try{vueApp.unmount()}catch(_){}vueApp=null}
      rootEl.innerHTML=''
      try{
        vueApp=VueAll.createApp(comp)
        vueApp.mount(rootEl)
      }catch(e){showError('Mount error:\\n\\n'+e.message)}
    }

    window.addEventListener('message',e=>{if(e.data?.type==='RUN_CODE')runCode(e.data.code)})
    window.parent.postMessage({type:'IFRAME_READY'},'*')
  </script>
</body></html>`
}

// ── Monaco loading placeholder (dark-themed, no jarring white flash) ─────────
const MONACO_LOADING = (
  <div style={{
    height: '100%', background: '#09090b',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8ff47', opacity: 0.5,
      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '0ms', display: 'block' }} />
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8ff47', opacity: 0.5,
      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '150ms', display: 'block' }} />
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8ff47', opacity: 0.5,
      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '300ms', display: 'block' }} />
  </div>
)

// ── Loading placeholder ───────────────────────────────────────────────────────
const LOADING_DOC = `<!DOCTYPE html><html><head><style>
  body{margin:0;display:flex;align-items:center;justify-content:center;
       height:100vh;font-family:system-ui;background:#09090b;}
  .dot{width:5px;height:5px;border-radius:50%;background:#e8ff47;display:inline-block;
       margin:0 3px;animation:pulse 1.2s ease-in-out infinite;}
  .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
  @keyframes pulse{0%,80%,100%{opacity:.2}40%{opacity:1}}
</style></head><body>
  <div style="display:flex;align-items:center;gap:10px;">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
  </div>
</body></html>`

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useDragResize() {
  const [editorHeight, setEditorHeight] = useState<number>(320)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  useEffect(() => {
    setEditorHeight(Math.floor((window.innerHeight - 200) / 2))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    startY.current = e.clientY
    startH.current = editorHeight
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [editorHeight])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const delta = e.clientY - startY.current
      setEditorHeight(Math.max(120, Math.min(startH.current + delta, window.innerHeight - 200)))
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return { editorHeight, onMouseDown }
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }, [])
  return { copied, copy }
}

// ── Main component ────────────────────────────────────────────────────────────
// Named export — used by KeepAlive.tsx in the root layout.
// The default export below returns null so the /playground route itself
// doesn't double-render (KeepAlive owns the visible layer via position:fixed).
export function PlaygroundPage() {
  const [framework, setFramework] = useState<Framework>('react')
  const [activeExample, setActiveExample] = useState<ExampleKey>('performance')
  const [code, setCode] = useState(REACT_EXAMPLES.performance.code)
  const [iframeReady, setIframeReady] = useState(false)
  const [running, setRunning] = useState(false)
  const [mobileTab, setMobileTab] = useState<'preview' | 'code'>('preview')
  const [isMobile, setIsMobile] = useState(false)
  const [srcDoc, setSrcDoc] = useState(LOADING_DOC)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCodeRef = useRef<string | null>(null)
  const handleCodeChangeRef = useRef<(v: string) => void>(() => {})
  const { editorHeight, onMouseDown } = useDragResize()
  const { copied, copy } = useCopy()

  // ── Global style injection ──
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes pulse { 0%,80%,100%{opacity:.15} 40%{opacity:1} }
      .monaco-editor .monaco-hover,
      .monaco-editor .overflowingContentWidgets,
      .monaco-editor .suggest-widget,
      .monaco-editor .parameter-hints-widget { z-index: 9999 !important; }
      .monaco-editor .overflowingContentWidgets { position: fixed !important; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(232,255,71,0.18); border-radius: 999px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(232,255,71,0.4); }
      ::-webkit-scrollbar-corner { background: transparent; }
      * { scrollbar-width: thin; scrollbar-color: rgba(232,255,71,0.18) transparent; }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  // ── Mobile detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Rebuild srcDoc when framework changes ──
  // useLayoutEffect runs before the browser paints — the user never sees
  // the LOADING_DOC placeholder. The _srcDocCache avoids rebuilding the
  // identical HTML string on every re-navigation to the playground.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const origin = window.location.origin
    const key = `${framework}:${origin}`
    if (!_srcDocCache[key]) {
      _srcDocCache[key] = framework === 'react'
        ? buildReactIframeSrcDoc(origin)
        : buildVueIframeSrcDoc(origin)
    }
    setIframeReady(false)
    setSrcDoc(_srcDocCache[key])
  }, [framework])

  // ── Code execution ──
  const sendCode = useCallback((codeToRun: string) => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    setRunning(true)
    win.postMessage({ type: 'RUN_CODE', code: codeToRun }, '*')
    setTimeout(() => setRunning(false), 1500)
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'IFRAME_READY') {
        setIframeReady(true)
        const toRun = pendingCodeRef.current ?? code
        pendingCodeRef.current = null
        setTimeout(() => sendCode(toRun), 600)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [sendCode, code])

  const runCode = useCallback((codeToRun: string) => {
    if (!iframeReady) { pendingCodeRef.current = codeToRun; return }
    sendCode(codeToRun)
  }, [iframeReady, sendCode])

  const handleCodeChange = useCallback((value: string | undefined) => {
    const v = value ?? ''
    setCode(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runCode(v), 1200)
  }, [runCode])
  handleCodeChangeRef.current = handleCodeChange

  // ── Framework & example switching ──
  const examples = framework === 'react' ? REACT_EXAMPLES : VUE_EXAMPLES

  const switchFramework = (fw: Framework) => {
    if (fw === framework) return
    const exs = fw === 'react' ? REACT_EXAMPLES : VUE_EXAMPLES
    const newCode = exs[activeExample].code
    setCode(newCode)
    pendingCodeRef.current = newCode  // send when iframe is ready
    setFramework(fw)  // triggers srcDoc rebuild via useEffect
  }

  const switchExample = (key: ExampleKey) => {
    setActiveExample(key)
    const newCode = examples[key].code
    setCode(newCode)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setTimeout(() => runCode(newCode), 100)
  }

  const currentExample = examples[activeExample]
  const isVue = framework === 'vue'

  // ── Monaco configuration ──
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    const oldModel = editor.getModel()
    if (!oldModel) return
    const ext = isVue ? '.ts' : '.tsx'
    const targetUri = monaco.Uri.parse(`file:///app${ext}`)
    if (oldModel.uri.toString() === targetUri.toString()) return
    const stale = monaco.editor.getModel(targetUri)
    if (stale) stale.dispose()
    const newModel = monaco.editor.createModel(oldModel.getValue(), 'typescript', targetUri)
    editor.setModel(newModel)
    oldModel.dispose()
    newModel.onDidChangeContent(() => { handleCodeChangeRef.current(newModel.getValue()) })
  }, [isVue])

  const handleEditorBeforeMount = useCallback((monaco: any) => {
    const ts = monaco.languages.typescript.typescriptDefaults
    ts.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: false,
      noUnusedLocals: false,
      skipLibCheck: true,
      checkJs: false,
      noEmit: true,
      isolatedModules: false,
    })
    ts.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false })
    ts.setInlayHintsOptions({
      includeInlayParameterNameHints: 'none',
      includeInlayParameterNameHintsWhenArgumentMatchesName: false,
      includeInlayFunctionParameterTypeHints: false,
      includeInlayVariableTypeHints: false,
      includeInlayVariableTypeHintsWhenTypeMatchesName: false,
      includeInlayPropertyDeclarationTypeHints: false,
      includeInlayFunctionLikeReturnTypeHints: false,
      includeInlayEnumMemberValueHints: false,
    })
    ts.addExtraLib(
      `declare module 'react' {
        export function useState<S>(init: S | (() => S)): [S, (s: S | ((prev: S) => S)) => void]
        export function useEffect(effect: () => (void | (() => void)), deps?: ReadonlyArray<any>): void
        export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T
        export function useRef<T>(initialValue: T): { current: T }
        export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any>): T
        export type ReactNode = any; export type CSSProperties = { [key: string]: any }
        const React: { createElement: any; Fragment: any; [key: string]: any }
        export default React
        namespace JSX {
          interface Element {}; interface ElementClass {}
          interface IntrinsicElements { [elemName: string]: any }
          interface IntrinsicAttributes { [key: string]: any }
          interface ElementAttributesProperty { props: {} }
          interface ElementChildrenAttribute { children: {} }
        }
      }`,
      'file:///node_modules/@types/react/index.d.ts'
    )
    ts.addExtraLib(
      `declare module 'vue' {
        export function defineComponent(options: any): any
        export function h(type: any, props?: any, children?: any): any
        export function ref<T>(value: T): { value: T }
        export function reactive<T extends object>(target: T): T
        export function computed<T>(getter: () => T): { readonly value: T }
        export function onMounted(hook: () => void): void
        export function onBeforeUnmount(hook: () => void): void
        export function watch(source: any, cb: any, options?: any): any
        export function createApp(component: any): {
          mount(el: any): any
          component(name: string, comp: any): any
          use(plugin: any): any
        }
        export type Ref<T> = { value: T }
        export type ComputedRef<T> = { readonly value: T }
      }`,
      'file:///node_modules/vue/index.d.ts'
    )
    ts.addExtraLib(
      "declare module '@elitegrid/react' {\n" + ELITEGRID_TYPES + '\n}',
      'file:///node_modules/@elitegrid/react/index.d.ts'
    )
    ts.addExtraLib(
      "declare module '@elitegrid/vue' {\n" + ELITEGRID_TYPES + '\n}',
      'file:///node_modules/@elitegrid/vue/index.d.ts'
    )
  }, [])

  const monacoOptions = {
    fontSize: 13, lineHeight: 22,
    fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono","Consolas",monospace',
    fontLigatures: true, letterSpacing: 0.3, tabSize: 2, insertSpaces: true,
    wordWrap: 'on' as const, autoIndent: 'full' as const,
    formatOnType: true, formatOnPaste: true,
    autoClosingBrackets: 'always' as const, autoClosingQuotes: 'always' as const,
    autoSurround: 'languageDefined' as const, matchBrackets: 'always' as const,
    bracketPairColorization: { enabled: true },
    quickSuggestions: { other: true, comments: false, strings: true },
    quickSuggestionsDelay: 100, suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on' as const, tabCompletion: 'on' as const,
    parameterHints: { enabled: true, cycle: true },
    suggest: {
      showKeywords: true, showSnippets: true, showClasses: true,
      showFunctions: true, showVariables: true, showProperties: true,
      showMethods: true, showInterfaces: true, showModules: true,
      showWords: true, preview: true, insertMode: 'replace' as const,
    },
    minimap: { enabled: false }, scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 }, renderLineHighlight: 'line' as const,
    renderWhitespace: 'selection' as const,
    guides: { bracketPairs: true, indentation: true, highlightActiveIndentation: true },
    occurrencesHighlight: 'singleFile' as const, selectionHighlight: true, codeLens: false,
    scrollbar: {
      vertical: 'auto' as const, horizontal: 'auto' as const,
      verticalScrollbarSize: 4, horizontalScrollbarSize: 4, useShadows: false,
    },
    cursorBlinking: 'smooth' as const, cursorSmoothCaretAnimation: 'on' as const,
    cursorStyle: 'line' as const, cursorWidth: 2,
    lineNumbers: 'on' as const, lineNumbersMinChars: 3, glyphMargin: false,
    folding: true, foldingHighlight: true, showFoldingControls: 'mouseover' as const,
    hover: { enabled: true, delay: 200, sticky: true, above: false },
    links: true, fixedOverflowWidgets: true,
    readOnly: false,
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logoGlow} />
          <div style={s.logoDot} />
          <span style={s.logoText}><span style={s.accent}>Elite</span>Grid</span>
          <span style={s.divider}>/</span>
          <span style={s.pageTitle}>Playground</span>
        </div>

        <div style={s.fwTabs}>
          <button
            style={{ ...s.fwTab, ...(framework === 'react' ? s.fwTabReactActive : {}) }}
            onClick={() => switchFramework('react')}>
            <span style={s.reactIcon}>⚛</span> React
          </button>
          <button
            style={{ ...s.fwTab, ...(isVue ? s.fwTabVueActive : {}) }}
            onClick={() => switchFramework('vue')}>
            <span style={{ ...s.vueIcon, ...(isVue ? { color: '#41b883' } : {}) }}>◆</span> Vue
          </button>
        </div>

        <div style={s.topbarRight}>
          {!isMobile && (
            <div style={s.exTabs}>
              {(Object.keys(REACT_EXAMPLES) as ExampleKey[]).map(key => {
                const ex = examples[key]
                const isActive = activeExample === key
                return (
                  <button key={key}
                    style={{ ...s.exTab, ...(isActive ? s.exTabActive : {}) }}
                    onClick={() => switchExample(key)}>
                    {ex.label}
                    <span style={{ ...s.exBadge, ...(isActive ? s.exBadgeActive : {}) }}>
                      {ex.badge}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <button
            style={{ ...s.runBtn, opacity: running ? 0.65 : 1, transform: running ? 'scale(0.97)' : 'scale(1)' }}
            onClick={() => runCode(code)}
            disabled={running}>
            <span style={{ fontSize: 11 }}>{running ? '◌' : '▶'}</span>
            {running ? 'Running' : 'Run'}
          </button>

          <button
            style={{ ...s.iconBtn, ...(copied ? s.iconBtnSuccess : {}) }}
            onClick={() => copy(code)}
            title="Copy code">
            {copied ? '✓' : '⎘'}
          </button>

        </div>
      </div>

      {/* ── Mobile example pills ─────────────────────────────────── */}
      {isMobile && (
        <div style={s.mobilePillsRow}>
          {(Object.keys(REACT_EXAMPLES) as ExampleKey[]).map(key => {
            const isActive = activeExample === key
            return (
              <button key={key}
                style={{ ...s.mobilePill, ...(isActive ? s.mobilePillActive : {}) }}
                onClick={() => switchExample(key)}>
                {examples[key].label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Main area ────────────────────────────────────────────── */}
      {isMobile ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={s.mobileViewToggle}>
            <button style={{ ...s.mobileViewBtn, ...(mobileTab === 'preview' ? s.mobileViewBtnActive : {}) }}
                    onClick={() => setMobileTab('preview')}>Preview</button>
            <button style={{ ...s.mobileViewBtn, ...(mobileTab === 'code' ? s.mobileViewBtnActive : {}) }}
                    onClick={() => setMobileTab('code')}>Code</button>
            <div style={s.mobileExDesc}>{currentExample.desc}</div>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <div style={{ ...s.mobilePane, display: mobileTab === 'preview' ? 'flex' : 'none' }}>
              <iframe ref={iframeRef} srcDoc={srcDoc} style={s.iframe}
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="EliteGrid preview" />
            </div>
            <div style={{ ...s.mobilePane, display: mobileTab === 'code' ? 'flex' : 'none' }}>
              <Editor
                key={`mobile-${framework}`}
                defaultLanguage="typescript"
                value={code}
                theme="vs-dark"
                loading={MONACO_LOADING}
                onChange={(v) => handleCodeChange(v)}
                options={{ ...monacoOptions, fontSize: 12, lineHeight: 20 }}
              />
            </div>
          </div>

        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Editor pane */}
          <div style={{ ...s.editorPane, height: editorHeight }}>
            <div style={s.paneHeader}>
              <div style={s.paneHeaderLeft}>
                <span style={s.fileTab}>
                  <span style={{ color: isVue ? '#41b883' : '#e8ff47', fontSize: 10, marginRight: 5 }}>◆</span>
                  {currentExample.filename}
                </span>
                <span style={s.exampleDesc}>{currentExample.desc}</span>
              </div>
              <div style={s.paneHeaderRight}>
                {running && <span style={s.renderingBadge}>● Rendering</span>}
                <span style={s.autoRunHint}>Auto-runs after 1.2s</span>
              </div>
            </div>
            <div style={s.editorWrap}>
              <Editor
                key={`desktop-${framework}`}
                defaultLanguage="typescript"
                value={code}
                theme="vs-dark"
                loading={MONACO_LOADING}
                onMount={handleEditorMount}
                beforeMount={handleEditorBeforeMount}
                options={monacoOptions}
              />
            </div>
          </div>

          {/* Drag handle */}
          <div style={s.dragHandle} onMouseDown={onMouseDown}>
            <div style={s.dragPills}>
              <span style={s.dragPill} /><span style={s.dragPill} /><span style={s.dragPill} />
            </div>
          </div>

          {/* Preview pane */}
          <div style={s.previewPane}>
            <div style={s.paneHeader}>
              <div style={s.paneHeaderLeft}>
                <span style={s.previewLabel}>Preview</span>
                {isVue && (
                  <span style={s.vueLiveBadge}>
                    <span style={{ color: '#41b883' }}>◆</span> Vue 3 · Live
                  </span>
                )}
                {!iframeReady && (
                  <span style={s.loadingDots}>
                    <span style={s.dot}>·</span>
                    <span style={{ ...s.dot, animationDelay: '150ms' }}>·</span>
                    <span style={{ ...s.dot, animationDelay: '300ms' }}>·</span>
                  </span>
                )}
              </div>
              <div style={s.paneHeaderRight}>
                <span style={isVue ? s.previewHintVue : s.previewHint}>Live output</span>
              </div>
            </div>
            <div style={s.iframeWrap}>
              <iframe
                ref={iframeRef}
                srcDoc={srcDoc}
                style={s.iframe}
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="EliteGrid preview"
              />
            </div>
          </div>

        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div style={s.footer}>
        <span style={s.footerLeft}>
          Import <code style={s.inlineCode}>@elitegrid/{framework}</code> — no install needed in playground.
        </span>
        <a href="https://elitegrid.dev#waitlist" style={s.footerLink}>
          Join waitlist for v1 →
        </a>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    height: '100dvh', display: 'flex', flexDirection: 'column',
    background: '#09090b', color: '#e4e4e7',
    fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden',
  },
  topbar: {
    height: 52, background: '#0a0a0c',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', flexShrink: 0, gap: 12,
  },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, position: 'relative' },
  logoGlow: {
    position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)',
    width: 24, height: 24,
    background: 'radial-gradient(circle, rgba(232,255,71,0.35) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  logoDot: {
    width: 7, height: 7, borderRadius: '50%', background: '#e8ff47', flexShrink: 0,
    boxShadow: '0 0 8px rgba(232,255,71,0.6)', position: 'relative',
  },
  logoText: { fontSize: '0.9375rem', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.025em' },
  accent: { color: '#e8ff47' },
  divider: { color: 'rgba(255,255,255,0.1)', margin: '0 2px' },
  pageTitle: { fontSize: '0.8125rem', color: '#3f3f46', fontWeight: 400 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },

  fwTabs: {
    display: 'flex', gap: 2,
    background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 3,
    border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
  },
  fwTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: '0.8rem', fontWeight: 600, padding: '5px 13px', borderRadius: 8,
    border: 'none', background: 'transparent', color: '#52525b',
    cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.01em',
  },
  fwTabReactActive: {
    background: 'rgba(97,218,251,0.12)', color: '#61dafb',
    boxShadow: '0 0 0 1px rgba(97,218,251,0.2)',
  },
  fwTabVueActive: {
    background: 'rgba(65,184,131,0.12)', color: '#41b883',
    boxShadow: '0 0 0 1px rgba(65,184,131,0.2)',
  },
  reactIcon: { fontSize: '0.9rem' },
  vueIcon: { fontSize: '0.75rem', color: '#3f3f46', transition: 'color 0.15s' },

  exTabs: {
    display: 'flex', gap: 2,
    background: 'rgba(255,255,255,0.025)', borderRadius: 8, padding: 3,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  exTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: '0.775rem', fontWeight: 500, padding: '5px 11px', borderRadius: 6,
    border: 'none', background: 'transparent', color: '#52525b',
    cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.01em',
  },
  exTabActive: { background: '#e8ff47', color: '#09090b', fontWeight: 700 },
  exBadge: {
    fontSize: '0.6rem', fontWeight: 700, padding: '2px 5px', borderRadius: 4,
    background: 'rgba(255,255,255,0.08)', color: '#3f3f46',
    letterSpacing: '0.04em', textTransform: 'uppercase' as const, transition: 'all 0.15s',
  },
  exBadgeActive: { background: 'rgba(9,9,11,0.2)', color: '#09090b' },

  runBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: '0.8125rem', fontWeight: 700, padding: '6px 16px', borderRadius: 7,
    border: 'none', background: '#e8ff47', color: '#09090b',
    cursor: 'pointer', transition: 'opacity 0.15s, transform 0.1s',
    letterSpacing: '0.01em', flexShrink: 0,
  },
  iconBtn: {
    width: 32, height: 32, borderRadius: 7,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)', color: '#52525b',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.875rem', transition: 'all 0.15s', flexShrink: 0,
  },
  iconBtnSuccess: {
    background: 'rgba(134,239,172,0.12)',
    borderColor: 'rgba(134,239,172,0.25)', color: '#86efac',
  },
  mobilePillsRow: {
    display: 'flex', gap: 6, padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    overflowX: 'auto' as const, flexShrink: 0,
  },
  mobilePill: {
    flexShrink: 0, padding: '6px 14px', borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', color: '#52525b',
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  },
  mobilePillActive: { background: '#e8ff47', borderColor: '#e8ff47', color: '#09090b' },

  mobileViewToggle: {
    display: 'flex', alignItems: 'center', gap: 2, padding: '6px 12px',
    background: '#0a0a0c', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
  },
  mobileViewBtn: {
    padding: '5px 16px', borderRadius: 6, border: 'none', background: 'transparent',
    color: '#52525b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  },
  mobileViewBtnActive: { background: 'rgba(232,255,71,0.1)', color: '#e8ff47' },
  mobileExDesc: {
    marginLeft: 8, fontSize: '0.72rem', color: '#3f3f46', flex: 1,
    overflow: 'hidden', textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const,
  },
  mobilePane: { position: 'absolute' as const, inset: 0, flexDirection: 'column' as const },
  paneHeader: {
    height: 34, background: '#0a0a0c', borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 14px', flexShrink: 0,
  },
  paneHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  paneHeaderRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },

  editorPane: {
    display: 'flex', flexDirection: 'column', flexShrink: 0,
    minHeight: 0, overflow: 'hidden', position: 'relative', zIndex: 10,
  },
  fileTab: {
    fontSize: '0.75rem', fontWeight: 500, color: '#71717a', padding: '3px 10px',
    borderRadius: 5, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  exampleDesc: {
    fontSize: '0.72rem', color: '#3f3f46',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1,
  },
  autoRunHint: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.1)' },
  renderingBadge: { fontSize: '0.7rem', color: '#e8ff47', fontWeight: 600 },
  editorWrap: { flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' },

  dragHandle: {
    height: 8, background: 'rgba(255,255,255,0.02)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.15s', userSelect: 'none',
  },
  dragPills: { display: 'flex', gap: 3 },
  dragPill: { width: 20, height: 2, borderRadius: 999, background: 'rgba(255,255,255,0.1)', display: 'block' },

  previewPane: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
  previewLabel: {
    fontSize: '0.75rem', fontWeight: 600, color: '#3f3f46',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  },
  previewHint:    { fontSize: '0.7rem', color: 'rgba(255,255,255,0.08)' },
  previewHintVue: { fontSize: '0.7rem', color: 'rgba(65,184,131,0.4)' },
  vueLiveBadge: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: '0.72rem', color: '#41b883', padding: '2px 8px', borderRadius: 4,
    background: 'rgba(65,184,131,0.08)', border: '1px solid rgba(65,184,131,0.15)', fontWeight: 600,
  },
  loadingDots: { display: 'flex', gap: 1, color: '#3f3f46', fontSize: 18, lineHeight: '1' },
  dot: { display: 'inline-block' },
  iframeWrap: { flex: 1, minHeight: 0, background: '#09090b' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },

  footer: {
    height: 36, background: '#0a0a0c', borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', flexShrink: 0, gap: 12,
  },
  footerLeft: {
    fontSize: '0.72rem', color: '#27272a',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
  },
  inlineCode: {
    fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)',
    padding: '1px 5px', borderRadius: 4, color: '#52525b', fontSize: '0.68rem',
  },
  footerLink: {
    color: '#e8ff47', textDecoration: 'none', fontWeight: 600, fontSize: '0.72rem',
    opacity: 0.85, flexShrink: 0,
  },
}

// Route default export — returns null because KeepAlive.tsx in the root layout
// owns the actual rendering via position:fixed + display:none persistence.
export default function Page() { return null }
