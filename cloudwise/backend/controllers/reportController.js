import PDFDocument from "pdfkit";
import Cost from "../models/Cost.js";
import Resource from "../models/Resource.js";

// @desc Report summary (used by the Reports page)
// @route GET /api/reports
export const getReports = async (req, res, next) => {
  try {
    const costs = await Cost.find({ user: req.user._id });
    const resources = await Resource.find({ user: req.user._id });

    const totalCost = costs.reduce((s, c) => s + c.amount, 0);
    const totalResources = resources.length;

    const serviceBreakdown = ["EC2", "S3", "RDS", "IAM", "Others"].map((service) => ({
      service,
      amount: costs.filter((c) => c.service === service).reduce((s, c) => s + c.amount, 0),
      count: resources.filter((r) => r.type === service).length,
    }));

    res.json({
      summary: { totalCost: totalCost.toFixed(2), totalResources },
      serviceBreakdown,
      generatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

const csvEscape = (val) => {
  const str = String(val ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

// @desc Download resource + cost report as CSV
// @route GET /api/reports/csv
export const downloadCSV = async (req, res, next) => {
  try {
    const resources = await Resource.find({ user: req.user._id }).sort({ type: 1 });
    const costs = await Cost.find({ user: req.user._id });
    const costByService = {};
    costs.forEach((c) => {
      costByService[c.service] = (costByService[c.service] || 0) + c.amount;
    });

    const header = ["Type", "Name", "Resource ID", "Region", "Status", "Cost/Day ($)"];
    const rows = resources.map((r) => [r.type, r.name, r.resourceId, r.region, r.status, r.cost.toFixed(2)]);

    let csv = header.map(csvEscape).join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map(csvEscape).join(",") + "\n";
    });

    csv += "\n";
    csv += "Cost by Service\n";
    csv += "Service,Total ($)\n";
    Object.entries(costByService).forEach(([service, amount]) => {
      csv += `${csvEscape(service)},${amount.toFixed(2)}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="cloudwise-report-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc Download resource + cost report as PDF
// @route GET /api/reports/pdf
export const downloadPDF = async (req, res, next) => {
  try {
    const resources = await Resource.find({ user: req.user._id }).sort({ type: 1 });
    const costs = await Cost.find({ user: req.user._id });
    const totalCost = costs.reduce((s, c) => s + c.amount, 0);

    const costByService = {};
    costs.forEach((c) => {
      costByService[c.service] = (costByService[c.service] || 0) + c.amount;
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="cloudwise-report-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    doc.fontSize(20).fillColor("#111").text("CloudWise Cost & Resource Report", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#666").text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(13).fillColor("#111").text("Summary");
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#333");
    doc.text(`Total Cost: $${totalCost.toFixed(2)}`);
    doc.text(`Total Resources: ${resources.length}`);
    doc.moveDown(1);

    doc.fontSize(13).fillColor("#111").text("Cost by Service");
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#333");
    Object.entries(costByService).forEach(([service, amount]) => {
      doc.text(`${service}: $${amount.toFixed(2)}`);
    });
    doc.moveDown(1);

    ["EC2", "S3", "RDS", "IAM"].forEach((type) => {
      const list = resources.filter((r) => r.type === type);
      if (!list.length) return;

      doc.fontSize(13).fillColor("#111").text(`${type} Resources`);
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor("#333");
      list.forEach((r) => {
        doc.text(`${r.name}  |  ${r.status}  |  ${r.region}  |  $${r.cost.toFixed(2)}/day`);
      });
      doc.moveDown(1);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};