'use client'

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Editor, { loader } from '@monaco-editor/react'
import {
  buildReactIframeSrcDoc,
  buildVueIframeSrcDoc,
  buildVanillaIframeSrcDoc,
} from '@/lib/playgroundSrcDoc'

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
  export function mount<TData = unknown>(
    grid: GridInstance<TData>,
    container: Element | null
  ): () => void
`

// ── Types ─────────────────────────────────────────────────────────────────────
type Framework = 'react' | 'vue' | 'vanilla'
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
    { field: 'id',       header: 'ID',         size: { width: 90 } },
    { field: 'name',     header: 'Name',       size: { flex: 1, minWidth: 140 },
      filter: { type: 'text' } },
    { field: 'dept',     header: 'Department', size: { flex: 1, minWidth: 120 },
      filter: { type: 'text' } },
    { field: 'salary',   header: 'Salary',     size: { flex: 1, minWidth: 110 },
      filter: { type: 'number' },
      display: { formatter: v => '$' + Number(v).toLocaleString() } },
    { field: 'location', header: 'Location',   size: { flex: 1, minWidth: 110 },
      filter: { type: 'text' } },
    { field: 'status',   header: 'Status',     size: { width: 110 },
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
    { field: 'id',      header: 'ID',      size: { width: 80 } },
    { field: 'name',    header: 'Name',    size: { flex: 1, minWidth: 140 },
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
    { field: 'name',   header: 'Name',       size: { flex: 1, minWidth: 140 },
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
    { field: 'id',     header: 'ID',         size: { width: 80 } },
    { field: 'name',   header: 'Name',       size: { flex: 1, minWidth: 140 }, filter: { type: 'text' } },
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
    background: primary ? '#7c3aed' : 'rgba(255,255,255,0.07)',
    color:      primary ? '#ffffff' : '#a1a1aa',
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
    { field: 'id',       header: 'ID',         size: { width: 90 } },
    { field: 'name',     header: 'Name',       size: { flex: 1, minWidth: 140 },
      filter: { type: 'text' } },
    { field: 'dept',     header: 'Department', size: { flex: 1, minWidth: 120 },
      filter: { type: 'text' } },
    { field: 'salary',   header: 'Salary',     size: { flex: 1, minWidth: 110 },
      filter: { type: 'number' },
      display: { formatter: (v) => '$' + Number(v).toLocaleString() } },
    { field: 'location', header: 'Location',   size: { flex: 1, minWidth: 110 },
      filter: { type: 'text' } },
    { field: 'status',   header: 'Status',     size: { width: 110 },
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
    { field: 'id',      header: 'ID',      size: { width: 80 } },
    { field: 'name',    header: 'Name',    size: { flex: 1, minWidth: 140 },
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
    { field: 'name',   header: 'Name',       size: { flex: 1, minWidth: 140 },
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
    { field: 'id',     header: 'ID',         size: { width: 80 } },
    { field: 'name',   header: 'Name',       size: { flex: 1, minWidth: 140 }, filter: { type: 'text' } },
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
      background: primary ? '#7c3aed' : 'rgba(255,255,255,0.07)',
      color:      primary ? '#ffffff' : '#a1a1aa',
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

// ── Vanilla JS examples — createGrid() + mount(), no framework at all ────────
const VANILLA_EXAMPLES: Record<ExampleKey, ExampleDef> = {
  performance: {
    label: 'Virtual Scroll',
    badge: '10K rows',
    desc: 'Identical config, zero framework — 10,000 rows, same 60fps performance',
    filename: 'performance.ts',
    code: `import { createGrid, mount } from '@elitegrid/vanilla'

const DEPTS     = ['Engineering','Design','Marketing','HR','Sales','Finance']
const LOCATIONS = ['New York','London','Berlin','Tokyo','Sydney','Toronto']
const NAMES     = ['Alice','Bob','Carol','David','Eva','Frank','Grace','Henry',
                   'Isabel','Jack','Karen','Leo','Mia','Nate','Olivia','Pete']

const grid = createGrid({
  columns: [
    { field: 'id',       header: 'ID',         size: { width: 90 } },
    { field: 'name',     header: 'Name',       size: { flex: 1, minWidth: 140 },
      filter: { type: 'text' } },
    { field: 'dept',     header: 'Department', size: { flex: 1, minWidth: 120 },
      filter: { type: 'text' } },
    { field: 'salary',   header: 'Salary',     size: { flex: 1, minWidth: 110 },
      filter: { type: 'number' },
      display: { formatter: v => '$' + Number(v).toLocaleString() } },
    { field: 'location', header: 'Location',   size: { flex: 1, minWidth: 110 },
      filter: { type: 'text' } },
    { field: 'status',   header: 'Status',     size: { width: 110 },
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

// No component, no re-render cycle — just point mount() at a container.
mount(grid, document.getElementById('grid-container'))`,
  },
  api: {
    label: 'Real API',
    badge: 'Live fetch',
    desc: 'Fetch from a real API — sort, filter and paginate live data, zero framework glue',
    filename: 'real-api.ts',
    code: `import { createGrid, mount } from '@elitegrid/vanilla'

const grid = createGrid({
  columns: [
    { field: 'id',      header: 'ID',      size: { width: 80 } },
    { field: 'name',    header: 'Name',    size: { flex: 1, minWidth: 140 },
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

mount(grid, document.getElementById('grid-container'))`,
  },
  editable: {
    label: 'Inline Edit',
    badge: 'Validated',
    desc: 'Double-click any cell to edit — type-safe validators, dropdowns, Tab/Enter nav',
    filename: 'editable.ts',
    code: `import { createGrid, mount } from '@elitegrid/vanilla'

const grid = createGrid({
  columns: [
    { field: 'name',   header: 'Name',       size: { flex: 1, minWidth: 140 },
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

// Re-runnable: clear the container first so nothing stacks up on re-run.
const container = document.getElementById('grid-container')!
container.innerHTML = ''
container.style.cssText =
  'height:100%;display:flex;flex-direction:column;gap:8px;padding:8px;box-sizing:border-box'

const hint = document.createElement('p')
hint.textContent = 'Double-click any cell to edit · Tab moves · Enter saves · Esc cancels'
hint.style.cssText = 'margin:0;font-size:0.8rem;color:#52525b;font-family:system-ui'
container.appendChild(hint)

const gridEl = document.createElement('div')
gridEl.style.cssText = 'flex:1;min-height:0'
container.appendChild(gridEl)

mount(grid, gridEl)`,
  },
  export: {
    label: 'CSV Export',
    badge: 'Multi-scope',
    desc: 'Export all, filtered, or selected rows — with separate export formatters',
    filename: 'export.ts',
    code: `import { createGrid, mount } from '@elitegrid/vanilla'

let api: any = null

const grid = createGrid({
  columns: [
    { field: 'id',     header: 'ID',         size: { width: 80 } },
    { field: 'name',   header: 'Name',       size: { flex: 1, minWidth: 140 }, filter: { type: 'text' } },
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

function makeBtn(label: string, primary: boolean, onClick: () => void) {
  const btn = document.createElement('button')
  btn.textContent = label
  btn.style.cssText = 'padding:7px 16px;border-radius:7px;border:none;cursor:pointer;' +
    'font-size:0.8rem;font-weight:600;font-family:system-ui;' +
    'background:' + (primary ? '#7c3aed' : 'rgba(255,255,255,0.07)') + ';' +
    'color:' + (primary ? '#ffffff' : '#a1a1aa')
  btn.onclick = onClick
  return btn
}

const container = document.getElementById('grid-container')!
container.innerHTML = ''
container.style.cssText =
  'height:100%;display:flex;flex-direction:column;gap:8px;padding:8px;box-sizing:border-box'

const toolbar = document.createElement('div')
toolbar.style.cssText = 'display:flex;gap:8px;flex-shrink:0'
toolbar.appendChild(makeBtn('Export All',      true,  () => api?.exportCSV({ scope: 'all',      filename: 'all-employees'      })))
toolbar.appendChild(makeBtn('Export Filtered', false, () => api?.exportCSV({ scope: 'filtered', filename: 'filtered-employees' })))
toolbar.appendChild(makeBtn('Export Selected', false, () => api?.exportCSV({ scope: 'selected', filename: 'selected-rows'      })))
container.appendChild(toolbar)

const gridEl = document.createElement('div')
gridEl.style.cssText = 'flex:1;min-height:0'
container.appendChild(gridEl)

mount(grid, gridEl)`,
  },
}

// ── Monaco loading placeholder (dark-themed, no jarring white flash) ─────────
const MONACO_LOADING = (
  <div style={{
    height: '100%', background: '#09090b',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', opacity: 0.5,
      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '0ms', display: 'block' }} />
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', opacity: 0.5,
      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '150ms', display: 'block' }} />
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed', opacity: 0.5,
      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '300ms', display: 'block' }} />
  </div>
)

// ── Loading placeholder ───────────────────────────────────────────────────────
const LOADING_DOC = `<!DOCTYPE html><html><head><style>
  body{margin:0;display:flex;align-items:center;justify-content:center;
       height:100vh;font-family:system-ui;background:#09090b;}
  .dot{width:5px;height:5px;border-radius:50%;background:#7c3aed;display:inline-block;
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
  const [isDark, setIsDark] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCodeRef = useRef<string | null>(null)
  const handleCodeChangeRef = useRef<(v: string) => void>(() => {})
  const { editorHeight, onMouseDown } = useDragResize()
  const { copied, copy } = useCopy()

  // ── Follow the site-wide theme toggle (chrome + Monaco only — the
  // preview iframes stay always-dark by design, same as the hero code
  // block and docs code blocks) ──
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('eg-theme', next ? 'dark' : 'light') } catch {}
  }, [])

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
      ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.18); border-radius: 999px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.4); }
      ::-webkit-scrollbar-corner { background: transparent; }
      * { scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.18) transparent; }
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
        : framework === 'vue'
        ? buildVueIframeSrcDoc(origin)
        : buildVanillaIframeSrcDoc(origin)
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

  // ── Theme sync — the preview iframe is a separate document, so it needs
  // its own SET_THEME message rather than just inheriting the .dark class ──
  const sendTheme = useCallback((dark: boolean) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'SET_THEME', theme: dark ? 'dark' : 'light' }, '*')
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'IFRAME_READY') {
        setIframeReady(true)
        sendTheme(isDark)
        const toRun = pendingCodeRef.current ?? code
        pendingCodeRef.current = null
        setTimeout(() => sendCode(toRun), 600)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [sendCode, code, sendTheme, isDark])

  // Re-sync the currently-mounted iframe immediately when the user toggles
  // theme (not just on the next framework switch/reload).
  useEffect(() => {
    if (iframeReady) sendTheme(isDark)
  }, [isDark, iframeReady, sendTheme])

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
  const examplesFor = (fw: Framework) =>
    fw === 'react' ? REACT_EXAMPLES : fw === 'vue' ? VUE_EXAMPLES : VANILLA_EXAMPLES
  const examples = examplesFor(framework)

  const switchFramework = (fw: Framework) => {
    if (fw === framework) return
    const newCode = examplesFor(fw)[activeExample].code
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
  const isVanilla = framework === 'vanilla'

  // ── Monaco configuration ──
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    const oldModel = editor.getModel()
    if (!oldModel) return
    const ext = framework === 'react' ? '.tsx' : '.ts'
    const targetUri = monaco.Uri.parse(`file:///app${ext}`)
    if (oldModel.uri.toString() === targetUri.toString()) return
    const stale = monaco.editor.getModel(targetUri)
    if (stale) stale.dispose()
    const newModel = monaco.editor.createModel(oldModel.getValue(), 'typescript', targetUri)
    editor.setModel(newModel)
    oldModel.dispose()
    newModel.onDidChangeContent(() => { handleCodeChangeRef.current(newModel.getValue()) })
  }, [framework])

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
    ts.addExtraLib(
      "declare module '@elitegrid/vanilla' {\n" + ELITEGRID_TYPES + '\n}',
      'file:///node_modules/@elitegrid/vanilla/index.d.ts'
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
          <Link href="/" style={s.logoLink}>
            <div style={s.logoIcon}>
              <svg width="17" height="17" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="28" width="8" height="12" rx="2" fill="white" fillOpacity="0.3" />
                <rect x="19.5" y="21" width="8" height="19" rx="2" fill="white" fillOpacity="0.6" />
                <rect x="31" y="13" width="8" height="27" rx="2" fill="white" />
                <circle cx="35" cy="11" r="2.5" fill="#c4b5fd" />
              </svg>
            </div>
            <span style={s.logoText}>EliteGrid</span>
          </Link>
          <span style={s.divider}>/</span>
          <span style={s.pageTitle}>Playground</span>

          <div style={s.leftActions}>
            <button
              style={s.miniIconBtn}
              onClick={toggleTheme}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {isDark ? (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M14 9.3A6 6 0 116.7 2a4.7 4.7 0 007.3 7.3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <Link href="/docs" style={s.miniIconBtn} title="Documentation" aria-label="Documentation">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 6h6M5 9.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
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
          <button
            style={{ ...s.fwTab, ...(isVanilla ? s.fwTabVanillaActive : {}) }}
            onClick={() => switchFramework('vanilla')}>
            <span style={{ ...s.jsIcon, ...(isVanilla ? { color: '#f7df1e' } : {}) }}>JS</span> Vanilla
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
                theme={isDark ? 'vs-dark' : 'vs'}
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
                  <span style={{ color: isVue ? '#41b883' : isVanilla ? '#f7df1e' : '#7c3aed', fontSize: 10, marginRight: 5 }}>◆</span>
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
                theme={isDark ? 'vs-dark' : 'vs'}
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
                {isVanilla && (
                  <span style={s.vanillaLiveBadge}>
                    <span style={{ color: '#f7df1e' }}>JS</span> Zero deps · Live
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
                <span style={isVue ? s.previewHintVue : isVanilla ? s.previewHintVanilla : s.previewHint}>Live output</span>
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
          Get started with npm install →
        </a>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    height: '100dvh', display: 'flex', flexDirection: 'column',
    background: 'var(--pg-bg)', color: 'var(--pg-text-1)',
    fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden',
  },
  topbar: {
    height: 52, background: 'var(--pg-bg-raised)',
    borderBottom: '1px solid rgba(var(--pg-fg-rgb),0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', flexShrink: 0, gap: 12,
  },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, position: 'relative' },
  leftActions: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 },
  miniIconBtn: {
    width: 26, height: 26, borderRadius: 6,
    border: '1px solid rgba(var(--pg-fg-rgb),0.07)',
    background: 'rgba(var(--pg-fg-rgb),0.04)', color: 'var(--pg-text-3)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s', flexShrink: 0, textDecoration: 'none',
  },
  logoLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none', color: 'inherit', cursor: 'pointer',
  },
  logoIcon: {
    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(to bottom right, var(--pg-accent), #a855f7)',
    boxShadow: '0 0 14px rgba(124,58,237,0.3)',
  },
  logoText: {
    fontFamily: 'var(--font-bricolage), "Bricolage Grotesque", sans-serif',
    fontSize: '1.0625rem', fontWeight: 700, color: 'var(--pg-text-1)', letterSpacing: '-0.02em',
  },
  divider: { color: 'rgba(var(--pg-fg-rgb),0.1)', margin: '0 2px' },
  pageTitle: { fontSize: '0.8125rem', color: 'var(--pg-text-4)', fontWeight: 400 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },

  fwTabs: {
    display: 'flex', gap: 2,
    background: 'rgba(var(--pg-fg-rgb),0.03)', borderRadius: 10, padding: 3,
    border: '1px solid rgba(var(--pg-fg-rgb),0.06)', flexShrink: 0,
  },
  fwTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: '0.8rem', fontWeight: 600, padding: '5px 13px', borderRadius: 8,
    border: 'none', background: 'transparent', color: 'var(--pg-text-3)',
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
  fwTabVanillaActive: {
    background: 'rgba(247,223,30,0.12)', color: '#f7df1e',
    boxShadow: '0 0 0 1px rgba(247,223,30,0.2)',
  },
  reactIcon: { fontSize: '0.9rem' },
  vueIcon: { fontSize: '0.75rem', color: 'var(--pg-text-4)', transition: 'color 0.15s' },
  jsIcon: {
    fontSize: '0.65rem', fontWeight: 700, color: 'var(--pg-text-4)', transition: 'color 0.15s',
  },

  exTabs: {
    display: 'flex', gap: 2,
    background: 'rgba(var(--pg-fg-rgb),0.025)', borderRadius: 8, padding: 3,
    border: '1px solid rgba(var(--pg-fg-rgb),0.05)',
  },
  exTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: '0.775rem', fontWeight: 500, padding: '5px 11px', borderRadius: 6,
    border: 'none', background: 'transparent', color: 'var(--pg-text-3)',
    cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.01em',
  },
  exTabActive: { background: 'var(--pg-accent)', color: '#ffffff', fontWeight: 700 },
  exBadge: {
    fontSize: '0.6rem', fontWeight: 700, padding: '2px 5px', borderRadius: 4,
    background: 'rgba(var(--pg-fg-rgb),0.08)', color: 'var(--pg-text-4)',
    letterSpacing: '0.04em', textTransform: 'uppercase' as const, transition: 'all 0.15s',
  },
  exBadgeActive: { background: 'rgba(var(--pg-fg-rgb),0.2)', color: '#ffffff' },

  runBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: '0.8125rem', fontWeight: 700, padding: '6px 16px', borderRadius: 7,
    border: 'none', background: 'var(--pg-accent)', color: '#ffffff',
    cursor: 'pointer', transition: 'opacity 0.15s, transform 0.1s',
    letterSpacing: '0.01em', flexShrink: 0,
  },
  iconBtn: {
    width: 32, height: 32, borderRadius: 7,
    border: '1px solid rgba(var(--pg-fg-rgb),0.07)',
    background: 'rgba(var(--pg-fg-rgb),0.04)', color: 'var(--pg-text-3)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.875rem', transition: 'all 0.15s', flexShrink: 0,
  },
  iconBtnSuccess: {
    background: 'rgba(134,239,172,0.12)',
    border: '1px solid rgba(134,239,172,0.25)', color: '#86efac',
  },
  mobilePillsRow: {
    display: 'flex', gap: 6, padding: '8px 12px',
    borderBottom: '1px solid rgba(var(--pg-fg-rgb),0.05)',
    overflowX: 'auto' as const, flexShrink: 0,
  },
  mobilePill: {
    flexShrink: 0, padding: '6px 14px', borderRadius: 999,
    border: '1px solid rgba(var(--pg-fg-rgb),0.08)',
    background: 'rgba(var(--pg-fg-rgb),0.04)', color: 'var(--pg-text-3)',
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  },
  mobilePillActive: { background: 'var(--pg-accent)', border: '1px solid var(--pg-accent)', color: '#ffffff' },

  mobileViewToggle: {
    display: 'flex', alignItems: 'center', gap: 2, padding: '6px 12px',
    background: 'var(--pg-bg-raised)', borderBottom: '1px solid rgba(var(--pg-fg-rgb),0.05)', flexShrink: 0,
  },
  mobileViewBtn: {
    padding: '5px 16px', borderRadius: 6, border: 'none', background: 'transparent',
    color: 'var(--pg-text-3)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  },
  mobileViewBtnActive: { background: 'rgba(124,58,237,0.1)', color: 'var(--pg-accent)' },
  mobileExDesc: {
    marginLeft: 8, fontSize: '0.72rem', color: 'var(--pg-text-4)', flex: 1,
    overflow: 'hidden', textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const,
  },
  mobilePane: { position: 'absolute' as const, inset: 0, flexDirection: 'column' as const },
  paneHeader: {
    height: 34, background: 'var(--pg-bg-raised)', borderBottom: '1px solid rgba(var(--pg-fg-rgb),0.05)',
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
    fontSize: '0.75rem', fontWeight: 500, color: 'var(--pg-text-2)', padding: '3px 10px',
    borderRadius: 5, background: 'rgba(var(--pg-fg-rgb),0.04)',
    border: '1px solid rgba(var(--pg-fg-rgb),0.07)',
    display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  exampleDesc: {
    fontSize: '0.72rem', color: 'var(--pg-text-4)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1,
  },
  autoRunHint: { fontSize: '0.7rem', color: 'rgba(var(--pg-fg-rgb),0.1)' },
  renderingBadge: { fontSize: '0.7rem', color: 'var(--pg-accent)', fontWeight: 600 },
  editorWrap: { flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' },

  dragHandle: {
    height: 8, background: 'rgba(var(--pg-fg-rgb),0.02)',
    borderTop: '1px solid rgba(var(--pg-fg-rgb),0.05)',
    borderBottom: '1px solid rgba(var(--pg-fg-rgb),0.05)',
    cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.15s', userSelect: 'none',
  },
  dragPills: { display: 'flex', gap: 3 },
  dragPill: { width: 20, height: 2, borderRadius: 999, background: 'rgba(var(--pg-fg-rgb),0.1)', display: 'block' },

  previewPane: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
  previewLabel: {
    fontSize: '0.75rem', fontWeight: 600, color: 'var(--pg-text-4)',
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  },
  previewHint:        { fontSize: '0.7rem', color: 'rgba(var(--pg-fg-rgb),0.08)' },
  previewHintVue:     { fontSize: '0.7rem', color: 'rgba(65,184,131,0.4)' },
  previewHintVanilla: { fontSize: '0.7rem', color: 'rgba(247,223,30,0.4)' },
  vueLiveBadge: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: '0.72rem', color: '#41b883', padding: '2px 8px', borderRadius: 4,
    background: 'rgba(65,184,131,0.08)', border: '1px solid rgba(65,184,131,0.15)', fontWeight: 600,
  },
  vanillaLiveBadge: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: '0.72rem', color: '#f7df1e', padding: '2px 8px', borderRadius: 4,
    background: 'rgba(247,223,30,0.08)', border: '1px solid rgba(247,223,30,0.15)', fontWeight: 600,
  },
  loadingDots: { display: 'flex', gap: 1, color: 'var(--pg-text-4)', fontSize: 18, lineHeight: '1' },
  dot: { display: 'inline-block' },
  // Always dark, not themed — sits directly behind the preview iframes,
  // which render a fixed-dark "live app" regardless of site theme.
  iframeWrap: { flex: 1, minHeight: 0, background: '#09090b' },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },

  footer: {
    height: 36, background: 'var(--pg-bg-raised)', borderTop: '1px solid rgba(var(--pg-fg-rgb),0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', flexShrink: 0, gap: 12,
  },
  footerLeft: {
    fontSize: '0.72rem', color: 'var(--pg-text-5)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
  },
  inlineCode: {
    fontFamily: 'monospace', background: 'rgba(var(--pg-fg-rgb),0.05)',
    padding: '1px 5px', borderRadius: 4, color: 'var(--pg-text-3)', fontSize: '0.68rem',
  },
  footerLink: {
    color: 'var(--pg-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.72rem',
    opacity: 0.85, flexShrink: 0,
  },
}

// Route default export — returns null because KeepAlive.tsx in the root layout
// owns the actual rendering via position:fixed + display:none persistence.
export default function Page() { return null }
