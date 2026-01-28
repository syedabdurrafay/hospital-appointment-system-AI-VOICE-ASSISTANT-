// Test script to verify Grok API connection
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.GROK_KEY;

console.log('🔑 API Key found:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');

if (!apiKey) {
    console.error('❌ No API key found in environment variables');
    process.exit(1);
}

const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.x.ai/v1"
});

console.log('🧪 Testing Grok API connection...');

try {
    const completion = await client.chat.completions.create({
        model: 'grok-beta',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say hello in one sentence.' }
        ],
        max_tokens: 50
    });

    console.log('✅ API Connection successful!');
    console.log('📝 Response:', completion.choices[0].message.content);
} catch (error) {
    console.error('❌ API Connection failed:');
    console.error('Error:', error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    }
}
