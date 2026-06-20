const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { ExpenseModel } = require('../models/Expense.model');
const { IncomeModel } = require('../models/Income.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getReportData = async (userId, startDate, endDate) => {
  const query = { userId };
  if (startDate || endDate) {
    const range = {};
    if (startDate) range.$gte = new Date(startDate);
    if (endDate) range.$lte = new Date(endDate);
    query.date = range;
  }

  const [expenses, incomes] = await Promise.all([
    ExpenseModel.find(query).sort({ date: -1 }).lean(),
    IncomeModel.find(query).sort({ date: -1 }).lean()
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
  const netSavings = totalIncomes - totalExpenses;

  return { expenses, incomes, totalExpenses, totalIncomes, netSavings };
};

const generatePDFReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { expenses, incomes, totalExpenses, totalIncomes, netSavings } = 
    await getReportData(req.user._id, startDate, endDate);

  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Spenwise_Statement_${new Date().toISOString().split('T')[0]}.pdf`
  );

  doc.pipe(res);

  // Styling / Theme colors
  const primaryColor = '#4F46E5';
  const textColor = '#1E293B';
  const mutedTextColor = '#64748B';

  // Title Block
  doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Spenwise', 50, 50);
  doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text('Financial Statement', 50, 80);
  doc.fillColor(mutedTextColor).fontSize(9).font('Helvetica').text(
    `Generated on: ${new Date().toLocaleString()} | Period: ${startDate || 'All Time'} to ${endDate || 'Present'}`,
    50,
    100
  );

  doc.moveDown(2);

  // Account Summary Card
  const summaryY = 130;
  doc.rect(50, summaryY, 512, 70).fill('#F8FAFC');
  
  doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text('STATEMENT SUMMARY', 65, summaryY + 12);
  
  doc.fillColor(mutedTextColor).fontSize(8).font('Helvetica').text('Total Inflow', 65, summaryY + 32);
  doc.fillColor('#10B981').fontSize(11).font('Helvetica-Bold').text(`₹${(totalIncomes / 100).toFixed(2)}`, 65, summaryY + 44);

  doc.fillColor(mutedTextColor).fontSize(8).font('Helvetica').text('Total Outflow', 220, summaryY + 32);
  doc.fillColor('#EF4444').fontSize(11).font('Helvetica-Bold').text(`₹${(totalExpenses / 100).toFixed(2)}`, 220, summaryY + 44);

  doc.fillColor(mutedTextColor).fontSize(8).font('Helvetica').text('Net Savings', 380, summaryY + 32);
  doc.fillColor(netSavings >= 0 ? '#4F46E5' : '#EF4444').fontSize(11).font('Helvetica-Bold').text(`₹${(netSavings / 100).toFixed(2)}`, 380, summaryY + 44);

  // Table header
  let y = 230;
  doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text('Transaction History Ledger', 50, y);
  y += 20;

  doc.rect(50, y, 512, 18).fill('#E2E8F0');
  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('DATE', 60, y + 5);
  doc.text('TITLE / DESCRIPTION', 140, y + 5);
  doc.text('CATEGORY', 330, y + 5);
  doc.text('TYPE', 420, y + 5);
  doc.text('AMOUNT', 490, y + 5);

  y += 22;

  const combined = [
    ...expenses.map((e) => ({ ...e, type: 'expense' })),
    ...incomes.map((i) => ({ ...i, type: 'income', title: i.source, category: i.type }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Loop transactions
  doc.font('Helvetica').fontSize(8);
  combined.forEach((tx) => {
    // If running out of page space, create new page
    if (y > 700) {
      doc.addPage();
      y = 50;
      doc.rect(50, y, 512, 18).fill('#E2E8F0');
      doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('DATE', 60, y + 5);
      doc.text('TITLE / DESCRIPTION', 140, y + 5);
      doc.text('CATEGORY', 330, y + 5);
      doc.text('TYPE', 420, y + 5);
      doc.text('AMOUNT', 490, y + 5);
      y += 22;
      doc.font('Helvetica').fontSize(8);
    }

    doc.fillColor(textColor);
    
    // Format Date safely
    let formattedDate = 'N/A';
    try {
      formattedDate = new Date(tx.date).toLocaleDateString();
    } catch (_) {}

    doc.text(formattedDate, 60, y);
    doc.text(tx.title || 'Untitled', 140, y, { width: 180, ellipsis: true });
    doc.text(tx.category || 'Other', 330, y);
    
    const isExp = tx.type === 'expense';
    doc.fillColor(isExp ? '#EF4444' : '#10B981');
    doc.text(isExp ? 'EXPENSE' : 'INCOME', 420, y);
    doc.text(`${isExp ? '-' : '+'}₹${(tx.amount / 100).toFixed(2)}`, 490, y);

    y += 18;
  });

  doc.end();
});

const generateExcelReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { expenses, incomes } = await getReportData(req.user._id, startDate, endDate);

  const workbook = new ExcelJS.Workbook();
  
  // Expenses Sheet
  const expenseSheet = workbook.addWorksheet('Expenses');
  expenseSheet.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Amount (INR)', key: 'amount', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Description', key: 'description', width: 35 }
  ];

  expenses.forEach((e) => {
    expenseSheet.addRow({
      title: e.title,
      category: e.category,
      amount: e.amount / 100,
      date: new Date(e.date).toLocaleDateString(),
      paymentMethod: e.paymentMethod,
      description: e.description || ''
    });
  });

  // Style Header
  expenseSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  expenseSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };

  // Incomes Sheet
  const incomeSheet = workbook.addWorksheet('Incomes');
  incomeSheet.columns = [
    { header: 'Source', key: 'source', width: 25 },
    { header: 'Type', key: 'type', width: 18 },
    { header: 'Amount (INR)', key: 'amount', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Notes', key: 'notes', width: 35 }
  ];

  incomes.forEach((i) => {
    incomeSheet.addRow({
      source: i.source,
      type: i.type,
      amount: i.amount / 100,
      date: new Date(i.date).toLocaleDateString(),
      notes: i.notes || ''
    });
  });

  // Style Header
  incomeSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  incomeSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' }
  };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Spenwise_Statement_${new Date().toISOString().split('T')[0]}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = {
  generatePDFReport,
  generateExcelReport
};
