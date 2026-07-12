import React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type RowId = string;
type ColumnId = string;
type PinPosition = 'left' | 'right' | null;
type SortDirection = 'asc' | 'desc';
type SelectionMode = 'none' | 'single' | 'multiple';
interface CellPosition {
    rowId: RowId;
    columnId: ColumnId;
    rowIndex: number;
    columnIndex: number;
}
interface SortModel {
    columnId: ColumnId;
    direction: SortDirection;
    comparator?: (a: unknown, b: unknown) => number;
    nullsFirst?: boolean;
}
type TextFilterOperator = 'contains' | 'notContains' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty';
type NumberFilterOperator = 'equals' | 'notEquals' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'between' | 'isEmpty' | 'isNotEmpty';
type DateFilterOperator = 'equals' | 'notEquals' | 'before' | 'after' | 'between' | 'isEmpty' | 'isNotEmpty';
type BooleanFilterOperator = 'equals' | 'isEmpty' | 'isNotEmpty';
interface TextColumnFilter {
    type: 'text';
    operator: TextFilterOperator;
    value: string;
    caseSensitive?: boolean;
    customFilter?: (value: unknown, row: unknown) => boolean;
}
interface NumberColumnFilter {
    type: 'number';
    operator: NumberFilterOperator;
    value: number;
    valueTo?: number;
    customFilter?: (value: unknown, row: unknown) => boolean;
}
interface DateColumnFilter {
    type: 'date';
    operator: DateFilterOperator;
    value: Date;
    valueTo?: Date;
    customFilter?: (value: unknown, row: unknown) => boolean;
}
interface BooleanColumnFilter {
    type: 'boolean';
    operator: BooleanFilterOperator;
    value: boolean;
    customFilter?: (value: unknown, row: unknown) => boolean;
}
type ColumnFilter = TextColumnFilter | NumberColumnFilter | DateColumnFilter | BooleanColumnFilter;
interface FilterModel {
    columns: Record<ColumnId, ColumnFilter>;
}
interface DataSourceParams {
    page: number;
    pageSize: number;
    sortModel: SortModel[];
    filterModel: FilterModel;
}
interface DataSourceResult<TData = unknown> {
    rows: TData[];
    totalCount: number;
}
interface IDataSource<TData = unknown> {
    getRows(params: DataSourceParams): Promise<DataSourceResult<TData>>;
}
interface ValidationResult {
    valid: boolean;
    error?: string;
}

declare enum GridEvent {
    DATA_SET = "data:set",
    DATA_CHANGED = "data:changed",
    DATA_LOADING = "data:loading",
    DATA_LOAD_ERROR = "data:loadError",
    DATA_REFRESH_REQUESTED = "data:refreshRequested",
    ROW_ADDED = "data:rowAdded",
    ROW_UPDATED = "data:rowUpdated",
    ROW_DELETED = "data:rowDeleted",
    SORT_REQUESTED = "sort:requested",
    SORT_COMPLETED = "sort:completed",
    FILTER_REQUESTED = "filter:requested",
    FILTER_COMPLETED = "filter:completed",
    PAGE_CHANGED = "pagination:pageChanged",
    PAGE_SIZE_CHANGED = "pagination:pageSizeChanged",
    PAGINATED_DATA_CHANGED = "pagination:dataChanged",
    ROW_CLICK_SELECTION = "selection:rowClick",
    CHECKBOX_ROW_CHANGED = "selection:checkboxRow",
    SELECT_ALL_TOGGLED = "selection:selectAllToggled",
    SELECTION_CHANGED = "selection:changed",
    SELECT_ALL_CHANGED = "selection:selectAllChanged",
    EDIT_START_REQUESTED = "edit:startRequested",
    EDIT_VALUE_CHANGED = "edit:valueChanged",
    EDIT_COMMIT_REQUESTED = "edit:commitRequested",
    EDIT_CANCEL_REQUESTED = "edit:cancelRequested",
    EDIT_STARTED = "edit:started",
    EDIT_COMMITTED = "edit:committed",
    EDIT_CANCELLED = "edit:cancelled",
    EDIT_VALIDATION_FAILED = "edit:validationFailed",
    COLUMN_VISIBILITY_CHANGED = "column:visibilityChanged",
    COLUMN_RESIZED = "column:resized",
    COLUMN_REORDERED = "column:reordered",
    COLUMN_PINNED_CHANGED = "column:pinnedChanged",
    CONTAINER_RESIZED = "viewport:containerResized",
    VIEWPORT_CHANGED = "viewport:changed",
    SCROLL_CHANGED = "viewport:scrollChanged",
    FOCUS_SET_REQUESTED = "focus:setRequested",
    FOCUS_MOVE_REQUESTED = "focus:moveRequested",
    FOCUS_CHANGED = "focus:changed",
    FOCUS_CLEARED = "focus:cleared",
    EXPORT_REQUESTED = "export:requested",
    EXPORT_STARTED = "export:started",
    EXPORT_COMPLETED = "export:completed",
    ANNOUNCE = "a11y:announce",
    GRID_READY = "lifecycle:ready",
    GRID_DESTROYED = "lifecycle:destroyed"
}

type EventHandler<T = unknown> = (payload: T) => void;
type Unsubscribe = () => void;
interface IEventBus {
    on<T>(event: GridEvent, handler: EventHandler<T>): Unsubscribe;
    once<T>(event: GridEvent, handler: EventHandler<T>): void;
    emit<T>(event: GridEvent, payload?: T): void;
    off(event: GridEvent, handler: EventHandler): void;
    clear(event: GridEvent): void;
    clearAll(): void;
}

interface RawNamespace {
    rows: unknown[];
    totalCount: number;
    loading: boolean;
    error: Error | null;
}
interface FilteredNamespace {
    rows: unknown[];
    matchCount: number;
    filterModel: FilterModel;
}
interface SortedNamespace {
    rows: unknown[];
    sortModel: SortModel[];
}
interface PaginatedNamespace {
    rows: unknown[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalRows: number;
    startRow: number;
    endRow: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
interface ColumnDefinition {
    id: ColumnId;
    field: string;
    header: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
    visible: boolean;
    pinned: PinPosition;
    resizable: boolean;
    sortable: boolean;
    filterable: boolean;
    editable: boolean;
}
interface ColumnsNamespace {
    definitions: ColumnDefinition[];
    order: ColumnId[];
    widths: Map<ColumnId, number>;
    visibility: Map<ColumnId, boolean>;
    pinState: Map<ColumnId, PinPosition>;
}
interface ViewportNamespace {
    visibleRows: unknown[];
    visibleColumnIds: ColumnId[];
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
    offsetTop: number;
    offsetLeft: number;
    totalHeight: number;
    totalWidth: number;
    scrollTop: number;
    scrollLeft: number;
    containerWidth: number;
    containerHeight: number;
    rowHeight: number;
}
interface SelectionNamespace {
    selectedIds: Set<RowId>;
    mode: SelectionMode;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    count: number;
    anchorId: RowId | null;
}
interface EditingNamespace {
    isEditing: boolean;
    editingCell: CellPosition | null;
    originalValue: unknown;
    currentValue: unknown;
    isValid: boolean;
    validationError: string | null;
}
interface FocusNamespace {
    focusedCell: CellPosition | null;
    previousCell: CellPosition | null;
}
interface StoreState {
    raw: RawNamespace;
    filtered: FilteredNamespace;
    sorted: SortedNamespace;
    paginated: PaginatedNamespace;
    columns: ColumnsNamespace;
    viewport: ViewportNamespace;
    selection: SelectionNamespace;
    editing: EditingNamespace;
    focus: FocusNamespace;
}
type NamespaceKey = keyof StoreState;
type StoreSubscriber<K extends NamespaceKey> = (state: StoreState[K]) => void;
type StoreUnsubscribe = () => void;
interface IDataStore {
    read<K extends NamespaceKey>(namespace: K): StoreState[K];
    write<K extends NamespaceKey>(namespace: K, update: Partial<StoreState[K]>, callerId?: string): void;
    registerOwner(namespace: NamespaceKey, pluginId: string): void;
    subscribe<K extends NamespaceKey>(namespace: K, subscriber: StoreSubscriber<K>): StoreUnsubscribe;
    snapshot(): StoreState;
    subscribeToRow(rowId: RowId, handler: (data: unknown) => void): StoreUnsubscribe;
    notifyRow(rowId: RowId, data: unknown): void;
}

interface Plugin {
    id: string;
    init(context: PluginContext): void;
    destroy(): void;
}
interface PluginContext {
    eventBus: IEventBus;
    store: IDataStore;
    getPlugin<T extends Plugin>(id: string): T | null;
}
interface IKernel {
    register(plugin: Plugin): void;
    init(): void;
    get<T extends Plugin>(id: string): T | null;
    readonly eventBus: IEventBus;
    readonly store: IDataStore;
    destroy(): void;
}
declare class Kernel implements IKernel {
    readonly eventBus: IEventBus;
    readonly store: IDataStore;
    private plugins;
    private initialized;
    constructor();
    register(plugin: Plugin): void;
    init(): void;
    get<T extends Plugin>(id: string): T | null;
    destroy(): void;
}
interface DataSourceConfig<TData = unknown> {
    data?: TData[];
    dataSource?: IDataSource<TData>;
    pageSize?: number;
    rowId?: string | ((row: TData) => string);
}
declare class DataSourcePlugin<TData = unknown> implements Plugin {
    readonly id = "data-source";
    private context;
    private config;
    private currentRequestId;
    private cleanups;
    configure(config: DataSourceConfig<TData>): void;
    init(context: PluginContext): void;
    load(params?: Partial<DataSourceParams>): Promise<void>;
    private loadStatic;
    private loadAsync;
    private handleRefresh;
    setData(data: TData[]): void;
    addRow(row: TData, index?: number): void;
    private extractRowId;
    updateRow(rowId: string, changes: Partial<TData>): void;
    deleteRow(rowId: string): void;
    destroy(): void;
}
interface NormalizedRow {
    _id: RowId;
    _index: number;
    _data: unknown;
}
interface RowModelConfig {
    rowId?: string | ((row: unknown) => RowId);
}
declare class RowModelPlugin implements Plugin {
    readonly id = "row-model";
    private context;
    private config;
    private rowMap;
    private rowOrder;
    private dataToId;
    private autoIdCounter;
    private cleanups;
    configure(config: RowModelConfig): void;
    init(context: PluginContext): void;
    private handleDataSet;
    private handleRowAdded;
    private handleRowUpdated;
    private handleRowDeleted;
    private buildFromRows;
    private normalizeRow;
    private extractId;
    getRow(id: RowId): NormalizedRow | null;
    getIdForData(data: unknown): RowId | null;
    getRowData(id: RowId): unknown | null;
    getAllRows(): NormalizedRow[];
    getAllRowData(): unknown[];
    getRowIndex(id: RowId): number;
    getRowCount(): number;
    hasRow(id: RowId): boolean;
    getRowIds(): RowId[];
    destroy(): void;
}
interface ColumnInput {
    id?: ColumnId;
    field: string;
    header: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
    visible?: boolean;
    pinned?: PinPosition;
    resizable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    editable?: boolean;
}
interface ColumnModelConfig {
    columns: ColumnInput[];
    defaultWidth?: number;
    defaultMinWidth?: number;
    defaultResizable?: boolean;
    defaultSortable?: boolean;
    defaultFilterable?: boolean;
}
declare class ColumnModelPlugin implements Plugin {
    readonly id = "column-model";
    private context;
    private config;
    private columnMap;
    private columnOrder;
    private autoIdCounter;
    private cleanups;
    configure(config: ColumnModelConfig): void;
    init(context: PluginContext): void;
    private buildFromConfig;
    private syncToStore;
    private generateId;
    getColumn(id: ColumnId): ColumnDefinition | null;
    getAllColumns(): ColumnDefinition[];
    getVisibleColumns(): ColumnDefinition[];
    getPinnedColumns(position: 'left' | 'right'): ColumnDefinition[];
    getCenterColumns(): ColumnDefinition[];
    getColumnCount(): number;
    hasColumn(id: ColumnId): boolean;
    setVisible(id: ColumnId, visible: boolean): void;
    setWidth(columnId: ColumnId, width: number, containerWidth?: number): void;
    setPinned(id: ColumnId, position: PinPosition): void;
    moveColumn(id: ColumnId, toIndex: number): void;
    getColumnState(): {
        columnId: string;
        width: number;
        visible: boolean;
        pinned: PinPosition;
        index: number;
    }[];
    applyColumnState(state: Array<{
        columnId: ColumnId;
        width?: number;
        visible?: boolean;
        pinned?: PinPosition;
        index?: number;
    }>): void;
    destroy(): void;
}
interface FilterConfig {
    caseSensitive?: boolean;
    debounceMs?: number;
}
declare class FilterPlugin implements Plugin {
    readonly id = "filter";
    private context;
    private config;
    private filterModel;
    private compiledFilters;
    private cleanups;
    configure(config: FilterConfig): void;
    init(context: PluginContext): void;
    private handleDataChanged;
    private handleFilterRequested;
    private compileFilters;
    private applyFilters;
    private rowMatchesAllFilters;
    private matchesCompiledFilter;
    private matchesTextFilter;
    private matchesNumberFilter;
    private matchesDateFilter;
    private matchesBooleanFilter;
    private makeGetter;
    getFilterModel(): FilterModel;
    setFilterModel(model: FilterModel): void;
    setColumnFilter(columnId: string, filter: ColumnFilter): void;
    clearColumnFilter(columnId: string): void;
    clearAll(): void;
    getMatchCount(): number;
    destroy(): void;
}
interface SortConfig {
    multiSort?: boolean;
    multiSortKey?: 'shift' | 'ctrl';
    defaultDirection?: SortDirection;
    nullsFirst?: boolean;
}
declare class SortPlugin implements Plugin {
    readonly id = "sort";
    private context;
    private config;
    private sortModel;
    private cache;
    private cacheKeys;
    private static readonly MAX_CACHE;
    private filteredVersion;
    private collator;
    private cleanups;
    configure(config: SortConfig): void;
    init(context: PluginContext): void;
    private handleFilterCompleted;
    private handleSortRequested;
    private applySort;
    private performSort;
    private numericIndexSort;
    private detectType;
    private makeGetter;
    private extractValue;
    private getCacheKey;
    getSortModel(): SortModel[];
    setSortModel(model: SortModel[]): void;
    addSort(columnId: string, direction: SortDirection): void;
    removeSort(columnId: string): void;
    clearSort(): void;
    cycleSort(columnId: string): void;
    destroy(): void;
}
interface PaginationConfig {
    enabled?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
}
declare class PaginationPlugin implements Plugin {
    readonly id = "pagination";
    private context;
    private config;
    private currentPage;
    private pageSize;
    private enabled;
    private cleanups;
    configure(config: PaginationConfig): void;
    init(context: PluginContext): void;
    private handleSortCompleted;
    private handleFilterCompleted;
    private resetToFirstPage;
    private applyPagination;
    setPage(page: number): void;
    setPageSize(size: number): void;
    nextPage(): void;
    previousPage(): void;
    firstPage(): void;
    lastPage(): void;
    getPaginationState(): PaginatedNamespace;
    getCurrentPage(): number;
    getPageSize(): number;
    destroy(): void;
}
interface ViewportConfig {
    rowHeight?: number;
    headerHeight?: number;
    bufferSize?: number;
}
declare class ViewportPlugin implements Plugin {
    readonly id = "viewport";
    private context;
    private config;
    private containerWidth;
    private containerHeight;
    private scrollTop;
    private scrollLeft;
    private rowHeight;
    private headerHeight;
    private bufferSize;
    private cleanups;
    configure(config: ViewportConfig): void;
    init(context: PluginContext): void;
    private handleContainerResized;
    private handleScrollChanged;
    private handlePaginationChanged;
    private handleColumnChanged;
    private calculateTotalWidth;
    private calculateViewport;
    scrollToRow(rowIndex: number): void;
    scrollToColumn(columnId: ColumnId): void;
    getViewportState(): ViewportNamespace;
    getRowHeight(): number;
    getTotalHeight(): number;
    getRowAtScrollPosition(scrollTop: number): number;
    getScrollPositionForRow(rowIndex: number): number;
    destroy(): void;
}
interface SelectionConfig {
    mode?: SelectionMode;
    selectAllScope?: 'page' | 'all';
    deselectOnClick?: boolean;
}
declare class SelectionPlugin implements Plugin {
    readonly id = "selection";
    private context;
    private config;
    private mode;
    private selectedIds;
    private _selectAllActive;
    private _deselectedAfterSelectAll;
    private anchorId;
    private cleanups;
    configure(config: SelectionConfig): void;
    private extractRowId;
    init(context: PluginContext): void;
    private handleRowClick;
    private handleCheckboxRow;
    private handleSelectAllToggled;
    private handlePageChanged;
    private handleDataSet;
    private handleRowDeleted;
    private applySingleClick;
    private applyCtrlClick;
    private applyShiftClick;
    private commit;
    private syncToStore;
    private emitEvents;
    private computeSelectAllState;
    selectRow(rowId: RowId): void;
    deselectRow(rowId: RowId): void;
    toggleRow(rowId: RowId): void;
    selectAll(): void;
    deselectAll(): void;
    isSelected(rowId: RowId): boolean;
    getSelectedIds(): RowId[];
    getSelectedCount(): number;
    getMode(): SelectionMode;
    setMode(mode: SelectionMode): void;
    getSelectionState(): SelectionNamespace;
    destroy(): void;
}
type EditorType = 'text' | 'number' | 'select' | 'date' | 'boolean';
interface SelectOption {
    label: string;
    value: unknown;
}
type CellValidator = (value: unknown, cell: CellPosition) => ValidationResult | Promise<ValidationResult>;
interface ColumnEditorConfig {
    type: EditorType;
    options?: SelectOption[] | ((row: unknown) => SelectOption[]);
    validator?: CellValidator;
    min?: number;
    max?: number;
    step?: number;
    minDate?: Date;
    maxDate?: Date;
}
interface EditConfig {
    validator?: CellValidator;
}
declare class EditPlugin implements Plugin {
    readonly id = "edit";
    private context;
    private config;
    private columnEditors;
    private validationGeneration;
    private cleanups;
    configure(config: EditConfig): void;
    init(context: PluginContext): void;
    private handleStartRequested;
    private handleValueChanged;
    private handleCommitRequested;
    private handleCancelRequested;
    private handleDataSet;
    private handleRowDeleted;
    private doCommit;
    private runValidation;
    private runBuiltInValidation;
    private readCellValue;
    private getEditorType;
    private writeIdle;
    registerColumnEditor(columnId: string, config: ColumnEditorConfig): void;
    unregisterColumnEditor(columnId: string): void;
    getColumnEditor(columnId: string): ColumnEditorConfig | undefined;
    startEdit(cell: CellPosition): void;
    commitEdit(): void;
    cancelEdit(): void;
    isEditing(): boolean;
    getEditingCell(): CellPosition | null;
    getEditState(): EditingNamespace;
    destroy(): void;
}
type ExportScope = 'all' | 'filtered' | 'page' | 'selected';
interface ExportOptions {
    scope?: ExportScope;
    filename?: string;
    columns?: ColumnId[];
    includeHeader?: boolean;
    delimiter?: string;
}
declare class ExportPlugin implements Plugin {
    readonly id = "export";
    private context;
    init(context: PluginContext): void;
    export(options?: ExportOptions): void;
    private resolveRows;
    private resolveColumnIds;
    private buildCsv;
    destroy(): void;
}
type AnnouncePriority = 'polite' | 'assertive';
interface AnnouncementMessages {
    focusCell?: (rowIndex: number, columnId: string, columnHeader: string) => string;
    sortApplied?: (field: string, direction: 'asc' | 'desc') => string;
    sortCleared?: (field: string) => string;
    allSortsCleared?: () => string;
    filterApplied?: (matchCount: number) => string;
    filterCleared?: () => string;
    pageChanged?: (page: number, totalPages: number) => string;
    selectionChanged?: (count: number) => string;
    selectionCleared?: () => string;
    editStarted?: (columnId: string, currentValue: string) => string;
    editCommitted?: (columnId: string, newValue: string) => string;
    editCancelled?: () => string;
}
interface AnnouncementToggles {
    focus?: boolean;
    sort?: boolean;
    filter?: boolean;
    page?: boolean;
    selection?: boolean;
    edit?: boolean;
}
interface AnnouncementConfig {
    announce?: AnnouncementToggles;
    messages?: AnnouncementMessages;
}
declare class AnnouncementPlugin implements Plugin {
    readonly id = "announcement";
    private context;
    private config;
    private messages;
    private toggles;
    constructor(config?: AnnouncementConfig);
    init(context: PluginContext): void;
    private subscribe;
    private announceToggle;
    announce(message: string, priority?: AnnouncePriority): void;
    updateMessages(messages: Partial<AnnouncementMessages>): void;
    updateToggles(toggles: Partial<AnnouncementToggles>): void;
    private getHeaderById;
    destroy(): void;
}
type FocusDirection = 'up' | 'down' | 'left' | 'right' | 'next' | 'prev' | 'rowStart' | 'rowEnd' | 'first' | 'last';
declare class FocusPlugin implements Plugin {
    readonly id = "focus";
    private context;
    private cleanups;
    init(context: PluginContext): void;
    getFocusedCell(): CellPosition | null;
    setFocus(cell: CellPosition): void;
    clearFocus(): void;
    moveFocus(direction: FocusDirection, editableOnly?: boolean): void;
    resolve(from: CellPosition, direction: FocusDirection, editableOnly?: boolean): CellPosition | null;
    private resolveUp;
    private resolveDown;
    private resolveLeft;
    private resolveRight;
    private resolveNext;
    private resolvePrev;
    private resolveFirst;
    private resolveLast;
    private getRowIds;
    private getColumnIds;
    private makeCell;
    destroy(): void;
}
interface ColumnValueConfig {
    getter?: (row: unknown) => unknown;
    setter?: (row: unknown, value: unknown) => unknown;
    formatter?: (value: unknown, row: unknown) => string;
    exportFormatter?: (value: unknown, row: unknown) => string;
    parser?: (raw: string) => unknown;
}
declare class CellValuePlugin implements Plugin {
    readonly id = "cell-value";
    private context;
    private columnConfigs;
    init(context: PluginContext): void;
    registerColumnConfig(columnId: ColumnId, config: ColumnValueConfig): void;
    unregisterColumnConfig(columnId: ColumnId): void;
    getColumnConfig(columnId: ColumnId): ColumnValueConfig | undefined;
    getRawValue(row: unknown, columnId: ColumnId): unknown;
    getDisplayValue(row: unknown, columnId: ColumnId): string;
    getExportValue(row: unknown, columnId: ColumnId): string;
    parseValue(raw: string, columnId: ColumnId): unknown;
    setValue(row: unknown, columnId: ColumnId, value: unknown): unknown;
    getDisplayRow(row: unknown, columnIds: ColumnId[]): Record<ColumnId, string>;
    getExportRow(row: unknown, columnIds: ColumnId[]): Record<ColumnId, string>;
    private getField;
    destroy(): void;
}

interface ColumnDef<TData = unknown> {
    field: Extract<keyof TData, string> | string;
    header: string;
    size?: {
        width?: number;
        minWidth?: number;
        maxWidth?: number;
        flex?: number;
        resizable?: boolean;
    };
    display?: {
        pinned?: 'left' | 'right' | null;
        visible?: boolean;
        cellClass?: string | ((value: unknown, row: TData) => string);
        headerClass?: string;
        formatter?: (value: unknown, row: TData) => string;
        exportFormatter?: (value: unknown, row: TData) => string;
    };
    sort?: {
        enabled?: boolean;
        defaultDirection?: SortDirection;
        comparator?: (a: unknown, b: unknown) => number;
        nullsFirst?: boolean;
    };
    filter?: {
        enabled?: boolean;
        type?: 'text' | 'number' | 'date' | 'boolean';
        customFilter?: (value: unknown, row: TData) => boolean;
    };
    edit?: {
        enabled?: boolean | ((row: TData) => boolean);
        type?: 'text' | 'number' | 'dropdown' | 'date' | 'boolean';
        minDate?: Date;
        maxDate?: Date;
        options?: string[];
        min?: number;
        max?: number;
        parser?: (value: string) => unknown;
        validator?: (value: unknown, row: TData) => string | null | Promise<string | null>;
    };
    value?: {
        getter?: (row: TData) => unknown;
        setter?: (row: TData, value: unknown) => TData;
    };
}
interface GridOptions<TData = unknown> {
    columns: ColumnDef<TData>[];
    data?: TData[];
    dataSource?: IDataSource<TData>;
    rowId?: keyof TData | ((row: TData) => string);
    sorting?: {
        enabled?: boolean;
        multiSort?: boolean;
        multiSortKey?: 'shift' | 'ctrl';
        defaultDirection?: SortDirection;
        nullsFirst?: boolean;
    };
    filtering?: {
        enabled?: boolean;
        caseSensitive?: boolean;
        debounceMs?: number;
        iconPosition?: 'left' | 'right';
        showIconOnHover?: boolean;
        filterIcon?: React.ReactNode;
        activeFilterIcon?: React.ReactNode;
        popoverPlacement?: 'bottom' | 'top' | 'auto';
    };
    pagination?: {
        enabled?: boolean;
        pageSize?: number;
        pageSizeOptions?: number[];
        showPageSizeSelector?: boolean;
        showRowCount?: boolean;
        showPageNumbers?: boolean;
    };
    selection?: {
        mode?: 'none' | 'single' | 'multiple';
        selectAllScope?: 'page' | 'all';
        showCheckboxes?: boolean;
        selectOnRowClick?: boolean;
        checkboxOnly?: boolean;
    };
    editing?: {
        enabled?: boolean;
        trigger?: 'click' | 'doubleClick';
        confirmOnEnter?: boolean;
        cancelOnEscape?: boolean;
        moveOnTab?: boolean;
    };
    appearance?: {
        theme?: 'light' | 'dark' | 'auto';
        density?: 'compact' | 'normal' | 'comfortable';
        rowHeight?: number;
        headerHeight?: number;
        rowStriping?: boolean;
        showColumnBorders?: boolean;
        showHoverHighlight?: boolean;
        className?: string;
        style?: React.CSSProperties;
        emptyState?: {
            title?: string;
            description?: string;
            icon?: React.ReactNode;
        };
        filteredEmptyState?: {
            title?: string;
            description?: string;
            icon?: React.ReactNode;
        };
        emptyStateComponent?: React.ComponentType;
        loadingState?: {
            message?: string;
        };
        loadingComponent?: React.ComponentType;
        errorComponent?: React.ComponentType<{
            error: Error;
        }>;
    };
    scroll?: {
        bufferSize?: number;
    };
    export?: {
        filename?: string;
        scope?: 'all' | 'filtered' | 'page' | 'selected';
    };
    accessibility?: {
        gridLabel?: string;
        announceFocus?: boolean;
        announceSort?: boolean;
        announceFilter?: boolean;
        announceSelection?: boolean;
        announceEdit?: boolean;
        announcePage?: boolean;
    };
    events?: {
        onReady?: (api: GridAPI<TData>) => void;
        onRowClick?: (row: TData, event: MouseEvent) => void;
        onRowDoubleClick?: (row: TData, event: MouseEvent) => void;
        onEditStart?: (rowId: string, field: string) => void;
        onEditCommit?: (rowId: string, field: string, value: unknown) => void;
        onEditCancel?: (rowId: string, field: string) => void;
        onSortChange?: (model: Array<{
            columnId: string;
            direction: SortDirection;
        }>) => void;
        onFilterChange?: (model: Record<string, unknown>) => void;
        onSelectionChange?: (rows: TData[]) => void;
        onPageChange?: (page: number, pageSize: number) => void;
        onColumnResize?: (columnId: string, width: number) => void;
        onColumnReorder?: (columnIds: string[]) => void;
        onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
        onRowAdd?: (row: TData) => void;
        onRowUpdate?: (id: string, changes: Partial<TData>) => void;
        onRowDelete?: (id: string) => void;
        onScrollChange?: (scrollTop: number, scrollLeft: number) => void;
    };
}
interface ColumnState {
    columnId: string;
    width: number;
    visible: boolean;
    pinned: 'left' | 'right' | null;
    index: number;
}
interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    startRow: number;
    endRow: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
interface GridAPI<TData = unknown> {
    setData(rows: TData[]): void;
    getData(): TData[];
    getDisplayedRows(): TData[];
    refreshData(): Promise<void>;
    addRow(row: TData, index?: number): void;
    updateRow(id: string, changes: Partial<TData>): void;
    deleteRow(id: string): void;
    deleteRows(ids: string[]): void;
    setColumnVisible(id: string, visible: boolean): void;
    setColumnWidth(id: string, width: number): void;
    setColumnPinned(id: string, position: 'left' | 'right' | null): void;
    moveColumn(id: string, toIndex: number): void;
    getAllColumns(): ColumnDef<TData>[];
    getVisibleColumns(): ColumnDef<TData>[];
    getColumnState(): ColumnState[];
    applyColumnState(state: ColumnState[]): void;
    setSortModel(model: Array<{
        columnId: string;
        direction: SortDirection;
    }>): void;
    getSortModel(): Array<{
        columnId: string;
        direction: SortDirection;
    }>;
    clearSort(): void;
    setFilterModel(model: Record<string, unknown>): void;
    getFilterModel(): Record<string, unknown>;
    setColumnFilter(columnId: string, filter: unknown): void;
    clearColumnFilter(columnId: string): void;
    clearFilters(): void;
    selectRow(id: string): void;
    deselectRow(id: string): void;
    toggleRow(id: string): void;
    selectAll(): void;
    deselectAll(): void;
    isRowSelected(id: string): boolean;
    getSelectedRows(): TData[];
    getSelectedIds(): Set<string>;
    startEditing(rowId: string, columnId: string): void;
    stopEditing(save?: boolean): void;
    isEditing(): boolean;
    getEditingCell(): {
        rowId: string;
        columnId: string;
        rowIndex: number;
        columnIndex: number;
    } | null;
    setPage(page: number): void;
    setPageSize(size: number): void;
    nextPage(): void;
    previousPage(): void;
    firstPage(): void;
    lastPage(): void;
    getPaginationState(): PaginationState;
    scrollToRow(rowId: string): void;
    scrollToColumn(columnId: string): void;
    scrollToCell(rowId: string, columnId: string): void;
    exportCSV(options?: {
        filename?: string;
        scope?: 'all' | 'filtered' | 'page' | 'selected';
        columns?: string[];
        includeHeader?: boolean;
        delimiter?: string;
    }): void;
    destroy(): void;
}
interface GridInstance<TData = unknown> {
    readonly kernel: Kernel;
    readonly options: GridOptions<TData>;
    readonly plugins: {
        dataSource: DataSourcePlugin<TData>;
        rowModel: RowModelPlugin;
        columnModel: ColumnModelPlugin;
        filter: FilterPlugin;
        sort: SortPlugin;
        pagination: PaginationPlugin;
        viewport: ViewportPlugin;
        selection: SelectionPlugin;
        edit: EditPlugin;
        cellValue: CellValuePlugin;
        focus: FocusPlugin;
        announcement: AnnouncementPlugin;
        export: ExportPlugin;
    };
    updateEvents(events: GridOptions<TData>['events']): void;
}
declare function createGrid<TData = unknown>(options: GridOptions<TData>): GridInstance<TData>;

interface GridProps<TData = unknown> {
    grid: GridInstance<TData>;
}
declare function Grid<TData = unknown>({ grid }: GridProps<TData>): react_jsx_runtime.JSX.Element;

declare function useViewportState(grid: GridInstance): ViewportNamespace;
declare function useColumnsState(grid: GridInstance): ColumnsNamespace;
declare function usePaginationState(grid: GridInstance): PaginatedNamespace;
declare function useSortedState(grid: GridInstance): SortedNamespace;
declare function useRawState(grid: GridInstance): RawNamespace;

export { type AnnouncementMessages, type ColumnDef, Grid, type GridAPI, GridEvent, type GridInstance, type GridOptions, createGrid, useColumnsState, usePaginationState, useRawState, useSortedState, useViewportState };
