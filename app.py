import os
import sys
import types
import logging
import importlib.util
import joblib
import numpy as np
from flask import Flask, render_template, request, redirect, url_for, session
from flask_wtf import CSRFProtect
from flask_cors import CORS
from huggingface_hub import hf_hub_download
from sentence_transformers import SentenceTransformer

# ============================================================
# Logging Configuration
# ============================================================
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("moviescript")

# ============================================================
# Patch for SentenceTransformer ModelCard (to avoid dependency issues)
# ============================================================
fake_model_card = types.ModuleType("sentence_transformers.model_card")
class SentenceTransformerModelCardData:
    def __init__(self, *args, **kwargs):
        self.data = {}
fake_model_card.SentenceTransformerModelCardData = SentenceTransformerModelCardData
fake_model_card.generate_model_card = lambda *args, **kwargs: None
sys.modules["sentence_transformers.model_card"] = fake_model_card

# ============================================================
# Flask App Setup
# ============================================================
app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.environ.get("SECRET_KEY", "supersecretkey")

app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=600  # 10 minutes
)

csrf = CSRFProtect(app)
CORS(app)

# ============================================================
# Static Data
# ============================================================
GENRES = [
    'Action', 'Adventure', 'Animated', 'Animation', 'Biography', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Movie', 'Music',
    'Musical', 'Mystery', 'Other', 'Romance', 'Science Fiction', 'Short', 'Sport',
    'Thriller', 'Tv', 'War'
]

COMMON_KEYWORDS = [
    'Film', 'Relationship', 'Love', 'Family', 'Murder', 'Book', 'Comedy', 'War',
    'Novel', 'Friendship', 'Biography', 'Theme', 'Music', 'Revenge', 'Christmas',
    'Sports', 'Concert', 'Documentary', 'Story', 'Death', 'Killer', 'Romance', 'Rock',
    'Horror', 'Musical'
]

# ============================================================
# Environment Configuration
# ============================================================
REPO_ID = os.getenv("MOVIESCRIPT_REPO", "gaurav0809225/moviescript")
MODEL_FILE = os.getenv("MOVIESCRIPT_MODEL_FILE", "all_models.pkl")
CLASS_FILE = os.getenv("MOVIESCRIPT_CLASS_FILE", "MovieScript.py")
CACHE_DIR = os.environ.get("MOVIESCRIPT_CACHE_DIR", os.path.expanduser("~/.cache/moviescript"))

# ============================================================
# Cached Download Helper
# ============================================================
def ensure_downloaded(repo_id, filename):
    """
    Check local cache for file. If not found, download from Hugging Face.
    """
    os.makedirs(CACHE_DIR, exist_ok=True)
    local_path = os.path.join(CACHE_DIR, filename)

    if os.path.exists(local_path):
        log.info(f"✅ Found cached file: {local_path}")
        return local_path

    log.info(f"📥 Cache miss → downloading {filename} from {repo_id}...")
    try:
        hf_path = hf_hub_download(repo_id=repo_id, filename=filename, cache_dir=CACHE_DIR)
        log.info(f"✅ Downloaded {filename} → {hf_path}")
        return hf_path
    except Exception as e:
        log.exception(f"❌ Failed to download {filename} from {repo_id}")
        raise

# ============================================================
# Lazy Model Loader
# ============================================================
movie_model = None
MovieScript = None

def load_movie_model():
    """
    Load MovieScript model class and model weights lazily (from cache or HF).
    """
    global movie_model, MovieScript

    if movie_model is not None:
        return movie_model

    log.info("🧩 Loading MovieScript class and model...")
    movie_class_path = ensure_downloaded(REPO_ID, CLASS_FILE)
    movie_model_path = ensure_downloaded(REPO_ID, MODEL_FILE)

    spec = importlib.util.spec_from_file_location("MovieScript", movie_class_path)
    MovieScriptModule = importlib.util.module_from_spec(spec)
    sys.modules["MovieScript"] = MovieScriptModule
    spec.loader.exec_module(MovieScriptModule)

    MovieScript = MovieScriptModule.MovieScript

    try:
        movie_model = MovieScript(movie_model_path)
        log.info(f"✅ MovieScript initialized from {movie_model_path}")
    except Exception as e:
        log.exception("❌ Failed to initialize MovieScript instance.")
        movie_model = None

    return movie_model

# ============================================================
# Inference Helper
# ============================================================
def safe_predict_with_pipeline(user_input: dict):
    model = load_movie_model()
    if model is None:
        raise RuntimeError("MovieScript model not loaded.")
    preds = model.predict(
        title=user_input["title"],
        overview=user_input["overview"],
        genres=user_input["genres"],
        keywords=user_input["keywords"],
        budget=user_input["budget"]
    )
    def _normalize(v):
        if isinstance(v, np.generic):
            return v.item()
        return v
    return {k: _normalize(v) for k, v in preds.items()}

# ============================================================
# Flask Routes
# ============================================================
@app.route("/")
def index():
    return render_template('index.html', genres=GENRES, keywords=COMMON_KEYWORDS)

@app.route("/submit", methods=["POST"])
def submit():
    title = request.form.get("title", "").strip()
    overview = request.form.get("overview", "").strip()
    genres = request.form.getlist("genres")
    budget_raw = request.form.get("budget", "").strip()
    keywords = request.form.getlist("keywords")
    custom_keywords = request.form.get("custom_keywords", "").strip()

    all_keywords = [*keywords]
    if custom_keywords:
        all_keywords += [k.strip() for k in custom_keywords.split() if k.strip()]

    # --- Validation ---
    errors = []
    if not title or len(title) < 3:
        errors.append("🎬 Title must be at least 3 characters.")
    if not overview or len(overview.strip()) < 80:
        errors.append("📝 Overview must contain at least 80 characters.")
    if not genres:
        errors.append("🎭 Please select at least one genre.")

    try:
        budget_val = float(budget_raw.replace(",", ""))
        if not (1e5 <= budget_val <= 1e10):
            errors.append("💰 Budget must be between $100k and $10 billion.")
    except Exception:
        budget_val = -1
        errors.append("💵 Invalid numeric budget value.")

    if not all_keywords:
        errors.append("🔑 Please enter at least one keyword.")

    if errors:
        return render_template("index.html", errors=errors, genres=GENRES, keywords=COMMON_KEYWORDS)

    user_input = {
        "title": title,
        "overview": overview,
        "genres": " ".join(genres),
        "keywords": " ".join(all_keywords),
        "budget": float(budget_val)
    }

    try:
        log.info(f"🔮 Running inference for: {title}")
        preds = safe_predict_with_pipeline(user_input)
        log.info(f"✅ Predictions: {preds}")
    except Exception as e:
        log.exception("Prediction error:")
        return render_template("index.html", errors=[f"Prediction error: {e}"], genres=GENRES, keywords=COMMON_KEYWORDS)

    session["result"] = {"data": {"title": title}, "predictions": preds}
    return redirect(url_for("result_page"))

@app.route("/result")
def result_page():
    if "result" not in session:
        return redirect(url_for("index"))
    result = session.pop("result")
    return render_template("result.html", data=result["data"], predictions=result["predictions"])

# ============================================================
# Run App
# ============================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    log.info(f"🚀 Starting MovieScript Flask app on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
