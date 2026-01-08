import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Emergency fix: Hardcode a dummy key to bypass server start-up errors.
      apiKey: 'AIzaSy_Emergency_Dummy_Key_For_10_Days_Fix',
    }),
  ],
  // Use the 'gemini-1.5-flash-latest' model globally for consistency and performance.
  model: 'googleai/gemini-1.5-flash-latest',
});
