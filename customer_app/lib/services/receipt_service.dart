import 'dart:typed_data';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/booking.dart';

class ReceiptService {
  static final _dateFmt = DateFormat('dd MMM yyyy');
  static final _currFmt = NumberFormat('#,##,##0', 'en_IN');

  static String _inr(double v) => '₹${_currFmt.format(v.round())}';

  Future<void> showReceipt(pw.Context? _, Booking booking) async {
    await Printing.layoutPdf(
      onLayout: (_) async => await _buildPdf(booking),
      name: 'HeavyRent-Receipt-${booking.id.substring(0, 8).toUpperCase()}',
    );
  }

  Future<Uint8List> _buildPdf(Booking booking) async {
    final doc = pw.Document(title: 'HeavyRent Receipt');

    final invoiceNo = 'HR-${booking.id.substring(0, 8).toUpperCase()}';
    final today = _dateFmt.format(DateTime.now());
    final subtotal = booking.estimatedCost + (booking.discountAmount ?? 0);
    final discount = booking.discountAmount ?? 0.0;
    final total = booking.estimatedCost;

    // ── colours ──────────────────────────────────────────────────────────────
    const orange = PdfColor.fromInt(0xFFFF8C00);
    const dark = PdfColor.fromInt(0xFF1A1A2E);
    const lightBg = PdfColor.fromInt(0xFFF9FAFB);
    const borderColor = PdfColor.fromInt(0xFFE5E7EB);
    const mutedText = PdfColor.fromInt(0xFF6B7280);
    const green = PdfColor.fromInt(0xFF15803D);
    const greenBg = PdfColor.fromInt(0xFFDCFCE7);

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(0),
        build: (context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.stretch,
            children: [
              // ── Header ──────────────────────────────────────────────────────
              pw.Container(
                color: dark,
                padding: const pw.EdgeInsets.symmetric(horizontal: 40, vertical: 28),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Row(children: [
                      pw.Container(
                        width: 44, height: 44,
                        decoration: pw.BoxDecoration(
                          color: orange,
                          borderRadius: pw.BorderRadius.circular(8),
                        ),
                        alignment: pw.Alignment.center,
                        child: pw.Text('HR',
                          style: pw.TextStyle(color: PdfColors.white, fontWeight: pw.FontWeight.bold, fontSize: 16)),
                      ),
                      pw.SizedBox(width: 14),
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text('HeavyRent',
                            style: pw.TextStyle(color: PdfColors.white, fontWeight: pw.FontWeight.bold, fontSize: 20)),
                          pw.SizedBox(height: 3),
                          pw.Text('HEAVY EQUIPMENT RENTAL',
                            style: pw.TextStyle(color: orange, fontSize: 8, letterSpacing: 1.2)),
                        ],
                      ),
                    ]),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('INVOICE', style: pw.TextStyle(color: PdfColors.grey400, fontSize: 8, letterSpacing: 1)),
                        pw.SizedBox(height: 4),
                        pw.Text(invoiceNo,
                          style: pw.TextStyle(color: orange, fontSize: 20, fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 4),
                        pw.Text('Issued: $today',
                          style: const pw.TextStyle(color: PdfColors.grey400, fontSize: 10)),
                      ],
                    ),
                  ],
                ),
              ),

              // ── Body ────────────────────────────────────────────────────────
              pw.Expanded(
                child: pw.Padding(
                  padding: const pw.EdgeInsets.all(40),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [

                      // Status badge
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                        decoration: pw.BoxDecoration(
                          color: greenBg,
                          borderRadius: pw.BorderRadius.circular(20),
                          border: pw.Border.all(color: const PdfColor.fromInt(0xFFBBF7D0)),
                        ),
                        child: pw.Text('✓  SERVICE COMPLETED',
                          style: pw.TextStyle(color: green, fontSize: 10, fontWeight: pw.FontWeight.bold, letterSpacing: 0.8)),
                      ),
                      pw.SizedBox(height: 24),

                      // Parties
                      pw.Row(
                        children: [
                          pw.Expanded(child: _partyBox(
                            label: 'BILL TO',
                            name: booking.customerName ?? 'Customer',
                            details: [
                              if (booking.customerPhone != null) booking.customerPhone!,
                              'Customer',
                            ],
                            lightBg: lightBg, borderColor: borderColor, mutedText: mutedText,
                          )),
                          pw.SizedBox(width: 16),
                          pw.Expanded(child: _partyBox(
                            label: 'SERVICE PROVIDER',
                            name: booking.vendorName.isNotEmpty ? booking.vendorName : 'Vendor',
                            details: ['HeavyRent Verified Vendor'],
                            lightBg: lightBg, borderColor: borderColor, mutedText: mutedText,
                          )),
                        ],
                      ),
                      pw.SizedBox(height: 24),

                      // Service details
                      _sectionTitle('SERVICE DETAILS', mutedText),
                      pw.Container(
                        decoration: pw.BoxDecoration(
                          border: pw.Border.all(color: borderColor),
                          borderRadius: pw.BorderRadius.circular(8),
                        ),
                        padding: const pw.EdgeInsets.all(16),
                        child: pw.Column(
                          children: [
                            pw.Row(children: [
                              _svcItem('Machine', '${booking.machineCategory} · ${booking.machineModel}', mutedText),
                              pw.SizedBox(width: 20),
                              _svcItem('Rate Type', booking.rateType.toUpperCase(), mutedText),
                            ]),
                            pw.SizedBox(height: 12),
                            pw.Row(children: [
                              _svcItem('Service Period',
                                '${_dateFmt.format(booking.startDate)} → ${_dateFmt.format(booking.endDate)}', mutedText),
                              pw.SizedBox(width: 20),
                              _svcItem('Rate', '${_inr(booking.rate)} / ${booking.rateType}', mutedText),
                            ]),
                            if (booking.workAddress != null) ...[
                              pw.SizedBox(height: 12),
                              _svcItem('Work Site', booking.workAddress!, mutedText),
                            ],
                          ],
                        ),
                      ),
                      pw.SizedBox(height: 24),

                      // Charges table
                      _sectionTitle('CHARGES', mutedText),
                      _chargesTable(
                        booking: booking,
                        subtotal: subtotal,
                        discount: discount,
                        total: total,
                        borderColor: borderColor,
                        orange: orange,
                        green: green,
                        mutedText: mutedText,
                      ),

                      // Notes
                      if (booking.notes != null && booking.notes!.isNotEmpty) ...[
                        pw.SizedBox(height: 16),
                        _sectionTitle('NOTES', mutedText),
                        pw.Container(
                          padding: const pw.EdgeInsets.all(12),
                          decoration: pw.BoxDecoration(
                            color: const PdfColor.fromInt(0xFFFFFBEB),
                            borderRadius: pw.BorderRadius.circular(6),
                            border: pw.Border.all(color: const PdfColor.fromInt(0xFFFEF3C7)),
                          ),
                          child: pw.Text(booking.notes!,
                            style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey700)),
                        ),
                      ],

                      pw.Spacer(),

                      // Footer divider
                      pw.Divider(color: borderColor, thickness: 1),
                      pw.SizedBox(height: 12),
                      pw.Row(
                        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                        children: [
                          pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text('Thank you for choosing HeavyRent!',
                                style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: dark)),
                              pw.SizedBox(height: 3),
                              pw.Text('support@heavyrent.in  •  heavyrent.in',
                                style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                            ],
                          ),
                          pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.end,
                            children: [
                              pw.Text('Computer-generated receipt',
                                style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey500)),
                              pw.SizedBox(height: 2),
                              pw.Text(booking.id,
                                style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey400)),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );

    return Uint8List.fromList(await doc.save());
  }

  pw.Widget _partyBox({
    required String label,
    required String name,
    required List<String> details,
    required PdfColor lightBg,
    required PdfColor borderColor,
    required PdfColor mutedText,
  }) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(14),
      decoration: pw.BoxDecoration(
        color: lightBg,
        border: pw.Border.all(color: borderColor),
        borderRadius: pw.BorderRadius.circular(8),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(label, style: pw.TextStyle(fontSize: 8, color: mutedText, letterSpacing: 1, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 6),
          pw.Text(name, style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: const PdfColor.fromInt(0xFF1A1D26))),
          ...details.map((d) => pw.Padding(
            padding: const pw.EdgeInsets.only(top: 3),
            child: pw.Text(d, style: pw.TextStyle(fontSize: 11, color: mutedText)),
          )),
        ],
      ),
    );
  }

  pw.Widget _sectionTitle(String title, PdfColor mutedText) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 10),
      child: pw.Text(title,
        style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: mutedText, letterSpacing: 1)),
    );
  }

  pw.Widget _svcItem(String label, String value, PdfColor mutedText) {
    return pw.Expanded(
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(label, style: pw.TextStyle(fontSize: 9, color: mutedText)),
          pw.SizedBox(height: 2),
          pw.Text(value, style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold,
            color: const PdfColor.fromInt(0xFF1A1D26))),
        ],
      ),
    );
  }

  pw.Widget _chargesTable({
    required Booking booking,
    required double subtotal,
    required double discount,
    required double total,
    required PdfColor borderColor,
    required PdfColor orange,
    required PdfColor green,
    required PdfColor mutedText,
  }) {
    const headerStyle = pw.TextStyle(fontSize: 9, color: PdfColors.grey500);
    const rowStyle = pw.TextStyle(fontSize: 12, color: PdfColors.grey800);
    final boldStyle = pw.TextStyle(fontSize: 13, fontWeight: pw.FontWeight.bold);

    return pw.Container(
      decoration: pw.BoxDecoration(
        border: pw.Border.all(color: borderColor),
        borderRadius: pw.BorderRadius.circular(8),
      ),
      child: pw.Column(
        children: [
          // Header
          pw.Container(
            padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: pw.BoxDecoration(
              color: const PdfColor.fromInt(0xFFF9FAFB),
              border: pw.Border(bottom: pw.BorderSide(color: borderColor)),
              borderRadius: const pw.BorderRadius.only(topLeft: pw.Radius.circular(7), topRight: pw.Radius.circular(7)),
            ),
            child: pw.Row(
              children: [
                pw.Expanded(child: pw.Text('DESCRIPTION', style: headerStyle)),
                pw.Text('AMOUNT', style: headerStyle),
              ],
            ),
          ),
          // Rental row
          pw.Container(
            padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: pw.Row(
              children: [
                pw.Expanded(child: pw.Text('${booking.machineCategory} ${booking.machineModel} — Machine Rental', style: rowStyle)),
                pw.Text(_inr(subtotal), style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
              ],
            ),
          ),
          // Discount row
          if (discount > 0) ...[
            pw.Container(
              padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: pw.BoxDecoration(
                border: pw.Border(top: pw.BorderSide(color: borderColor)),
              ),
              child: pw.Row(
                children: [
                  pw.Expanded(child: pw.Text(
                    'Coupon Discount${booking.couponCode != null ? " (${booking.couponCode})" : ""}',
                    style: pw.TextStyle(fontSize: 12, color: green),
                  )),
                  pw.Text('−${_inr(discount)}', style: pw.TextStyle(fontSize: 12, color: green, fontWeight: pw.FontWeight.bold)),
                ],
              ),
            ),
          ],
          // Total row
          pw.Container(
            padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: pw.BoxDecoration(
              color: const PdfColor.fromInt(0xFFFFF7ED),
              border: pw.Border(top: pw.BorderSide(color: borderColor, width: 2)),
              borderRadius: const pw.BorderRadius.only(
                bottomLeft: pw.Radius.circular(7),
                bottomRight: pw.Radius.circular(7),
              ),
            ),
            child: pw.Row(
              children: [
                pw.Expanded(child: pw.Text('Total Amount Payable', style: boldStyle.copyWith(color: orange))),
                pw.Text(_inr(total), style: boldStyle.copyWith(color: orange, fontSize: 16)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
