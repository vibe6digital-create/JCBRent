// Local development entry point — Firebase Functions uses src/functions.ts
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import app from './app';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\nHeavyRent API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health\n`);
});
