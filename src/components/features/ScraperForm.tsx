import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Plus, Trash2, Video, MessageCircle } from "lucide-react"
import { PasswordModal } from "./PasswordModal"

interface ScraperFormProps {
    onScrape: (urls: string[], count: number, repliesCount: number) => void
    loading: boolean
}

// TOGGLE THIS TO DISABLE/ENABLE PIN PROTECTION
const ENABLE_PIN_PROTECTION = true

export function ScraperForm({ onScrape, loading }: ScraperFormProps) {
    const [urls, setUrls] = useState<string[]>([""])
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
        const validUrls = urls.filter(u => u.trim().length > 0)
        if (validUrls.length > 0) {
            if (ENABLE_PIN_PROTECTION) {
                setShowPasswordModal(true)
            } else {
                onScrape(validUrls, count, repliesCount)
            }
        }
    }

    const handleScrapeStart = () => {
        const validUrls = urls.filter(u => u.trim().length > 0)
        if (validUrls.length > 0) onScrape(validUrls, count, repliesCount)
    }

    return (
        <div className="glass rounded-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Video className="text-tiktok-cyan drop-shadow-sm" />
                    Target Videos
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {urls.length} Video{urls.length > 1 ? 's' : ''}
                </span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-3">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <MessageCircle size={14} />
                            Max Comments per Video
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
                            Total limits for top-level comments.
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
                    className="w-full h-12 text-base font-bold bg-tiktok-gradient text-white shadow-lg shadow-tiktok-cyan/20 hover:shadow-tiktok-pink/40 hover:scale-[1.01] transition-all duration-300 border-0"
                >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                    {loading ? "Initializing Scraper Agent..." : "Start Scraping Analysis"}
                </Button>
            </form>

            <PasswordModal
                isOpen={showPasswordModal}
                onOpenChange={setShowPasswordModal}
                onSuccess={handleScrapeStart}
            />
        </div>
    )
}
