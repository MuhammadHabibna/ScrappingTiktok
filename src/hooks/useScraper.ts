import { useState } from 'react';
import { useStore } from './useStore';
import { DiscoveryOptions } from '@/components/features/ScraperForm';

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

    const waitForRun = async (runId: string, statusCallback?: (status: string, seconds: number) => void) => {
        let status = 'RUNNING';
        let seconds = 0;
        let runData = null;

        while (status === 'RUNNING' || status === 'READY') {
            await sleep(3000);
            seconds += 3;

            const runResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
            runData = await runResponse.json();
            status = runData.data.status;

            if (statusCallback) statusCallback(status, seconds);

            if (status === 'FAILED' || status === 'ABORTED') {
                throw new Error(`Run ${runId} failed or was aborted.`);
            }
        }
        return runData; // Return final run data
    };

    const scrape = async (
        initialUrls: string[],
        maxComments: number = 100,
        maxReplies: number = 0,
        discoveryOptions?: DiscoveryOptions
    ) => {
        if (!apiKey) {
            setState(prev => ({ ...prev, error: "API Key is missing. Please check Settings." }));
            return;
        }

        let targetUrls = initialUrls;

        try {
            // STEP 1: DISCOVERY (If applicable)
            if (discoveryOptions) {
                const { keyword, startDate, endDate } = discoveryOptions;
                const query = `site:tiktok.com "${keyword}" after:${startDate} before:${endDate}`;

                setState({ loading: true, progress: `Phase 1/3: Indexing videos for "${keyword}"...`, data: [], error: null, runId: null });

                // Start Google Scraper
                const googleRunResponse = await fetch(`https://api.apify.com/v2/acts/apify~google-search-scraper/runs?token=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        queries: [query],
                        maxPagesPerQuery: 1,
                        resultsPerPage: 100, // Limit to 100 as requested
                        saveHtml: false,
                        saveHtmlToKeyValueStore: false,
                        includeUnfilteredResults: false
                    })
                });

                if (!googleRunResponse.ok) {
                    let details = "";
                    try {
                        const errData = await googleRunResponse.json();
                        details = errData.error?.message || JSON.stringify(errData);
                    } catch (e) {
                        details = "No details available.";
                    }
                    throw new Error(`Failed to start Google Discovery Agent (${googleRunResponse.status} ${googleRunResponse.statusText}): ${details}`);
                }

                const googleRunData = await googleRunResponse.json();
                const googleRunId = googleRunData.data.id;

                // Wait for Google Scraper
                await waitForRun(googleRunId, (_, sec) => {
                    setState(prev => ({ ...prev, progress: `Phase 1/3: Discovering videos... (${sec}s)` }));
                });

                // Fetch Google Results
                const googleDatasetId = googleRunData.data.defaultDatasetId;
                const googleItemsResponse = await fetch(`https://api.apify.com/v2/datasets/${googleDatasetId}/items?token=${apiKey}`);
                const googleItems = await googleItemsResponse.json();

                // Extract TikTok URLs
                // Google scraper appends organic results in 'organicResults' array or top-level depending on config.
                // Usually it returns a list of items where each item represents a search result page, containing 'organicResults'.

                const discoveredUrls: string[] = [];
                googleItems.forEach((page: any) => {
                    if (page.organicResults) {
                        page.organicResults.forEach((result: any) => {
                            if (result.url && result.url.includes('tiktok.com')) {
                                discoveredUrls.push(result.url);
                            }
                        });
                    }
                });

                // Remove duplicates and limit to 100
                targetUrls = [...new Set(discoveredUrls)].slice(0, 100);

                if (targetUrls.length === 0) {
                    throw new Error(`No TikTok videos found for "${keyword}" in ${discoveryOptions.startDate.substring(0, 7)}.`);
                }
            }

            // STEP 2: TIKTOK SCRAPING
            const stepPrefix = discoveryOptions ? "Phase 2/3" : "Phase 1/1";
            setState(prev => ({ ...prev, progress: `${stepPrefix}: Allocating Analysis Container (${targetUrls.length} videos)...` }));

            // Start TikTok Scraper
            const tiktokRunResponse = await fetch(`https://api.apify.com/v2/acts/clockworks~tiktok-comments-scraper/runs?token=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postURLs: targetUrls,
                    commentsPerPost: maxComments,
                    maxRepliesPerComment: maxReplies,
                })
            });

            if (!tiktokRunResponse.ok) {
                if (tiktokRunResponse.status === 401) throw new Error("Invalid API Key");
                throw new Error(`Failed to start TikTok scraper: ${tiktokRunResponse.statusText}`);
            }

            const tiktokRunData = await tiktokRunResponse.json();
            const runId = tiktokRunData.data.id;
            const defaultDatasetId = tiktokRunData.data.defaultDatasetId;

            setState(prev => ({ ...prev, runId, progress: `${stepPrefix}: Agent warming up...` }));

            // Wait for TikTok Scraper
            await waitForRun(runId, (status, sec) => {
                if (status === 'READY') {
                    setState(prev => ({ ...prev, progress: `${stepPrefix}: Agent booting up... (${sec}s)` }));
                } else if (status === 'RUNNING') {
                    setState(prev => ({ ...prev, progress: `${stepPrefix}: Scraping Comments... (${sec}s elapsed)` }));
                }
            });

            // STEP 3: PROCESS RESULTS
            setState(prev => ({ ...prev, progress: discoveryOptions ? 'Phase 3/3: Finalizing Dataset...' : 'Finalizing Dataset...' }));
            const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apiKey}`);
            const items = await itemsResponse.json();

            const mappedData: CommentData[] = items.map((item: Record<string, any>) => ({
                text: item.text,
                authorName: item.authorName,
                authorUniqueId: item.authorUniqueId,
                createTime: item.createTime,
                likes: item.diggCount,
                replies: item.replyCount,
                url: item.videoWebUrl,
                videoTitle: item.videoTitle || item.desc || "Unknown Video",
                videoCover: item.videoCover || item.videoAuthorAvatar
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
                urls: targetUrls.slice(0, 5), // Store first 5 urls only to save space
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
