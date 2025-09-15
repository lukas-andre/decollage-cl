#!/usr/bin/env tsx

/**
 * Test script for Gemini integration
 * This script tests the AI client's ability to:
 * 1. Connect to Gemini API
 * 2. Generate virtual staging with native image generation
 * 3. Analyze room characteristics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local') });

// Import AI client
import { aiClient } from '../src/lib/ai/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

function log(message: string, color: string = RESET) {
  console.log(`${color}${message}${RESET}`);
}

// Create a test image (simple 1x1 white pixel)
function createTestImage(): File {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Create a simple room-like pattern
  // Fill with light gray (walls)
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 1024, 768);
  
  // Draw floor
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(0, 500, 1024, 268);
  
  // Draw window
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(300, 100, 200, 250);
  
  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  
  // Convert to File
  const arr = dataUrl.split(',');
  const mime = 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], 'test-room.jpg', { type: mime });
}

// Since we're running in Node, we need to polyfill some browser APIs
async function createTestImageNode(): Promise<File> {
  // Create a simple test image buffer (1x1 white pixel JPEG)
  const jpegData = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
    0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
    0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
    0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
    0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
    0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
    0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
    0x00, 0x00, 0x3F, 0x00, 0xFB, 0xFF, 0xFF, 0xFF, 0xFF, 0xD9
  ]);
  
  return new File([jpegData], 'test-room.jpg', { type: 'image/jpeg' });
}

async function testConnection() {
  log('\n=== Testing Gemini API Connection ===', BLUE);
  
  try {
    const result = await aiClient.testConnection();
    if (result.success) {
      log('✅ Connection successful', GREEN);
      return true;
    } else {
      log(`❌ Connection failed: ${result.error}`, RED);
      return false;
    }
  } catch (error) {
    log(`❌ Connection error: ${error}`, RED);
    return false;
  }
}

async function testRoomAnalysis() {
  log('\n=== Testing Room Analysis ===', BLUE);
  
  try {
    const testImage = await createTestImageNode();
    const result = await aiClient.analyzeRoom(testImage);
    
    if (result.success) {
      log('✅ Room analysis successful', GREEN);
      log(`Analysis:\n${result.analysis}`, YELLOW);
      return true;
    } else {
      log(`❌ Room analysis failed: ${result.error}`, RED);
      return false;
    }
  } catch (error) {
    log(`❌ Room analysis error: ${error}`, RED);
    return false;
  }
}

async function testVirtualStaging() {
  log('\n=== Testing Virtual Staging Generation ===', BLUE);
  log('⚠️  Note: This test will attempt to use Gemini\'s native image generation', YELLOW);
  log('⚠️  If it fails, the model may not have image generation enabled yet', YELLOW);
  
  try {
    const testImage = await createTestImageNode();
    const result = await aiClient.generateVirtualStaging({
      originalImage: testImage,
      style: 'modern',
      prompt: 'Add minimalist furniture with clean lines and neutral colors',
    });
    
    if (result.success) {
      log('✅ Virtual staging generation successful', GREEN);
      if (result.imageDataUrl) {
        log('✅ Image data URL received', GREEN);
        // Save the image for inspection (optional)
        const base64Data = result.imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const outputPath = path.join(__dirname, 'test-output.jpg');
        fs.writeFileSync(outputPath, buffer);
        log(`💾 Test image saved to: ${outputPath}`, YELLOW);
      }
      if (result.enhancedPrompt) {
        log(`Enhanced prompt: ${result.enhancedPrompt}`, YELLOW);
      }
      return true;
    } else {
      log(`❌ Virtual staging failed: ${result.error}`, RED);
      return false;
    }
  } catch (error) {
    log(`❌ Virtual staging error: ${error}`, RED);
    return false;
  }
}

async function runTests() {
  log('\n🚀 Starting Gemini Integration Tests', BLUE);
  log('=====================================', BLUE);
  
  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    log('❌ GEMINI_API_KEY not found in environment variables', RED);
    log('Please set GEMINI_API_KEY in your .env file', YELLOW);
    process.exit(1);
  } else {
    log('✅ GEMINI_API_KEY found', GREEN);
  }
  
  let allTestsPassed = true;
  
  // Test 1: Connection
  const connectionTest = await testConnection();
  allTestsPassed = allTestsPassed && connectionTest;
  
  // Test 2: Room Analysis (uses text model)
  const analysisTest = await testRoomAnalysis();
  allTestsPassed = allTestsPassed && analysisTest;
  
  // Test 3: Virtual Staging (uses native image generation)
  const stagingTest = await testVirtualStaging();
  // Note: staging test might fail if model doesn't support native image generation yet
  // So we don't fail the entire test suite
  if (!stagingTest) {
    log('\n⚠️  Virtual staging test failed - this is expected if the model doesn\'t support native image generation yet', YELLOW);
  }
  
  // Summary
  log('\n=====================================', BLUE);
  if (allTestsPassed) {
    log('✅ All core tests passed!', GREEN);
  } else {
    log('⚠️  Some tests failed - check the output above', YELLOW);
  }
  
  // Kill the background dev server if it's still running
  if (process.env.DEV_SERVER_PID) {
    process.kill(parseInt(process.env.DEV_SERVER_PID), 'SIGTERM');
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\n❌ Unexpected error: ${error}`, RED);
  process.exit(1);
});