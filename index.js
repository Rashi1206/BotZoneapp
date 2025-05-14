const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

app.post('/webhook', async (req, res) => {
  const query = req.body.queryResult.queryText || 'Hello from Gemini!';
  try {
    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();
    res.json({
      fulfillmentText: text,
    });
  } catch (err) {
    console.error('Error with Gemini API:', err);
    res.json({
      fulfillmentText: 'Sorry, something went wrong!',
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
