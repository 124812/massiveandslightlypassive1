document.addEventListener('DOMContentLoaded', () => {
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

    // Spinner Animation for Retro Vibe
    const spinnerFrames = ['[ | ]', '[ / ]', '[ - ]', '[ \\ ]'];
    let spinnerIndex = 0;
    let spinnerInterval;

    visualizer.classList.add('paused');

    async function handleGenerate(mode) {
        // Reset UI state
        buttonGroup.classList.add('hidden');
        errorState.classList.add('hidden');
        resultState.classList.add('hidden');
        loadingState.classList.remove('hidden');

        // Start spinner
        spinnerInterval = setInterval(() => {
            spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
            retroSpinner.textContent = spinnerFrames[spinnerIndex];
        }, 150);

        try {
            // Call the Cloudflare Function API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mode: mode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate report');
            }

            // Display text
            transcriptText.textContent = data.text;

            // Handle Audio
            const binaryString = atob(data.audioBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            
            audioPlayer.src = audioUrl;

            // Stop spinner & Show result state
            clearInterval(spinnerInterval);
            loadingState.classList.add('hidden');
            resultState.classList.remove('hidden');

            // Autoplay the audio
            audioPlayer.play().catch(e => {
                console.log("Autoplay blocked by browser. User needs to manually click play.", e);
            });

        } catch (error) {
            console.error('Error:', error);
            clearInterval(spinnerInterval);
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');
            errorText.textContent = 'ERROR: ' + error.message;
            buttonGroup.classList.remove('hidden');
        }
    }

    generateBtn.addEventListener('click', () => handleGenerate('ai'));
    rawBtn.addEventListener('click', () => handleGenerate('raw'));

    // Handle Visualizer Animations based on Audio state
    audioPlayer.addEventListener('play', () => {
        visualizer.classList.remove('paused');
    });

    audioPlayer.addEventListener('pause', () => {
        visualizer.classList.add('paused');
    });

    audioPlayer.addEventListener('ended', () => {
        visualizer.classList.add('paused');
        // Show buttons again
        setTimeout(() => {
            buttonGroup.classList.remove('hidden');
        }, 1000);
    });
});
