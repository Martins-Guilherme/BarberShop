'use client'

import { useTable, type ColumnDef } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { features, type DataTableFeatures } from '../admin/data-table-features'
import { bookingColumns, type AdminBooking } from './bookings-columns'

interface BookingsDataTableProps {
  bookings: AdminBooking[]
}

export function BookingsDataTable({ bookings }: BookingsDataTableProps) {
  const columns: ColumnDef<DataTableFeatures, AdminBooking>[] = bookingColumns
  const table = useTable({
    features,
    data: bookings,
    columns,
  })

  return (
    <div className="overflow-x-auto [&>div::-webkit-scrollbar]:hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={bookingColumns.length}
                className="h-24 text-center"
              >
                Nenhum agendamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
