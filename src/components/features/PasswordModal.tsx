import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LockKeyhole, ExternalLink } from "lucide-react"

interface PasswordModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function PasswordModal({ isOpen, onOpenChange, onSuccess }: PasswordModalProps) {
    const [pin, setPin] = useState("")
    const [error, setError] = useState(false)

    // Using the user-provided PIN
    const CORRECT_PIN = "050597"
    const CONTACT_LINK = "http://lynk.id/habib.creations/6w31og8jmmvr" // Placeholder as discussed, user to update

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (pin === CORRECT_PIN) {
            onSuccess()
            onOpenChange(false)
            setPin("")
            setError(false)
        } else {
            setError(true)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <div className="mx-auto bg-tiktok-cyan/10 p-3 rounded-full mb-4 w-fit ring-1 ring-tiktok-cyan/30">
                        <LockKeyhole className="w-6 h-6 text-tiktok-cyan" />
                    </div>
                    <DialogTitle className="text-center text-xl">Unlock Access</DialogTitle>
                    <DialogDescription className="text-center">
                        This specialized tool is protected. Please enter the PIN code to continue.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter PIN Code"
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value)
                                setError(false)
                            }}
                            className={`text-center tracking-widest text-lg h-12 bg-muted/50 ${error ? 'border-destructive focus:ring-destructive' : 'focus:border-tiktok-cyan focus:ring-tiktok-cyan'}`}
                            autoFocus
                        />
                        {error && (
                            <p className="text-xs text-center text-destructive animate-in slide-in-from-top-1">
                                Incorrect PIN code. Please try again.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="flex-col !space-x-0 gap-3 pt-4">
                        <Button
                            type="submit"
                            className="w-full bg-tiktok-gradient hover:opacity-90 transition-opacity font-semibold h-11"
                        >
                            Verify & Start Scraping
                        </Button>

                        <div className="text-center pt-2">
                            <a
                                href={CONTACT_LINK}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs px-6 py-2.5 rounded-full bg-gradient-to-r from-tiktok-cyan to-blue-500 text-white shadow-lg hover:shadow-tiktok-cyan/50 hover:scale-[1.02] transition-all inline-flex items-center gap-2 group font-semibold tracking-wide"
                            >
                                Contact Admin to get PIN
                                <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
