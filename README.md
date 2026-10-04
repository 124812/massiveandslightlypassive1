# Gator Quant Hacks 2026 · Trade the 8-K

Starter notebook for the Massive challenge. You need **Python 3.10+** ([python.org](https://www.python.org/downloads/))
and a **Massive API key** (from the Discord channel).

## Setup (about 2 minutes)

**macOS / Linux** — in a terminal, from this folder:

```bash
./setup.sh
```

**Windows** — in PowerShell, from this folder:

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

The script creates a `.venv`, installs `requirements.txt`, registers the Jupyter kernel
**Python (Gator Quant Hacks .venv)**, and creates `.env` from `.env.example`. It is safe to re-run.

Then:

1. Open `.env` and replace `your-key-here` with your key (no spaces or quotes).
2. Start Jupyter: `source .venv/bin/activate && jupyter lab` (Windows: `.venv\Scripts\activate; jupyter lab`),
   or open the notebook in VS Code.
3. Pick the kernel **Python (Gator Quant Hacks .venv)** and run all cells. Section 1 prints
   `API key loaded (ends xxxx)` when it finds your key. The first full run takes about 10 minutes;
   API responses are cached in `.massive_cache/`, so later runs take seconds.

## Accessibility & Audio Briefing App

This project includes a retro-styled web app powered by **Google Gemini** and **ElevenLabs** for text-to-speech accessibility briefings of your trading results.

### How to Run:
1. **Start Jupyter Lab first**: Make sure Jupyter is running locally on port 8888 (`.venv\Scripts\activate; jupyter lab` or `source .venv/bin/activate && jupyter lab`) and that `strategy_v2.ipynb` has been executed. The web app fetches execution outputs directly from the Jupyter REST API.
2. **Verify API keys in `.env`**: Ensure your `.env` file in the root directory contains your keys:
   ```env
   MASSIVE_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ELEVENLABS_API_KEY=your_key_here
   ```
3. **Launch the Accessibility Web Server**:
   - **Windows**: Run `accessibility_app\run.bat` (or double-click it in File Explorer).
   - **macOS / Linux**: Run `python3 -m http.server 8000` from the root folder and open `http://localhost:8000/accessibility_app/frontend/` in your browser.
4. **Generate Briefing**: Click **Generate Audio Briefing** in the web interface to hear Gemini summarize your strategy's performance metrics and compare it with real-time SPY benchmark data using ElevenLabs audio synthesis.


## Manual setup

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
python -m ipykernel install --user --name gator-quant-hacks --display-name "Python (Gator Quant Hacks .venv)"
cp .env.example .env               # then add your key
```

Already have a Jupyter environment (Colab, an existing kernel)? Skip all of this and run the
optional `%pip install -r requirements.txt` cell at the top of the notebook, then restart the kernel.

## Troubleshooting

- **"Kernel not found" when opening the notebook** — run the setup script, or just pick any Python 3.10+ kernel.
- **`ModuleNotFoundError`** — the notebook is on a different kernel than the one you installed into.
  Run `import sys; print(sys.executable)` in a cell; it should end in `.venv/bin/python`.
- **Prompted for an API key** — `.env` is missing, in the wrong folder, or still has the placeholder.
- **Slow iteration** — set `RUN_PLACEBO = False` in section 2 while exploring (saves ~8 minutes per
  run); turn it back on before you submit.
- **Stale recent data** — the cache never expires. Delete `.massive_cache/` to refetch.

Keep `.env` out of anything you share or submit; `.gitignore` already excludes it.
