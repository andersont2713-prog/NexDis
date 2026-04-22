import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { COMPANY_DATA } from '../constants';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id?: string;
  customerName: string;
  customerAddress?: string;
  customerRuc?: string;
  items: OrderItem[];
  total: number;
  date: string;
  currencySymbol?: string;
}

export const generateOrderPDF = (order: OrderData) => {
  const doc = new jsPDF();
  const symbol = order.currencySymbol || '$';
  
  // Header with Logo Placeholder & Company Info
  doc.setFillColor(30, 41, 59); // slate-900
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXTDIST', 20, 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SOLUCIONES LOGÍSTICAS GASTRONÓMICAS', 20, 32);

  // Invoice Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(79, 70, 229); // indigo-600
  doc.roundedRect(140, 10, 60, 35, 3, 3, 'FD');
  
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RUC: ' + COMPANY_DATA.ruc, 145, 18);
  doc.setFontSize(12);
  doc.text('FACTURA ELECTRÓNICA', 145, 26);
  doc.text('F001 - ' + (order.id || '0001').padStart(6, '0'), 145, 34);

  // Company Details
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_DATA.address, 20, 50);
  doc.text('Telf: ' + COMPANY_DATA.phone + ' | ' + COMPANY_DATA.email, 20, 55);

  // Customer Details Info Box
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(20, 60, 190, 60);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85); // slate-800
  doc.text('DATOS DEL CLIENTE:', 20, 68);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Cliente: ' + order.customerName, 20, 75);
  doc.text('Dirección: ' + (order.customerAddress || 'Local Principal'), 20, 80);
  doc.text('Documento/RUC: ' + (order.customerRuc || '20600000000'), 20, 85);
  
  doc.text('Fecha de Emisión:', 140, 75);
  doc.text(order.date, 175, 75);
  doc.text('Moneda:', 140, 80);
  doc.text(symbol === 'S/' ? 'SOLES' : 'DÓLARES / PESOS', 175, 80);

  // Table
  const tableData = order.items.map((item, index) => [
    (index + 1).toString(),
    item.productName,
    item.quantity.toString(),
    symbol + ' ' + item.price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    symbol + ' ' + (item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })
  ]);

  (doc as any).autoTable({
    startY: 95,
    head: [['Item', 'Descripción', 'Cant.', 'Precio Unit.', 'Importe']],
    body: tableData,
    headStyles: { 
      fillColor: [30, 41, 59],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 35 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  // Totals Calculation
  const subtotal = order.total / 1.18;
  const igv = order.total - subtotal;
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  const drawTotalLine = (label: string, value: string, y: number, isFinal: boolean = false) => {
    doc.setFontSize(9);
    doc.setTextColor(isFinal ? 30 : 100);
    doc.setFont('helvetica', isFinal ? 'bold' : 'normal');
    doc.text(label, 140, y);
    doc.text(value, 190, y, { align: 'right' });
    if(isFinal) {
      doc.setDrawColor(30, 41, 59);
      doc.line(140, y + 2, 190, y + 2);
    }
  };

  drawTotalLine('OP. GRAVADA:', symbol + ' ' + subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 }), finalY);
  drawTotalLine('IGV (18%):', symbol + ' ' + igv.toLocaleString(undefined, { minimumFractionDigits: 2 }), finalY + 6);
  drawTotalLine('TOTAL A PAGAR:', symbol + ' ' + order.total.toLocaleString(undefined, { minimumFractionDigits: 2 }), finalY + 14, true);

  // Legal & Signatures
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('REPRESENTACIÓN IMPRESA DE LA FACTURA ELECTRÓNICA', 105, finalY + 30, { align: 'center' });
  doc.text(COMPANY_DATA.legalInfo, 105, finalY + 34, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text('¡Gracias por su preferencia!', 20, finalY + 45);

  return doc;
};

export const shareByWhatsApp = (order: OrderData, phoneNumber: string = '', symbol: string = '$') => {
  const summary = `*${COMPANY_DATA.name}*%0A` +
    `*COMPROBANTE DE PAGO*%0A%0A` +
    `*Cliente:* ${order.customerName}%0A` +
    `*Total:* ${symbol} ${order.total.toLocaleString()}%0A%0A` +
    `_Resumen de productos:_%0A` +
    order.items.map(i => `- ${i.quantity}x ${i.productName}`).join('%0A') +
    `%0A%0APuedes ver tu factura oficial ingresando a nuestra plataforma web.`;

  window.open(`https://wa.me/${phoneNumber}?text=${summary}`, '_blank');
};
