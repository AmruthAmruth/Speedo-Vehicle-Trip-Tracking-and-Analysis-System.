import React from 'react';
import { cn } from '../../../utils/cn';

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="relative w-full overflow-auto rounded-xl border border-slate-100">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);

export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("[&_tr]:border-b bg-slate-50/50", className)} {...props} />
);

export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

export const TableFooter = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tfoot className={cn("border-t bg-slate-50/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
);

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      "border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100",
      className
    )}
    {...props}
  />
);

export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-semibold text-slate-600 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 text-slate-600", className)} {...props} />
);

export const TableCaption = ({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption className={cn("mt-4 text-sm text-slate-500", className)} {...props} />
);
