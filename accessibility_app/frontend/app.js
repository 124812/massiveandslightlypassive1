document.addEventListener('DOMContentLoaded', async () => {
    const generateBtn = document.getElementById('generateBtn');
    const rawBtn = document.getElementById('rawBtn');
    const buttonGroup = document.querySelector('.button-group');
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    const errorState = document.getElementById('errorState');
    const errorText = document.getElementById('errorText');
    const transcriptText = document.getElementById('transcriptText');
    const audioPlayer = document.getElementById('audioPlayer');
    const visualizer = document.querySelector('.audio-visualizer');
    const retroSpinner = document.querySelector('.retro-spinner');

    let GEMINI_API_KEY = "";
    let ELEVENLABS_API_KEY = "";
    let JUPYTER_TOKEN = "";

    try {
        const envRes = await fetch('/.env');
        if (envRes.ok) {
            const envText = await envRes.text();
            envText.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('GEMINI_API_KEY=')) GEMINI_API_KEY = trimmed.split('=')[1].trim();
                if (trimmed.startsWith('ELEVENLABS_API_KEY=')) ELEVENLABS_API_KEY = trimmed.split('=')[1].trim();
                if (trimmed.startsWith('JUPYTER_TOKEN=')) JUPYTER_TOKEN = trimmed.split('=')[1].trim();
            });
        }
    } catch (e) {
        console.error("Failed to load .env", e);
    }

    // Spinner Animation
    const spinnerFrames = ['[ | ]', '[ / ]', '[ - ]', '[ \\ ]'];
    let spinnerIndex = 0;
    let spinnerInterval;

    visualizer.classList.add('paused');

    const JUPYTER_BASE = "http://localhost:8888";

    async function extractNotebookResults() {
        try {
            // Try Jupyter REST API first (gets latest outputs, even unsaved)
            let nbData;
            try {
                const apiUrl = `${JUPYTER_BASE}/api/contents/strategy_v2.ipynb?content=1&token=${JUPYTER_TOKEN}`;
                const apiRes = await fetch(apiUrl);
                if (apiRes.ok) {
                    const apiData = await apiRes.json();
                    nbData = apiData.content; // Jupyter API wraps notebook in .content
                    console.log("Fetched notebook from Jupyter API (live data)");
                }
            } catch (e) {
                console.log("Jupyter API not available, falling back to static file");
            }

            // Fallback: fetch static .ipynb file
            if (!nbData) {
                const nbRes = await fetch('/strategy_v2.ipynb');
                if (!nbRes.ok) throw new Error("Could not fetch the notebook file");
                nbData = await nbRes.json();
                console.log("Fetched notebook from static file");
            }

            let allOutputs = "";

            for (const cell of nbData.cells) {
                if (cell.outputs) {
                    for (const out of cell.outputs) {
                        if (out.text) {
                            const text = Array.isArray(out.text) ? out.text.join("") : out.text;
                            allOutputs += text + "\\n";
                        } else if (out.data && out.data['text/plain']) {
                            const text = Array.isArray(out.data['text/plain']) ? out.data['text/plain'].join("") : out.data['text/plain'];
                            allOutputs += text + "\\n";
                        }
                    }
                }
            }

            // If notebook is huge, grab the last 3000 characters which usually contain the final analysis/results
            if (allOutputs.length > 3000) {
                allOutputs = "... " + allOutputs.substring(allOutputs.length - 3000);
            }

            return allOutputs || "No outputs found in the notebook.";
        } catch (e) {
            console.error("Error reading notebook:", e);
            return "Could not extract real data from notebook. Please check if it's named 'strategy_v2.ipynb'.";
        }
    }



    async function handleGenerate(mode) {
        buttonGroup.classList.add('hidden');
        errorState.classList.add('hidden');
        resultState.classList.add('hidden');
        loadingState.classList.remove('hidden');

        spinnerInterval = setInterval(() => {
            spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
            retroSpinner.textContent = spinnerFrames[spinnerIndex];
        }, 150);

        try {
            const notebookData = await extractNotebookResults();
            let textToRead = "";

            if (mode === 'raw') {
                textToRead = "Here are the raw results from the Jupyter Notebook: " + notebookData;
            } else {
                const prompt = `You are a financial analyst giving a concise audio briefing. Summarize the following algorithmic trading results in under 200 words.
Cover these metrics only: Sharpe Ratio, Sortino Ratio, Confidence Score, Net Returns, Max Drawdown, and CAGR.
Then use your real-time search capabilities to retrieve the actual 1-year performance of SPY (S&P 500 ETF) from Yahoo Finance and compare the strategy's performance against the SPY buy and hold annualized return over the past year.
Rules:
- Say "SP500" as "S P 500", and "SPY" as "S P Y"
- Say "SPY buy and hold annualized return" in full when comparing
- Keep all numbers as digits, do not spell them out as words (say "12.5 percent" not "twelve point five percent")
- Do not use emojis, asterisks, bullet points, or any formatting
- Speak naturally and conversationally

Extracted Notebook Results:
${notebookData}`;

                // Updated to gemini-3.8-flash
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

                const geminiRes = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        tools: [{ googleSearch: {} }]
                    })
                });

                if (!geminiRes.ok) {
                    const err = await geminiRes.text();
                    throw new Error("Gemini Error: " + err);
                }

                const geminiData = await geminiRes.json();
                textToRead = geminiData.candidates[0].content.parts[0].text;
            }

            transcriptText.textContent = textToRead;

            // Call ElevenLabs
            const elRes = await fetch("https://api.elevenlabs.io/v1/text-to-speech/bfGb7JTLUnZebZRiFYyq", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: textToRead,
                    model_id: "eleven_v3",
                    voice_settings: { stability: 0.5, similarity_boost: 0.5 }
                })
            });

            if (!elRes.ok) {
                const err = await elRes.text();
                throw new Error("ElevenLabs Error: " + err);
            }

            const audioBlob = await elRes.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            audioPlayer.src = audioUrl;

            clearInterval(spinnerInterval);
            loadingState.classList.add('hidden');
            resultState.classList.remove('hidden');

            audioPlayer.play().catch(e => {
                console.log("Autoplay blocked", e);
            });

        } catch (error) {
            console.error('Error:', error);
            clearInterval(spinnerInterval);
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');
            errorText.textContent = error.message;
            buttonGroup.classList.remove('hidden');
        }
    }

    generateBtn.addEventListener('click', () => handleGenerate('ai'));
    rawBtn.addEventListener('click', () => handleGenerate('raw'));

    audioPlayer.addEventListener('play', () => visualizer.classList.remove('paused'));
    audioPlayer.addEventListener('pause', () => visualizer.classList.add('paused'));
    audioPlayer.addEventListener('ended', () => {
        visualizer.classList.add('paused');
        setTimeout(() => buttonGroup.classList.remove('hidden'), 1000);
    });
});
