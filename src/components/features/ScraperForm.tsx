import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Plus, Trash2, Video, MessageCircle, Globe, Calendar } from "lucide-react"
import { PasswordModal } from "./PasswordModal"

export interface DiscoveryOptions {
    keyword: string
    startDate: string
    endDate: string
}

interface ScraperFormProps {
    onScrape: (urls: string[], count: number, repliesCount: number, discoveryOptions?: DiscoveryOptions) => void
    loading: boolean
}

// TOGGLE THIS TO DISABLE/ENABLE PIN PROTECTION
const ENABLE_PIN_PROTECTION = true

export function ScraperForm({ onScrape, loading }: ScraperFormProps) {
    // Mode State
    const [searchMode, setSearchMode] = useState<'url' | 'discovery'>('url')

    // URL Mode State
    const [urls, setUrls] = useState<string[]>([""])

    // Discovery Mode State
    const [keyword, setKeyword] = useState("")
    const [selectedStartDate, setSelectedStartDate] = useState("")
    const [selectedEndDate, setSelectedEndDate] = useState("")

    // Common State
    const [count, setCount] = useState(100)
    const [repliesCount, setRepliesCount] = useState(0)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...urls]
        newUrls[index] = value
        setUrls(newUrls)
    }

    const addUrlField = () => {
        setUrls([...urls, ""])
    }

    const removeUrlField = (index: number) => {
        if (urls.length > 1) {
            const newUrls = urls.filter((_, i) => i !== index)
            setUrls(newUrls)
        }
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (searchMode === 'url') {
            const validUrls = urls.filter(u => u.trim().length > 0)
            if (validUrls.length === 0) return
        } else {
            if (!keyword.trim()) return
        }

        if (ENABLE_PIN_PROTECTION) {
            setShowPasswordModal(true)
        } else {
            submitScrape()
        }
    }

    const submitScrape = () => {
        if (searchMode === 'url') {
            const validUrls = urls.filter(u => u.trim().length > 0)
            if (validUrls.length > 0) onScrape(validUrls, count, repliesCount)
        } else {
            // Discovery Mode
            onScrape([], count, repliesCount, {
                keyword,
                startDate: selectedStartDate,
                endDate: selectedEndDate
            })
        }
    }

    return (
        <div className="glass rounded-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Mode Switch */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Button
                        type="button"
                        variant={searchMode === 'url' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setSearchMode('url')}
                        className={`text-xs font-bold ${searchMode === 'url' ? 'bg-background shadow-sm text-tiktok-cyan' : 'text-muted-foreground'}`}
                    >
                        <Video size={14} className="mr-2" /> Direct URLs
                    </Button>
                    <Button
                        type="button"
                        variant={searchMode === 'discovery' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setSearchMode('discovery')}
                        className={`text-xs font-bold ${searchMode === 'discovery' ? 'bg-background shadow-sm text-tiktok-pink' : 'text-muted-foreground'}`}
                    >
                        <Globe size={14} className="mr-2" /> Monthly Discovery
                    </Button>
                </div>

                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full border border-white/5">
                    {searchMode === 'url' ? `${urls.length} Video${urls.length > 1 ? 's' : ''}` : 'Google Search Intelligence'}
                </span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">

                {/* DIRECT URL INPUTS */}
                {searchMode === 'url' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        {urls.map((url, index) => (
                            <div key={index} className="flex gap-3 group">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="https://www.tiktok.com/@user/video/..."
                                        value={url}
                                        onChange={(e) => handleUrlChange(index, e.target.value)}
                                        className="pl-4 pr-4 bg-background/50 border-input focus:border-tiktok-cyan focus:ring-1 focus:ring-tiktok-cyan transition-all"
                                        required={index === 0}
                                    />
                                </div>
                                {urls.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeUrlField(index)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addUrlField}
                            className="w-full border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                            <Plus size={16} className="mr-2" /> Add Another Video
                        </Button>
                    </div>
                )}

                {/* DISCOVERY INPUTS */}
                {searchMode === 'discovery' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Target Keyword</label>
                            <Input
                                placeholder="e.g. 'Skincare Review', 'Politics Indonesia', 'Tech News'"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="bg-background/50 border-input focus:border-tiktok-pink focus:ring-1 focus:ring-tiktok-pink transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                                    <Calendar size={12} /> Start Date
                                </label>
                                <Input
                                    type="date"
                                    value={selectedStartDate}
                                    onChange={(e) => setSelectedStartDate(e.target.value)}
                                    className="bg-background/50 border-input focus:border-tiktok-pink focus:ring-1 focus:ring-tiktok-pink"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                                    <Calendar size={12} /> End Date
                                </label>
                                <Input
                                    type="date"
                                    value={selectedEndDate}
                                    onChange={(e) => setSelectedEndDate(e.target.value)}
                                    className="bg-background/50 border-input focus:border-tiktok-pink focus:ring-1 focus:ring-tiktok-pink"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] text-muted-foreground bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                <Globe size={10} className="inline mr-1" />
                                System will use Google Dorking to find videos posted between <strong>{selectedStartDate || '...'}</strong> and <strong>{selectedEndDate || '...'}</strong>.
                            </p>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500 w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Search Region: <strong>Indonesia 🇮🇩</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* COMMON SETTINGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <MessageCircle size={14} />
                            Max Comments {searchMode === 'discovery' ? 'per Video' : 'per Video'}
                        </label>
                        <Input
                            type="number"
                            min={1}
                            max={10000}
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="bg-background/50 border-input focus:border-tiktok-cyan focus:ring-1 focus:ring-tiktok-cyan"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            {searchMode === 'discovery' ? 'Applied to each discovered video (Limits: 100 max videos).' : 'Total limits for top-level comments.'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <MessageCircle size={14} className="scale-x-[-1]" />
                            Max Replies per Comment
                        </label>
                        <Input
                            type="number"
                            min={0}
                            max={1000}
                            value={repliesCount}
                            onChange={(e) => setRepliesCount(Number(e.target.value))}
                            className="bg-background/50 border-input focus:border-tiktok-pink focus:ring-1 focus:ring-tiktok-pink"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Set 0 to disable scraping replies (faster).
                        </p>
                    </div>
                </div>

                <Button
                    disabled={loading}
                    type="submit"
                    className={`w-full h-12 text-base font-bold text-white shadow-lg hover:scale-[1.01] transition-all duration-300 border-0 ${searchMode === 'url'
                        ? 'bg-tiktok-gradient shadow-tiktok-cyan/20 hover:shadow-tiktok-pink/40'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-500/20 hover:shadow-purple-500/40'
                        }`}
                >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (searchMode === 'url' ? <Search className="mr-2 h-5 w-5" /> : <Globe className="mr-2 h-5 w-5" />)}
                    {loading ? "Agent Working..." : (searchMode === 'url' ? "Start Scraping Analysis" : "Start Monthly Discovery")}
                </Button>
            </form>

            <PasswordModal
                isOpen={showPasswordModal}
                onOpenChange={setShowPasswordModal}
                onSuccess={submitScrape}
            />
        </div>
    )
}
