/**
 * Runs once to set CORS on the Firebase Storage bucket so browser uploads work.
 * Usage: node scripts/set-cors.mjs path/to/serviceAccountKey.json
 */
import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'fs';

const BUCKET = 'moverapp-706eb.firebasestorage.app';

const CORS_CONFIG = [
  {
    origin: ['*'],                // allow all origins (GitHub Pages + local dev)
    method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
    responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
    maxAgeSeconds: 3600,
  },
];

const keyFile = process.argv[2];
if (!keyFile) {
  console.error('Usage: node scripts/set-cors.mjs path/to/serviceAccountKey.json');
  process.exit(1);
}

const storage = new Storage({ keyFilename: keyFile });

try {
  await storage.bucket(BUCKET).setCorsConfiguration(CORS_CONFIG);
  console.log(`\n✅ CORS set on gs://${BUCKET}\n`);
  console.log('Browser uploads from any origin are now allowed.');
} catch (err) {
  console.error('❌ Error:', err.message);
  if (err.code === 404) {
    console.error('\nBucket not found — make sure you have enabled Firebase Storage');
    console.error('in the Firebase console (Build → Storage → Get started)');
  }
}
