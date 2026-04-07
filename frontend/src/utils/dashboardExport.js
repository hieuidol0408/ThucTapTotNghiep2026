import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * HELPER: Remove Vietnamese accents/tones for PDF compatibility
 * jsPDF default fonts do not support Unicode Vietnamese characters.
 */
const removeVietnameseTones = (str) => {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system combine characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Combining accent marks
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Tonos, Breve, Horn
    // Remove extra spaces
    str = str.replace(/ + /g, " ");
    str = str.trim();
    return str;
};

/**
 * HELPER: Safe date formatter
 */
const safeFormatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return 'N/A';
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

/**
 * Generates a professional PDF report for STU HRM
 * Fixes V3: Added Vietnamese normalization to fix broken characters
 */
export const generateHRMReport = async (data) => {
    console.log('PDF Generation v4: Normalizing text...', data);
    const { stats, recentUsers, tasks, logoUrl } = data;
    const doc = new jsPDF();
    
    // Add Logo
    if (logoUrl) {
        try {
            doc.addImage(logoUrl, 'PNG', 15, 12, 18, 18);
        } catch (e) {
            console.warn('PDF Logo warning:', e);
        }
    }

    // Header - Normalized
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(removeVietnameseTones('STU WORK - HE THONG QUAN TRI NHAN SU'), 38, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(removeVietnameseTones(`Ngay xuat bao cao: ${safeFormatDate(new Date())}`), 38, 28);
    doc.text(removeVietnameseTones('Truong Dai hoc Cong nghe Sai Gon (STU)'), 38, 33);

    doc.setLineWidth(0.2);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 38, 195, 38);

    // Section 1: Stats
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(removeVietnameseTones('1. Tom tat chi so'), 15, 48);

    autoTable(doc, {
        startY: 53,
        head: [[removeVietnameseTones('Chi so'), removeVietnameseTones('Gia tri')]],
        body: [
            [removeVietnameseTones('Tong nhan vien'), stats.totalUsers || 0],
            [removeVietnameseTones('Tong cong viec'), stats.totalTasks || 0],
            [removeVietnameseTones('Ty le hoan thanh'), `${stats.percentComplete || 0}%`],
            [removeVietnameseTones('Bao cao tre han'), stats.lateTasks || 0],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 },
    });

    // Section 2: Recent Staff
    let lastY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(14);
    doc.text(removeVietnameseTones('2. Cap nhat nhan su moi'), 15, lastY + 15);

    const userRows = (recentUsers || []).map(u => [
        removeVietnameseTones(u.full_name || 'Vo danh'),
        removeVietnameseTones(u.role === 'admin' ? 'Quan tri' : 'Giang vien'),
        safeFormatDate(u.created_at || u.NgaySinh)
    ]);

    autoTable(doc, {
        startY: lastY + 20,
        head: [[removeVietnameseTones('Ho va ten'), removeVietnameseTones('Vai tro'), removeVietnameseTones('Ngay tham gia')]],
        body: userRows.length > 0 ? userRows : [[removeVietnameseTones('Khong co du lieu'), '', '']],
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233], textColor: 255 },
    });

    // Section 3: Task Progress
    lastY = doc.lastAutoTable.finalY || 180;
    if (lastY > 230) {
        doc.addPage();
        lastY = 20;
    }
    doc.setFontSize(14);
    doc.text(removeVietnameseTones('3. Tien do cong viec chi tiet'), 15, lastY + 15);

    const taskRows = (tasks || []).map(t => [
        removeVietnameseTones(t.title || 'Khong co tieu de'),
        removeVietnameseTones(t.assignee_name || 'Chua phan cong'),
        `${t.current_progress || 0}%`,
        removeVietnameseTones(t.status === 'completed' ? 'Hoan thanh' : (t.status === 'late' ? 'Tre han' : 'Dang lam'))
    ]);

    autoTable(doc, {
        startY: lastY + 20,
        head: [[removeVietnameseTones('Ten nhiem vu'), removeVietnameseTones('Nguoi phu trach'), removeVietnameseTones('Tien do'), removeVietnameseTones('Trang thai')]],
        body: taskRows.length > 0 ? taskRows : [[removeVietnameseTones('Chua co nhiem vu nào'), '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247], textColor: 255 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Trang ${i} / ${pageCount}`, 195, 285, { align: 'right' });
    }

    const safeDate = new Date().toISOString().split('T')[0];
    doc.save(`Bao-Cao-HRM-${safeDate}.pdf`);
};
