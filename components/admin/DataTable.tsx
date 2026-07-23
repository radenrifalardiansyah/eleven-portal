"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { LayoutGrid, List, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export default function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Cari...",
  renderCard,
  getRowId,
  actions,
  showRowNumber = true,
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  searchPlaceholder?: string;
  renderCard: (row: T) => React.ReactNode;
  getRowId?: (row: T) => string;
  actions?: React.ReactNode;
  showRowNumber?: boolean;
}) {
  const [view, setView] = useState<"table" | "card">("table");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getRowId,
    initialState: { pagination: { pageSize: 10 } },
  });

  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.getState().pagination;
  const columnCount = columns.length + (showRowNumber ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-ink-900/10 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-ink-900/10 bg-white p-1">
            <button
              onClick={() => setView("table")}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                view === "table" ? "bg-brand-blue/10 text-brand-blue" : "text-ink-500 hover:bg-ink-900/5"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("card")}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                view === "card" ? "bg-brand-blue/10 text-brand-blue" : "text-ink-500 hover:bg-ink-900/5"
              }`}
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {actions}
        </div>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-ink-900/5 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/5 bg-ink-900/[0.02]">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {showRowNumber && (
                    <th className="w-10 whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      #
                    </th>
                  )}
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="flex items-center gap-1 normal-case disabled:cursor-default"
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3" />}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.015]">
                  {showRowNumber && (
                    <td className="px-4 py-3 align-middle text-ink-500">{pageIndex * pageSize + i + 1}</td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle text-ink-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-10 text-center text-ink-500">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div key={row.id}>{renderCard(row.original)}</div>
          ))}
          {rows.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-ink-500">Tidak ada data.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-ink-500">
        <span>
          Halaman {pageIndex + 1} dari {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-700 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 text-ink-700 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
