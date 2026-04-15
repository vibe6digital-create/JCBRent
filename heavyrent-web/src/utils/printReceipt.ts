import type { Booking } from '../types';

function fmt(val: string | undefined): string {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function inr(n: number) {
  return `&#8377;${n.toLocaleString('en-IN')}`;
}

export function printReceipt(booking: Booking): void {
  const invoiceNo = `HR-${booking.id.slice(0, 8).toUpperCase()}`;
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const subtotal = booking.estimatedCost + (booking.discountAmount || 0);
  const discount = booking.discountAmount || 0;
  const total = booking.estimatedCost;
  const location = [booking.workLocation, booking.workCity].filter(Boolean).join(', ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Receipt ${invoiceNo} — HeavyRent</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,sans-serif;font-size:13px;color:#222;background:#f0f0f0;}
  .wrap{max-width:700px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);}
  .hdr{background:#1A1A2E;padding:28px 36px;display:flex;justify-content:space-between;align-items:center;}
  .brand{display:flex;align-items:center;gap:14px;}
  .brand-box{width:44px;height:44px;background:#FF8C00;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;}
  .brand-name{color:#fff;font-size:22px;font-weight:700;line-height:1.2;}
  .brand-sub{color:#FF8C00;font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;margin-top:2px;}
  .inv-block{text-align:right;}
  .inv-label{font-size:9px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;}
  .inv-num{font-size:20px;font-weight:700;color:#FF8C00;margin:2px 0;}
  .inv-date{font-size:11px;color:#9CA3AF;}
  .body{padding:32px 36px;}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;margin-bottom:24px;background:#DCFCE7;color:#15803D;border:1px solid #BBF7D0;}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px;}
  .party{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:14px 16px;}
  .p-label{font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}
  .p-name{font-size:15px;font-weight:700;color:#1A1D26;}
  .p-detail{font-size:12px;color:#6B7280;margin-top:3px;}
  .sec-title{font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}
  .svc-grid{border:1px solid #E5E7EB;border-radius:8px;padding:16px 18px;display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;margin-bottom:28px;}
  .si-label{font-size:10px;color:#9CA3AF;margin-bottom:2px;}
  .si-val{font-size:13px;font-weight:600;color:#1A1D26;}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;}
  thead tr{border-bottom:2px solid #E5E7EB;}
  th{padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;text-align:left;}
  th.r{text-align:right;}
  td{padding:12px 12px;font-size:13px;border-bottom:1px solid #F3F4F6;}
  td.r{text-align:right;font-weight:600;}
  .disc{color:#15803D;}
  .total-row td{background:#FFF7ED;padding:14px 12px;font-size:16px;font-weight:700;color:#FF8C00;border:none;}
  .notes{background:#FFFBEB;border:1px solid #FEF3C7;border-radius:8px;padding:12px 14px;margin-bottom:24px;font-size:13px;color:#6B7280;font-style:italic;}
  .footer{border-top:2px solid #F3F4F6;padding:22px 36px;display:flex;justify-content:space-between;align-items:center;background:#FAFAFA;}
  .foot-left{font-size:12px;color:#6B7280;}
  .foot-left strong{color:#1A1D26;}
  .foot-right{font-size:11px;color:#9CA3AF;text-align:right;}
  .foot-id{font-size:10px;color:#9CA3AF;margin-top:3px;font-family:monospace;}
  .actions{text-align:center;padding:16px 0 8px;}
  .print-btn{padding:10px 28px;background:#FF8C00;color:#fff;font-weight:700;font-size:13px;border:none;border-radius:8px;cursor:pointer;}
  .print-btn:hover{background:#E07B00;}
  @media print{
    body{background:#fff;}
    .wrap{max-width:100%;margin:0;border-radius:0;box-shadow:none;}
    .actions{display:none;}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="brand">
      <div class="brand-box">&#127959;</div>
      <div>
        <div class="brand-name">HeavyRent</div>
        <div class="brand-sub">Heavy Equipment Rental</div>
      </div>
    </div>
    <div class="inv-block">
      <div class="inv-label">Invoice</div>
      <div class="inv-num">${invoiceNo}</div>
      <div class="inv-date">Issued: ${today}</div>
    </div>
  </div>

  <div class="body">
    <div class="badge">&#10003; Service Completed</div>

    <div class="parties">
      <div class="party">
        <div class="p-label">Bill To</div>
        <div class="p-name">${booking.customerName}</div>
        <div class="p-detail">${booking.customerPhone}</div>
        <div class="p-detail" style="margin-top:6px;color:#FF8C00;font-weight:600;font-size:11px;">Customer</div>
      </div>
      <div class="party">
        <div class="p-label">Service Provider</div>
        <div class="p-name">${booking.vendorName}</div>
        ${booking.vendorPhone ? `<div class="p-detail">${booking.vendorPhone}</div>` : ''}
        <div class="p-detail">HeavyRent Verified Vendor</div>
      </div>
    </div>

    <div class="sec-title">Service Details</div>
    <div class="svc-grid">
      <div>
        <div class="si-label">Machine</div>
        <div class="si-val">${booking.machineCategory} &middot; ${booking.machineModel}</div>
      </div>
      <div>
        <div class="si-label">Rate Type</div>
        <div class="si-val" style="text-transform:capitalize;">${booking.rateType}</div>
      </div>
      <div>
        <div class="si-label">Service Period</div>
        <div class="si-val">${fmt(booking.startDate)} &rarr; ${fmt(booking.endDate)}</div>
      </div>
      <div>
        <div class="si-label">Work Site</div>
        <div class="si-val">${location}</div>
      </div>
      ${booking.rate ? `
      <div>
        <div class="si-label">Rate</div>
        <div class="si-val">&#8377;${booking.rate.toLocaleString('en-IN')} / ${booking.rateType}</div>
      </div>` : ''}
      ${booking.bookingType ? `
      <div>
        <div class="si-label">Booking Type</div>
        <div class="si-val" style="text-transform:capitalize;">${booking.bookingType === 'instant' ? '&#9889; Instant' : '&#128197; Scheduled'}</div>
      </div>` : ''}
    </div>

    <div class="sec-title">Charges</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="r">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${booking.machineCategory} ${booking.machineModel} &mdash; Machine Rental</td>
          <td class="r">${inr(subtotal)}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td class="disc">Coupon Discount ${booking.couponCode ? '(' + booking.couponCode + ')' : ''}</td>
          <td class="r disc">&minus;${inr(discount)}</td>
        </tr>` : ''}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td><strong>Total Amount Payable</strong></td>
          <td class="r"><strong>${inr(total)}</strong></td>
        </tr>
      </tfoot>
    </table>

    ${booking.notes ? `
    <div class="sec-title">Notes</div>
    <div class="notes">${booking.notes}</div>
    ` : ''}
  </div>

  <div class="footer">
    <div class="foot-left">
      Thank you for choosing <strong>HeavyRent</strong>!<br>
      <span style="font-size:11px;">support@heavyrent.in &nbsp;&bull;&nbsp; heavyrent.in</span>
    </div>
    <div class="foot-right">
      Computer-generated receipt<br>
      <span class="foot-id">${booking.id}</span>
    </div>
  </div>
</div>

<div class="actions">
  <button class="print-btn" onclick="window.print()">&#128424; Print / Save as PDF</button>
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=950,scrollbars=yes');
  if (!win) {
    alert('Please allow popups for this site to view receipts.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
