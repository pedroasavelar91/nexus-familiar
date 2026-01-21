import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationControl({ currentPage, totalPages, onPageChange }: PaginationControlProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <Pagination className="mt-8 select-none">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) onPageChange(currentPage - 1);
                        }}
                    />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === '...' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                className="cursor-pointer"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (typeof page === 'number') onPageChange(page);
                                }}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) onPageChange(currentPage + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
