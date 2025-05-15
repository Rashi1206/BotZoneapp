from flask import Flask, request, jsonify
from vertexai.preview.generative_models import GenerativeModel
import vertexai

app = Flask(__name__)
vertexai.init(project="mywebsitedkju", location="us-central1")
model = GenerativeModel("gemini-pro")

@app.route("/", methods=["POST"])
def webhook():
    req = request.get_json()
    user_prompt = req.get("sessionInfo", {}).get("parameters", {}).get("user_prompt", "Write something")
    response = model.generate_content(user_prompt)
    return jsonify({
        "fulfillment_response": {
            "messages": [{"text": {"text": [response.text]}}]
        }
    })
