export interface ReceiptSummary {
  totalPortions: number;
  averageOrderValue: number;
  grossSales: number;
  totalDeductions: number;
  totalSwiftCommissions: number;
  netEarnings: number;
}

export interface ByMenuItemRow {
  item: string;
  quantitySold: number;
  unitPrice: number;
  grossSales: number;
  swiftCommission: number;
  totalNet: number;
  orderStatus: string;
}

export interface ByOrderRow {
  orderRefNo: string;
  dateTime: string;
  totalPortions: number;
  grossSales: number;
  swiftCommission: number;
  totalNet: number;
  orderStatus: string;
}

export interface ReceiptResponse {
  summary: ReceiptSummary;
  style: "MENU_ITEM" | "BY_ORDER";
  byMenuItem?: ByMenuItemRow[];
  byOrder?: ByOrderRow[];
  meta: {
    commissionRate: number;
    restaurantId: string;
    restaurantName?: string;
  };
}

/**
 * Fetches receipt data from the backend API
 */
export async function fetchReceiptJson(
  orderId: string,
  restaurantId: string,
  token?: string
): Promise<ReceiptResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const url = `${API_BASE_URL}/catering-orders/${orderId}/restaurant/${restaurantId}/receipt-calc?style=MENU_ITEM`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch receipt data: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Builds a printable HTML receipt from receipt data
 */
export function buildReceiptHTML(
  data: ReceiptResponse,
  orderId?: string,
  eventDate?: string,
  branchName?: string
): string {
  const fmt = (n: number) => `£${Number(n || 0).toFixed(2)}`;
  const summary = data.summary || {};
  const meta = data.meta || {};
  const style = data.style || "BY_ORDER";
  
  const formattedOrderId = (orderId || "").slice(0, 4).toUpperCase();

  // header
  const header = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:32px 48px;border-bottom:2px solid #e0e0e0;background:#fafafa;">
      <div style="display:flex;gap:20px;align-items:center;">
        <img src="/logo.png" alt="Swift Food" style="width:90px;height:auto;display:block;" />
        <div style="font-size:13px;color:#333;line-height:1.6;">
          <strong style="display:block;font-size:15px;color:#000;margin-bottom:4px;">Swift Food Services Limited</strong>
          251 Gray's Inn Road<br/>
          Camden, WC1X 8QT<br/>
          United Kingdom
        </div>
      </div>

      <div style="text-align:right;">
        <div style="margin-bottom:12px;">
          <h2 style="margin:0;font-size:20px;color:#111;font-weight:700;">${meta.restaurantName || "Restaurant"}</h2>
          <div style="font-size:14px;color:#666;margin-top:4px;">Catering Order Receipt</div>
        </div>

        ${branchName ? `<div style="font-size:13px;color:#555;margin-top:6px;"><strong>Branch:</strong> ${String(branchName)}</div>` : ""}
        ${eventDate ? `<div style="font-size:13px;color:#555;margin-top:4px;"><strong>Event:</strong> ${new Date(eventDate).toLocaleDateString('en-GB')}</div>` : ""}
        <div style="margin-top:12px;font-size:13px;color:#333;"><strong>Reference:</strong> ${formattedOrderId}</div>
      </div>
    </div>
  `;

  // download button - separate section
  const downloadButton = `
    <div class="no-print" style="padding:20px 48px;background:#fff;border-bottom:1px solid #e0e0e0;text-align:center;">
      <button id="download-receipt-btn" style="background:#0b66ff;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.1);transition:all 0.2s;">
        Download / Save as PDF
      </button>
    </div>
  `;

  // summary
  const financialSummary = `
    <div style="padding:32px 48px;background:#fff;">
      <h3 style="margin:0 0 16px 0;font-size:16px;color:#111;font-weight:700;">Financial Summary</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr><td style="padding:8px 0;color:#666;">Gross Sales:</td><td style="text-align:right;font-weight:600;font-size:15px;">${fmt(summary.grossSales)}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Swift Commission:</td><td style="text-align:right;font-weight:600;">-${fmt(summary.totalSwiftCommissions)}</td></tr>
        ${summary.totalDeductions ? `<tr><td style="padding:8px 0;color:#666;">Promo / Deductions:</td><td style="text-align:right;font-weight:600;">-${fmt(summary.totalDeductions)}</td></tr>` : ""}
        <tr style="border-top:2px solid #e0e0e0;"><td style="padding:14px 0;font-weight:700;font-size:15px;">Net Earnings:</td><td style="text-align:right;font-weight:700;font-size:18px;">${fmt(summary.netEarnings)}</td></tr>
      </table>
    </div>
  `;

  // items breakdown
  const itemsBreakdown = (() => {
    if (style === "MENU_ITEM" && Array.isArray(data.byMenuItem) && data.byMenuItem.length) {
      const rows = data.byMenuItem.map((r: ByMenuItemRow) => `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #f0f0f0;">${r.item}</td>
          <td style="padding:14px 12px;text-align:center;border-bottom:1px solid #f0f0f0;">${r.quantitySold}</td>
          <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(r.unitPrice)}</td>
          <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(r.grossSales)}</td>
          <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(r.swiftCommission)}</td>
          <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;font-weight:700;color:#2e7d32;">${fmt(r.totalNet)}</td>
        </tr>
      `).join("");
      return `
        <div style="padding:32px 48px;background:#fff;flex:1;">
          <h3 style="margin:0 0 16px 0;font-size:16px;color:#111;font-weight:700;">Items Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="text-align:left;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Item</th>
                <th style="text-align:center;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Qty</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Unit</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Gross</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Commission</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Net</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (style === "BY_ORDER" && Array.isArray(data.byOrder) && data.byOrder.length) {
      const rows = data.byOrder.map((r: ByOrderRow) => `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #f0f0f0;">${r.orderRefNo.slice(0,4).toUpperCase()}</td>
          <td style="padding:14px 12px;text-align:center;border-bottom:1px solid #f0f0f0;">${r.totalPortions}</td>
          <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(r.grossSales)}</td>
          <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(r.swiftCommission)}</td>
          <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;font-weight:700;color:#2e7d32;">${fmt(r.totalNet)}</td>
        </tr>
      `).join("");
      return `
        <div style="padding:32px 48px;background:#fff;flex:1;">
          <h3 style="margin:0 0 16px 0;font-size:16px;color:#111;font-weight:700;">Orders Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="text-align:left;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Order</th>
                <th style="text-align:center;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Portions</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Gross</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Commission</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Net</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    return `<div style="padding:32px 48px;color:#666;flex:1;">No items to display.</div>`;
  })();

  // footer - fixed at bottom
  const footer = `
    <div style="padding:28px 48px;border-top:2px solid #e0e0e0;font-size:13px;color:#666;background:#fafafa;">
      <div><strong style="color:#333;">Commission rate:</strong> ${meta.commissionRate || 0}%</div>
      <div style="margin-top:10px;color:#999;font-size:12px;">This receipt is for your records. All amounts are GBP (£).</div>
    </div>
  `;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${formattedOrderId}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            color: #222; 
            background: #fff; 
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: #fff; 
            width: 100%;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .content-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          #download-receipt-btn:hover {
            background: #0952cc;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          @media print {
            .no-print { display: none !important; }
            body { background: #fff; }
            .container { 
              box-shadow: none; 
              max-width: 100%;
            }
          }
          @page {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${header}
          ${downloadButton}
          <div class="content-wrapper">
            ${financialSummary}
            ${itemsBreakdown}
          </div>
          ${footer}
        </div>
        <script>
          (function () {
            const btn = document.getElementById('download-receipt-btn');
            if (!btn) return;
            btn.addEventListener('click', function () {
              try { 
                window.print(); 
              } catch (e) {
                console.error('Print failed', e);
                alert('Unable to open print dialog.');
              }
            });
          })();
        </script>
      </body>
    </html>
  `;
}