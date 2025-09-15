#!/usr/bin/env node

/**
 * Simple test script for Gemini API connection
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

// Read API key from .env file
function getApiKey() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    return match ? match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

async function testGeminiConnection() {
  log('\n🚀 Testing Gemini API Connection', BLUE);
  log('=====================================', BLUE);
  
  // Get API key
  const apiKey = getApiKey();
  if (!apiKey) {
    log('❌ GEMINI_API_KEY not found in .env file', RED);
    process.exit(1);
  }
  
  log('✅ GEMINI_API_KEY found', GREEN);
  log(`📝 API Key (first 10 chars): ${apiKey.substring(0, 10)}...`, YELLOW);
  
  try {
    // Test with gemini-2.0-flash-exp model (supports native image generation)
    log('\n=== Testing gemini-2.0-flash-exp model ===', BLUE);
    const response = await fetch('https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Respond with "OK" if you can hear me'
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
      
      if (data.candidates && data.candidates[0]) {
        const text = data.candidates[0].content?.parts?.[0]?.text;
        if (text) {
          log(`📝 Gemini response: ${text}`, YELLOW);
        }
      }
      
      // Now test if this model supports image generation
      log('\n=== Testing Native Image Generation Capability ===', BLUE);
      log('⚠️  Note: This feature may require special API access', YELLOW);
      
      const imageTestResponse = await fetch('https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Generate an image of a red circle on white background'
            }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            maxOutputTokens: 8192,
            temperature: 0.4
          }
        })
      });
      
      if (imageTestResponse.ok) {
        const imageData = await imageTestResponse.json();
        if (imageData.candidates?.[0]?.content?.parts?.find(p => p.inlineData)) {
          log('🎉 Native image generation is AVAILABLE!', GREEN);
          log('✅ The model can generate images directly', GREEN);
        } else {
          log('⚠️  Model responded but did not generate an image', YELLOW);
          log('   This feature might not be enabled for your API key', YELLOW);
        }
      } else {
        const errorText = await imageTestResponse.text();
        log('⚠️  Image generation test failed', YELLOW);
        if (errorText.includes('not supported')) {
          log('   Native image generation is not yet available for this API key', YELLOW);
        } else {
          log(`   Error: ${errorText.substring(0, 200)}...`, RED);
        }
      }
      
    } else {
      const error = await response.text();
      log(`❌ Failed to connect to Gemini API: ${response.status}`, RED);
      log(`Error: ${error.substring(0, 300)}...`, RED);
      
      if (response.status === 403 || response.status === 401) {
        log('\n💡 Possible issues:', YELLOW);
        log('  1. API key might be invalid', YELLOW);
        log('  2. API key might not have proper permissions', YELLOW);
        log('  3. Gemini API might not be enabled in your Google Cloud project', YELLOW);
      } else if (response.status === 404) {
        log('\n💡 The v1alpha API endpoint might not be available', YELLOW);
        log('  Try using v1beta instead', YELLOW);
      }
    }
    
  } catch (error) {
    log(`❌ Connection error: ${error.message}`, RED);
    log('\n💡 Make sure you have internet connection', YELLOW);
  }
  
  log('\n=====================================', BLUE);
  log('Test complete!', BLUE);
  log('\nNext steps:', YELLOW);
  log('1. If image generation is not available, the app will fallback to text-only responses', YELLOW);
  log('2. You can still use the virtual staging features with placeholder images', YELLOW);
  log('3. Monitor Google AI updates for when native image generation becomes widely available', YELLOW);
}

// Run the test
testGeminiConnection().catch((error) => {
  log(`\n❌ Unexpected error: ${error}`, RED);
  process.exit(1);
});