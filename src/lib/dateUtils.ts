export function getMonthDateRange(year: number, month: number): { startDate: string, endDate: string } {
    // Month is 0-indexed (0 = January, 11 = December)
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // Last day of the month

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    return {
        startDate: formatDate(start),
        endDate: formatDate(end)
    };
}

export function getYearsArray(startYear: number = 2020): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
        years.push(y);
    }
    return years;
}

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
