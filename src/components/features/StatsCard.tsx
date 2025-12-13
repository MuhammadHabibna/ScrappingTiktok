import { MessageSquare, ThumbsUp, Users } from "lucide-react"
import { CommentData } from "@/hooks/useScraper"

interface StatsCardProps {
    data: CommentData[]
}

export function StatsCard({ data }: StatsCardProps) {
    const totalComments = data.length
    const totalLikes = data.reduce((acc, curr) => acc + curr.likes, 0)
    const uniqueAuthors = new Set(data.map(c => c.authorUniqueId)).size

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-xl flex items-center gap-5 relative overflow-hidden group border-white/5 hover:border-tiktok-cyan/50 hover:shadow-tiktok-cyan/10 transition-all duration-300">
                <div className="absolute -right-4 -top-4 bg-tiktok-cyan/10 h-24 w-24 rounded-full blur-2xl group-hover:bg-tiktok-cyan/20 transition-all"></div>
                <div className="h-12 w-12 bg-tiktok-cyan/10 text-tiktok-cyan rounded-xl flex items-center justify-center shadow-lg shadow-tiktok-cyan/10">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                    <p className="text-3xl font-bold tracking-tight">{totalComments.toLocaleString()}</p>
                </div>
            </div>

            <div className="glass p-6 rounded-xl flex items-center gap-5 relative overflow-hidden group border-white/5 hover:border-tiktok-pink/50 hover:shadow-tiktok-pink/10 transition-all duration-300">
                <div className="absolute -right-4 -top-4 bg-tiktok-pink/10 h-24 w-24 rounded-full blur-2xl group-hover:bg-tiktok-pink/20 transition-all"></div>
                <div className="h-12 w-12 bg-tiktok-pink/10 text-tiktok-pink rounded-xl flex items-center justify-center shadow-lg shadow-tiktok-pink/10">
                    <ThumbsUp size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                    <p className="text-3xl font-bold tracking-tight">{totalLikes.toLocaleString()}</p>
                </div>
            </div>

            <div className="glass p-6 rounded-xl flex items-center gap-5 relative overflow-hidden group border-white/5 hover:border-white/20 transition-all duration-300">
                <div className="absolute -right-4 -top-4 bg-foreground/5 h-24 w-24 rounded-full blur-2xl group-hover:bg-foreground/10 transition-all"></div>
                <div className="h-12 w-12 bg-foreground/5 text-foreground rounded-xl flex items-center justify-center shadow-lg shadow-foreground/5">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Unique Voices</p>
                    <p className="text-3xl font-bold tracking-tight">{uniqueAuthors.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}
