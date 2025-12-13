import { useState } from 'react';
import { useStore } from './useStore';

export interface CommentData {
    text: string;
    authorName: string;
    authorUniqueId: string;
    createTime: number;
    likes: number;
    replies: number;
    url: string;
    // Metadata for dataset review
    videoTitle?: string;
    videoCover?: string;
}

interface ScraperState {
    loading: boolean;
    progress: string;
    data: CommentData[];
    error: string | null;
    runId: string | null;
}

export function useScraper() {
    const { apiKey, addToHistory } = useStore();
    const [state, setState] = useState<ScraperState>({
        loading: false,
        progress: '',
        data: [],
        error: null,
        runId: null,
    });

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const scrape = async (videoUrls: string[], maxComments: number = 100, maxReplies: number = 0) => {
        if (!apiKey) {
            setState(prev => ({ ...prev, error: "API Key is missing. Please check Settings." }));
            return;
        }

        setState({ loading: true, progress: 'Allocating Scraper Container...', data: [], error: null, runId: null });

        try {
            // 1. Start the Actor
            // Using 'clockworks/tiktok-comments-scraper'
            const startResponse = await fetch(`https://api.apify.com/v2/acts/clockworks~tiktok-comments-scraper/runs?token=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postURLs: videoUrls,
                    commentsPerPost: maxComments,
                    maxRepliesPerComment: maxReplies,
                })
            });

            if (!startResponse.ok) {
                if (startResponse.status === 401) throw new Error("Invalid API Key");
                throw new Error(`Failed to start actor: ${startResponse.statusText}`);
            }

            const startData = await startResponse.json();
            const runId = startData.data.id;
            const defaultDatasetId = startData.data.defaultDatasetId;

            setState(prev => ({ ...prev, runId, progress: 'Agent Started. Warming up...' }));

            // 2. Poll for completion
            let status = 'RUNNING';
            let seconds = 0;

            while (status === 'RUNNING' || status === 'READY') {
                await sleep(3000);
                seconds += 3;

                // Fetch run info to check detailed status
                const runResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
                const runData = await runResponse.json();
                status = runData.data.status;

                // Granular feedback
                if (status === 'READY') {
                    setState(prev => ({ ...prev, progress: `Agent booting up... (${seconds}s)` }));
                } else if (status === 'RUNNING') {
                    setState(prev => ({ ...prev, progress: `Scraping Comments... (${seconds}s elapsed)` }));
                }

                if (status === 'FAILED' || status === 'ABORTED') {
                    throw new Error('Scraper run failed or was aborted by server.');
                }
            }

            // 3. Fetch Results
            setState(prev => ({ ...prev, progress: 'Finalizing & Downloading Dataset...' }));
            const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apiKey}`);
            const items = await itemsResponse.json();

            // Map items to CommentData AND extract Metadata if available
            const mappedData: CommentData[] = items.map((item: Record<string, any>) => ({
                text: item.text,
                authorName: item.authorName,
                authorUniqueId: item.authorUniqueId,
                createTime: item.createTime,
                likes: item.diggCount,
                replies: item.replyCount,
                url: item.videoWebUrl,
                // Attempt to find metadata. Often apify actors duplicate video info on each comment line
                // or sometimes usually just the `videoWebUrl` is consistent.
                // We will try to see if `videoCover` exists, if not, we leave undefined.
                videoTitle: item.videoTitle || item.desc || "Unknown Video",
                videoCover: item.videoCover || item.videoAuthorAvatar // Use author avatar as fallback if cover missing
            }));

            setState({
                loading: false,
                progress: 'Analysis Complete.',
                data: mappedData,
                error: null,
                runId
            });

            // Add to history
            addToHistory({
                id: runId,
                date: Date.now(),
                urls: videoUrls,
                totalComments: mappedData.length,
                videoCover: mappedData[0]?.videoCover
            });

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error(err);
            setState({
                loading: false,
                progress: '',
                data: [],
                error: errorMessage,
                runId: null
            });
        }
    };

    return { ...state, scrape };
}
