from flask import Flask, request, jsonify
from vertexai.preview.generative_models import GenerativeModel
import vertexai

app = Flask(__name__)
vertexai.init(project="YOUR_PROJECT_ID", location="us-central1")

model = GenerativeModel("gemini-pro")

@app.route("/", methods=["POST"])
def webhook():
    req = request.get_json()

    # Extract prompt from Dialogflow CX parameters
    user_prompt = req.get("sessionInfo", {}).get("parameters", {}).get("user_prompt", "Write something")

    # Generate content using Gemini
    response = model.generate_content(user_prompt)

    # Return response to Dialogflow CX
    return jsonify({
        "fulfillment_response": {
            "messages": [
                {"text": {"text": [response.text]}}
            ]
        }
    })
