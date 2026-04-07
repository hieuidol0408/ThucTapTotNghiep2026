import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional PDF report for STU HRM
 * @param {Object} data - { stats, recentUsers, tasks, logoUrl }
 */
export const generateHRMReport = async (data) => {
    const { stats, recentUsers, tasks, logoUrl } = data;
    const doc = new jsPDF();
    
    // Add Logo (if provided and valid)
    if (logoUrl) {
        try {
            // In Vite, logoUrl is often a path. We'll try to add it.
            // For best results, we specify the format and coordinates.
            doc.addImage(logoUrl, 'PNG', 15, 10, 20, 20);
        } catch (e) {
            console.warn('Could not add logo to PDF:', e);
        }
    }

    // Header - Use standard fonts
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('STU WORK - HRM REPORT', 40, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Exported: ${new Date().toLocaleString('vi-VN')}`, 40, 26);
    doc.text('Saigon Technology University (STU)', 40, 31);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 38, 195, 38);

    // 1. Dashboard Summary Table
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Dashboard Statistics', 15, 48);

    autoTable(doc, {
        startY: 53,
        head: [['Statistic', 'Value']],
        body: [
            ['Total Employees', stats.totalUsers || 0],
            ['Total Tasks', stats.totalTasks || 0],
            ['Completion Rate', `${stats.percentComplete || 0}%`],
            ['Late Reports', stats.lateTasks || 0],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
        margin: { left: 15, right: 15 }
    });

    // 2. Recent Staff Table
    let lastY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(14);
    doc.text('2. Recent Staff Updates', 15, lastY + 15);

    const userRows = recentUsers.map(u => [
        u.full_name,
        u.role === 'admin' ? 'Admin' : 'Staff',
        new Date(u.created_at).toLocaleDateString('vi-VN')
    ]);

    autoTable(doc, {
        startY: lastY + 20,
        head: [['Full Name', 'Role', 'Joined Date']],
        body: userRows.length > 0 ? userRows : [['No data available', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 15, right: 15 }
    });

    // 3. Task Progress Table
    lastY = doc.lastAutoTable.finalY || 180;
    // Check if we need a new page
    if (lastY > 240) {
        doc.addPage();
        lastY = 15;
    }
    doc.setFontSize(14);
    doc.text('3. Task Progress Overview', 15, lastY + 15);

    const taskRows = (tasks || []).map(t => [
        t.title,
        t.assignee_name || 'N/A',
        `${t.current_progress || 0}%`,
        t.status === 'completed' ? 'Done' : (t.status === 'late' ? 'Late' : 'In Progress')
    ]);

    autoTable(doc, {
        startY: lastY + 20,
        head: [['Task Title', 'Assignee', 'Progress', 'Status']],
        body: taskRows.length > 0 ? taskRows : [['No tasks assigned yet', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 15, right: 15 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} / ${pageCount}`, 195, 285, { align: 'right' });
        doc.text('© 2026 STU WORK - Management System', 15, 285);
    }

    // Save PDF
    doc.save(`STU-HRM-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
};
