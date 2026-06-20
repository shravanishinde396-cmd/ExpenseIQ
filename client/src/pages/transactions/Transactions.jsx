import React, { useState } from 'react';
import { useTransactions, useBulkDeleteTransactions } from '../../hooks/useTransactions';
import { Card, Input, Button, Badge, toast } from '../../components/ui';
import { Search, Filter, Download, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import CurrencyDisplay from '../../components/shared/CurrencyDisplay';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import Papa from 'papaparse';

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch transactions query
  const queryParams = {
    page,
    limit: 10,
    type,
    category,
    startDate,
    endDate,
    search
  };

  const { data: resData, isLoading } = useTransactions(queryParams);
  const { transactions = [], totalPages = 1, totalTransactions = 0 } = resData?.data || {};

  // Delete mutation
  const bulkDeleteMutation = useBulkDeleteTransactions();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(transactions.map((tx) => tx._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected transactions?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedIds);
        setSelectedIds([]);
        toast.success('Selected transactions deleted.');
      } catch (error) {
        toast.error('Failed to delete transactions.');
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    // Prepare data for export
    const exportData = transactions.map((tx) => ({
      Title: tx.title,
      Type: tx.type,
      Amount: (tx.amount / 100).toFixed(2),
      Category: tx.category,
      Date: formatDate(tx.date),
      'Payment Method': tx.paymentMethod || 'N/A',
      Description: tx.description || tx.notes || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `expenseiq_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions exported to CSV!');
  };

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6 text-primary" />
            Transaction History
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Query, filter, and audit all financial activities in a tabular register.
          </p>
        </div>

        <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2 font-bold w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          {/* Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Title, notes..."
                className="flex h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
            />
          </div>

          {/* Date Range End */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
            />
          </div>

          {/* Clear Filters */}
          <Button onClick={clearFilters} variant="outline" className="w-full font-bold">
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-4 rounded-xl shadow-lg flex justify-between items-center animate-fade-in border border-white/10">
          <span className="text-xs font-bold">
            {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <Button
            onClick={handleBulkDelete}
            variant="danger"
            className="flex items-center gap-2 font-bold py-1.5 h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Transactions Card */}
      <Card className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md p-6">
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : transactions.length === 0 ? (
          <EmptyState title="No Records Match" message="Try relaxing your filters or query parameters." icon={Filter} />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs text-slate-400 font-semibold uppercase">
                    <th className="pb-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === transactions.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                    </th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category / Source</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {transactions.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    const isChecked = selectedIds.includes(tx._id);
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 w-10">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(tx._id, e.target.checked)}
                            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                          />
                        </td>
                        <td className="py-3.5 pr-2 font-bold text-slate-800 dark:text-white">
                          {tx.title}
                        </td>
                        <td className="py-3.5">
                          <Badge variant={isExpense ? "danger" : "success"}>
                            {tx.category}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-slate-500">{formatDate(tx.date)}</td>
                        <td className="py-3.5">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {tx.paymentMethod || 'Transfer'}
                          </span>
                        </td>
                        <td className={`py-3.5 text-right font-bold ${
                          isExpense ? 'text-danger' : 'text-success'
                        }`}>
                          {isExpense ? '-' : '+'}<CurrencyDisplay value={tx.amount} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-xs text-muted-foreground font-semibold">
                Total {totalTransactions} record{totalTransactions > 1 ? 's' : ''}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
