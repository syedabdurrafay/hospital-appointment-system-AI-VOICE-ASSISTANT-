// Test script to verify Groq API connection
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROK_KEY || process.env.GROQ_API_KEY;

console.log('🔑 API Key found:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');

if (!apiKey) {
    console.error('❌ No API key found in environment variables');
    process.exit(1);
}

const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.groq.com/openai/v1"
});

console.log('🧪 Testing Groq API connection...');

try {
    const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: 'You are a helpful hospital receptionist.' },
            { role: 'user', content: 'Say hello in one sentence.' }
        ],
        max_tokens: 50
    });

    console.log('✅ API Connection successful!');
    console.log('📝 Response:', completion.choices[0].message.content);
    console.log('\n✨ Your voice assistant is ready to use!');
} catch (error) {
    console.error('❌ API Connection failed:');
    console.error('Error:', error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
}
