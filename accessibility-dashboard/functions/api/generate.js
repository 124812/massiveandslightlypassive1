export async function onRequestPost(context) {
    return handleRequest(context);
}

export async function onRequestGet(context) {
    return handleRequest(context);
}

async function handleRequest(context) {
    const { env, request } = context;
    
    // Parse JSON body to get mode
    let mode = 'ai';
    try {
        const body = await request.clone().json();
        if (body.mode) {
            mode = body.mode;
        }
    } catch(e) {
        // If not JSON or no body, defaults to 'ai'
    }

    // Mock data representing the output of the jupyter notebook
    const mockData = `
    Cumulative Return: +24.5%
    Sharpe Ratio: 1.8
    Top successful trades: Apple and Tesla based on unexpected earnings beats.
    Drawdown: -5.2%
    `;
    
    try {
        let textToRead = "";
        
        if (mode === 'raw') {
            textToRead = `Here are the raw results from the Jupyter Notebook: ${mockData}`;
        } else {
            const prompt = `You are a financial analyst giving a concise audio briefing. Summarize the following algorithmic trading results in under 200 words.
Cover these metrics only: Sharpe Ratio, Sortino Ratio, Confidence Score, Net Returns, Max Drawdown, and CAGR.
Then compare performance against SPY buy and hold annualized return.
Rules:
- Say "SP500" as "S P 500", and "SPY" as "S P Y"
- Say "SPY buy and hold annualized return" in full when comparing
- Keep all numbers as digits, do not spell them out as words (say "12.5 percent" not "twelve point five percent")
- Do not use emojis, asterisks, bullet points, or any formatting
- Speak naturally and conversationally

Results:
${mockData}`;

            // Call Gemini
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`;
            const geminiRes = await fetch(geminiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{text: prompt}]
                    }]
                })
            });
            
            if (!geminiRes.ok) {
                const err = await geminiRes.text();
                throw new Error("Gemini API error: " + err);
            }
            
            const geminiData = await geminiRes.json();
            textToRead = geminiData.candidates[0].content.parts[0].text;
        }

        // 2. Call ElevenLabs
        const voiceId = "bfGb7JTLUnZebZRiFYyq";
        const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        
        const elRes = await fetch(elevenLabsUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": env.ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: textToRead,
                model_id: "eleven_v3",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });
        
        if (!elRes.ok) {
            const err = await elRes.text();
            throw new Error("ElevenLabs API error: " + err);
        }
        
        const audioBuffer = await elRes.arrayBuffer();
        
        // Convert to base64 safely
        const bytes = new Uint8Array(audioBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);
        
        return new Response(JSON.stringify({
            text: textToRead,
            audioBase64: base64Audio
        }), {
            headers: {
                "Content-Type": "application/json"
            }
        });
        
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
