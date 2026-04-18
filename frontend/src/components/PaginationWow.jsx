import React from 'react';

const PaginationWow = ({ currentPage, totalPages, paginate }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="wow-pagination">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            <span className="page-info">Trang {currentPage} / {totalPages}</span>
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>
        </div>
    );
};

export default PaginationWow;
