import { CommentData } from "@/hooks/useScraper"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, Table as TableIcon } from "lucide-react"
import Papa from "papaparse"

interface ResultsTableProps {
    data: CommentData[]
    loading?: boolean
}

export function ResultsTable({ data, loading = false }: ResultsTableProps) {
    const handleExport = () => {
        // Exclude metadata from CSV to keep it clean, or keep it if helpful
        // Let's keep it clean: remove metadata fields
        const cleanData = data.map(({ videoTitle, videoCover, ...rest }) => rest)

        const csv = Papa.unparse(cleanData)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `tiktok_comments_${new Date().toISOString()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Show skeleton during loading
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <TableIcon className="text-tiktok-pink" size={20} />
                        Raw Data Preview
                    </h3>
                </div>

                <div className="glass rounded-xl overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Comment</th>
                                    <th className="px-6 py-4 text-right">Likes</th>
                                    <th className="px-6 py-4 text-right">Replies</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                    <th className="px-6 py-4">Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-3">
                                            <div className="h-4 bg-muted rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="h-4 bg-muted rounded w-full"></div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="h-4 bg-muted rounded w-12 ml-auto"></div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="h-4 bg-muted rounded w-12 ml-auto"></div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="h-4 bg-muted rounded w-4"></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    if (data.length === 0) return null

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <TableIcon className="text-tiktok-pink" size={20} />
                    Raw Data Preview
                </h3>
                <Button variant="outline" size="sm" onClick={handleExport} className="hover:bg-primary hover:text-white transition-colors">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                </Button>
            </div>

            <div className="glass rounded-xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Comment</th>
                                <th className="px-6 py-4 text-right">Likes</th>
                                <th className="px-6 py-4 text-right">Replies</th>
                                <th className="px-6 py-4 text-right">Date</th>
                                <th className="px-6 py-4">Link</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.slice(0, 50).map((row, i) => (
                                <tr key={i} className="hover:bg-tiktok-cyan/5 transition-colors group">
                                    <td className="px-6 py-3 font-medium text-nowrap text-tiktok-cyan/80 group-hover:text-tiktok-cyan">{row.authorUniqueId}</td>
                                    <td className="px-6 py-3 min-w-[300px] text-muted-foreground">{row.text}</td>
                                    <td className="px-6 py-3 text-right tabular-nums">{row.likes}</td>
                                    <td className="px-6 py-3 text-right tabular-nums">{row.replies}</td>
                                    <td className="px-6 py-3 text-right text-muted-foreground whitespace-nowrap text-xs">
                                        {new Date(row.createTime * 1000).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <a href={row.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                            <ExternalLink size={14} />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.length > 50 && (
                    <div className="p-3 text-center text-xs text-muted-foreground bg-white/5">
                        Previewing first 50 rows. Download Full CSV to view all {data.length} records.
                    </div>
                )}
            </div>
        </div>
    )
}
