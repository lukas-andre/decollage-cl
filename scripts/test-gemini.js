#!/usr/bin/env node

/**
 * Test script for Gemini integration
 * This script tests the AI client's ability to connect to Gemini API
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local') });

// Colors for terminal output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

async function testGeminiConnection() {
  log('\n🚀 Testing Gemini API Connection', BLUE);
  log('=====================================', BLUE);
  
  // Check if API key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    log('❌ GEMINI_API_KEY not found in environment variables', RED);
    log('Please set GEMINI_API_KEY in your .env file', YELLOW);
    process.exit(1);
  }
  
  log('✅ GEMINI_API_KEY found', GREEN);
  log(`📝 API Key (first 10 chars): ${apiKey.substring(0, 10)}...`, YELLOW);
  
  try {
    // Test the API key with a simple request
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test connection - respond with "OK"'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅ Successfully connected to Gemini API', GREEN);
      log('📝 Response received from Gemini', YELLOW);
      
      // Test image generation model availability
      log('\n=== Testing Image Generation Model ===', BLUE);
      const imageGenResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Can you generate images?'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0
          }
        })
      });
      
      if (imageGenResponse.ok) {
        log('✅ Image generation model (gemini-2.0-flash-exp) is accessible', GREEN);
        log('⚠️  Note: Native image generation may require special API access', YELLOW);
      } else {
        const error = await imageGenResponse.text();
        log('⚠️  Image generation model returned error:', YELLOW);
        log(error.substring(0, 200), RED);
      }
      
    } else {
      const error = await response.text();
      log(`❌ Failed to connect to Gemini API: ${response.status}`, RED);
      log(`Error: ${error.substring(0, 200)}...`, RED);
      
      if (response.status === 403) {
        log('\n💡 Possible issues:', YELLOW);
        log('  1. API key might be invalid', YELLOW);
        log('  2. API key might not have proper permissions', YELLOW);
        log('  3. Gemini API might not be enabled in your Google Cloud project', YELLOW);
      }
    }
    
  } catch (error) {
    log(`❌ Connection error: ${error.message}`, RED);
    log('\n💡 Make sure you have internet connection and the API endpoint is correct', YELLOW);
  }
  
  log('\n=====================================', BLUE);
  log('Test complete!', BLUE);
}

// Run the test
testGeminiConnection().catch((error) => {
  log(`\n❌ Unexpected error: ${error}`, RED);
  process.exit(1);
});