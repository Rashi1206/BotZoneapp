const express = require('express');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const userQuery = req.body.queryResult?.queryText || 'No question provided';
    const websiteURL = 'https://botzone.co';

    // Fetch website content
    const websiteRes = await axios.get(websiteURL);
    const websiteText = websiteRes.data.replace(/<[^>]*>?/gm, '').slice(0, 8000);

    const prompt = `Company: Botzone\nWebsite Content:\n${websiteText}\n\nUser Question: ${userQuery}`;

    const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
    const client = await auth.getClient();
    const projectId = 'mywebsitebot-dkju';

    const vertexEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-pro:predict`;

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

    const answer = geminiResponse.data.predictions?.[0]?.content || "I couldn't generate a response.";

    res.json({ fulfillmentText: answer });

  } catch (error) {
    console.error('Error:', error.message);
    res.json({ fulfillmentText: "Sorry, I'm having trouble responding right now." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zoni webhook running on port ${PORT}`));
