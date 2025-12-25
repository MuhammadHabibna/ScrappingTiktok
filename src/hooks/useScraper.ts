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

            // TASK 1: Cache Breaker - Append Timestamp
            const runResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}&ts=${Date.now()}`);
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

        // TASK 1: Mandatory State Reset - Clear existing data immediately
        setState(prev => ({
            ...prev,
            loading: true,
            data: [],
            error: null,
            progress: 'Starting...'
        }));

        let targetUrls = initialUrls;

        try {
            // STEP 1: DISCOVERY (If applicable)
            if (discoveryOptions) {
                const { keyword, startDate, endDate, disableRegionFilter } = discoveryOptions;

                // Task 2: Dynamic Query Verification - EXCLUSIVELY use targetKeyword
                const query = `site:tiktok.com "${keyword}" after:${startDate} before:${endDate}`;

                // Task 3: Detailed UI Feedback
                setState({
                    loading: true,
                    progress: `Searching Google for: ${keyword}...`,
                    data: [],
                    error: null,
                    runId: null
                });

                // Construct Input Payload
                // Base payload
                const input: any = {
                    "queries": query,
                    "maxPagesPerQuery": 1,
                    "resultsPerPage": 100,
                    "mobileResults": false,
                    "saveHtml": false,
                    "saveHtmlToKeyValueStore": false,
                    "includeUnfilteredResults": false
                };



                // Task 2: Strict Indonesian Content Lock - Google Side
                if (!disableRegionFilter) {
                    input["languageCode"] = "id";
                    input["countryCode"] = "id";
                    input["googleHost"] = "google.co.id";
                }

                // Task 3: Final Query Validation
                console.log("[Validation] Target Keyword:", keyword);
                console.log("[Validation] Final Payload:", JSON.stringify(input, null, 2));

                // Final Query Log
                console.log("FINAL QUERY:", input.queries);
                console.log("FULL PAYLOAD:", input);

                // Debug Log
                console.log("Adding Google Scraper Task with Payload:", input);

                // TASK 1: Cache Breaker - Append Timestamp for Start Run
                const googleRunResponse = await fetch(`https://api.apify.com/v2/acts/apify~google-search-scraper/runs?token=${apiKey}&ts=${Date.now()}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input)
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

                // Fetch Google Results - Cache Breaker
                const googleDatasetId = googleRunData.data.defaultDatasetId;
                const googleItemsResponse = await fetch(`https://api.apify.com/v2/datasets/${googleDatasetId}/items?token=${apiKey}&ts=${Date.now()}`);
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

            // Start TikTok Scraper - Cache Breaker
            const tiktokRunResponse = await fetch(`https://api.apify.com/v2/acts/clockworks~tiktok-comments-scraper/runs?token=${apiKey}&ts=${Date.now()}`, {
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
            const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apiKey}&ts=${Date.now()}`);
            const items = await itemsResponse.json();

            // POST-SCRAPE VALIDATION
            const isIndonesian = (text: string) => {
                // Task 2: Strict Indonsian Content Lock - Frontend Filter
                const stopWords = ['yang', 'dan', 'di', 'ini', 'itu', 'ada', 'bisa', 'dari', 'ke', 'buat'];
                const lowerText = text.toLowerCase();
                return stopWords.some(word => lowerText.includes(` ${word} `) || lowerText.startsWith(`${word} `) || lowerText.endsWith(` ${word}`) || lowerText === word);
            };

            const mappedData: CommentData[] = items
                .map((item: Record<string, any>) => ({
                    text: item.text,
                    authorName: item.authorName,
                    authorUniqueId: item.authorUniqueId,
                    createTime: item.createTime, // Unix timestamp in seconds
                    likes: item.diggCount,
                    replies: item.replyCount,
                    url: item.videoWebUrl,
                    videoTitle: item.videoTitle || item.desc || "Unknown Video",
                    videoCover: item.videoCover || item.videoAuthorAvatar
                }))

                .filter((comment: CommentData) => {
                    // Filter 1: Language Validation (Strict Indonesian Check)
                    // ALWAYS apply strict filter if discovery mode (unless explicitly global, but user requested Strict Lock)
                    if (discoveryOptions && !discoveryOptions.disableRegionFilter) {
                        return isIndonesian(comment.text);
                    }

                    // Filter 2: Date Validation (Double check strict range)
                    if (discoveryOptions) {
                        const commentDate = new Date(comment.createTime * 1000);
                        const start = new Date(discoveryOptions.startDate);
                        const end = new Date(discoveryOptions.endDate);
                        end.setHours(23, 59, 59);
                        return commentDate >= start && commentDate <= end;
                    }
                    return true;
                });

            // Task 3: Final Query Validation - Log Results
            console.log(`[Validation] Total Items: ${items.length}, After Filter: ${mappedData.length}`);

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
