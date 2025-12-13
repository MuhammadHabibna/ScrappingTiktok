import { useEffect, useState } from "react"
import { useStore } from "@/hooks/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sun, Moon, HelpCircle, ExternalLink, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
    const { apiKey, setApiKey, theme, setTheme } = useStore()
    const [keyInput, setKeyInput] = useState(apiKey)
    const [showHelp, setShowHelp] = useState(false)

    useEffect(() => {
        setKeyInput(apiKey)
    }, [apiKey])

    const handleSave = () => {
        setApiKey(keyInput)
        alert("API Key Saved!")
    }

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your API connections and preferences.</p>
            </div>

            <div className="glass rounded-xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <SettingsIcon className="text-primary" size={20} />
                        Apify Configuration
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary gap-2"
                        onClick={() => setShowHelp(!showHelp)}
                    >
                        <HelpCircle size={16} />
                        <span className="text-xs">Where do I get this?</span>
                    </Button>
                </div>

                {showHelp && (
                    <div className="bg-primary/5 p-4 rounded-lg text-sm space-y-3 border border-primary/10 animate-in fade-in slide-in-from-top-2">
                        <p className="font-medium text-primary">How to get your Apify API Token:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                            <li>Log in to your <a href="https://console.apify.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Apify Console</a>.</li>
                            <li>Go to <strong>Settings</strong> &gt; <strong>Integrations</strong>.</li>
                            <li>Copy your <strong>Personal API Token</strong>.</li>
                        </ol>
                        <div className="pt-2">
                            <a
                                href="https://console.apify.com/settings/integrations"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                            >
                                <ExternalLink size={14} />
                                Go to Apify Integrations Page
                            </a>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-sm font-medium leading-none text-muted-foreground">
                        API Token
                    </label>
                    <div className="flex gap-3">
                        <Input
                            type="password"
                            placeholder="apify_api_..."
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            className="bg-background/50 border-input"
                        />
                        <Button onClick={handleSave} className="shadow-lg shadow-primary/20">Save Token</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Securely stored in your browser
                    </p>
                </div>
            </div>

            <div className="glass rounded-xl p-8 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Sun className="text-primary" size={20} />
                    Appearance
                </h2>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Interface Mode</span>
                    <Button variant="outline" size="icon" onClick={toggleTheme} className="border-border hover:bg-accent">
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
