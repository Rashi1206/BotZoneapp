const express = require('express');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const app = express();
app.use(express.json());

const projectId = 'mywebsitebot-dkju'; // 🔁 Set your actual project ID
const model = 'gemini-pro';
const region = 'us-central1';
const vertexEndpoint = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:predict`;

app.post('/webhook', async (req, res) => {
  try {
    const userQuery = req.body.queryResult?.queryText || 'No question provided';
    const websiteURL = 'https://botzone.co'; // 🔁 Your company website

    // 1. Scrape your website content (basic HTML strip)
    const response = await axios.get(websiteURL);
    const textOnly = response.data.replace(/<[^>]+>/g, '').slice(0, 8000); // limit to 8K chars

    // 2. Prompt formatting
    const prompt = `Use the following website content to answer the user question naturally:\n\nWebsite:\n${textOnly}\n\nQuestion:\n${userQuery}`;

    // 3. Auth and Request to Gemini via Vertex AI
    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const client = await auth.getClient();

    const geminiResponse = await client.request({
      url: vertexEndpoint,
      method: 'POST',
      data: {
        instances: [{ prompt }],
        parameters: {
          temperature: 0.7,
          maxOutputTokens: 512
        }
      }
    });

    const answer = geminiResponse.data?.predictions?.[0]?.content || "I couldn't generate a response.";
    res.json({ fulfillmentText: answer });

  } catch (err) {
    console.error('Webhook error:', err.message);
    res.json({ fulfillmentText: "Sorry, Zoni is having trouble answering right now." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Zoni webhook running on port ${PORT}`));
