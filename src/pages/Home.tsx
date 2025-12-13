import { useStore } from "@/hooks/useStore"
import { useScraper } from "@/hooks/useScraper"
import { ScraperForm } from "@/components/features/ScraperForm"
import { StatsCard } from "@/components/features/StatsCard"
import { ResultsTable } from "@/components/features/ResultsTable"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { AlertCircle, FileText, ImageIcon } from "lucide-react"

export default function Home() {
    const { apiKey } = useStore()
    const { scrape, loading, progress, data, error } = useScraper()

    // Extract unique videos for display
    const uniqueVideos = Array.from(new Set(data.map(d => d.url))).map(url => {
        const item = data.find(d => d.url === url)
        return {
            url,
            title: item?.videoTitle || "Unknown Video",
            cover: item?.videoCover
        }
    })

    // Group comments counts
    const getCommentsCountForVideo = (url: string) => data.filter(d => d.url === url).length

    if (!apiKey) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="p-6 bg-red-500/10 text-red-500 rounded-full ring-1 ring-red-500/20 shadow-2xl">
                    <AlertCircle size={48} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Configuration Required</h2>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        Please configure your Apify API Token to access the secure scraping tunnel.
                    </p>
                </div>
                <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-red-500/20">
                    <Link to="/settings">Setup API Access</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
            {/* Background Glows */}
            <div className="fixed top-20 left-10 w-72 h-72 bg-[hsl(var(--tiktok-cyan)/0.15)] rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="fixed bottom-20 right-10 w-96 h-96 bg-[hsl(var(--tiktok-pink)/0.1)] rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="space-y-2 text-center pt-8">
                <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground/80 mb-2 block animate-in fade-in zoom-in duration-500">
                    Proprietary Data Extraction Engine
                </span>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-balance bg-tiktok-gradient bg-clip-text text-transparent drop-shadow-sm">
                    TikTok Intelligence
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                    Extract deep insights, sentiment, and engagement metrics from the <span className="text-foreground font-semibold">#1 Social Platform</span>.
                </p>
            </div>

            <ScraperForm onScrape={scrape} loading={loading} />

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive border-destructive/20 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 flex items-center gap-3 border shadow-lg shadow-destructive/5">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading && (
                <div className="glass rounded-xl p-12 text-center space-y-6">
                    <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold animate-pulse">{progress}</h3>
                        <p className="text-muted-foreground text-sm">This process may take a few minutes depending on volume.</p>
                    </div>
                </div>
            )}

            {!loading && data.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Dataset Review Section */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="text-primary" size={20} />
                            Dataset Review
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {uniqueVideos.map((video, idx) => (
                                <div key={idx} className="glass p-4 rounded-xl flex gap-4 items-start group hover:border-tiktok-cyan/50 hover:shadow-tiktok-cyan/20 transition-all duration-300">
                                    <div className="h-20 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0 relative ring-1 ring-white/10 group-hover:ring-tiktok-cyan/50 transition-all">
                                        {video.cover ? (
                                            <img src={video.cover} alt="Cover" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-accent">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-transparent group-hover:bg-tiktok-gradient group-hover:bg-clip-text transition-all">
                                            {video.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-tiktok-pink animate-pulse"></span>
                                            {getCommentsCountForVideo(video.url)} items extracted
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <StatsCard data={data} />
                    <ResultsTable data={data} />
                </div>
            )}
        </div>
    )
}
