import React, { useState } from 'react';
import { Card, Button, toast } from '../../components/ui';
import { FileText, FileSpreadsheet, Download, Calendar, ShieldAlert } from 'lucide-react';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getApiUrl = (format) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${baseUrl}/reports/${format}?${params.toString()}`;
  };

  const handleDownload = (format) => {
    try {
      const url = getApiUrl(format);
      
      // Open the window directly, since credentials are in httpOnly cookie, browser automatically attaches it
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.setAttribute('download', `statement.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${format.toUpperCase()} statement download initialized.`);
    } catch (error) {
      toast.error('Failed to download report.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Financial Statements
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Export full ledger balance sheets and transactional registries in standard formats.
        </p>
      </div>

      {/* Date Range Selection Card */}
      <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          Configure Statement Period
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-900"
            />
          </div>
        </div>
      </Card>

      {/* Download Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Card */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800 dark:text-white">PDF Ledger Statement</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Generate a formal, styled invoice-grade document containing a statement summary cards, net savings progress, and a chronological tabular registry.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => handleDownload('pdf')} 
            className="mt-6 flex items-center justify-center gap-2 font-bold bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="h-4 w-4" />
            Generate PDF
          </Button>
        </Card>

        {/* Excel Card */}
        <Card className="p-6 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800 dark:text-white">Excel Workbook Spreadsheet</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Download a fully interactive multi-sheet workbook containing separate sections for Incomes and Expenses, formatted columns, headers, and formulas.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => handleDownload('excel')} 
            className="mt-6 flex items-center justify-center gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-4 w-4" />
            Generate Excel
          </Button>
        </Card>
      </div>
    </div>
  );
}
