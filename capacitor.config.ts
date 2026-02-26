import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gmiller.numbermunchers',
  appName: 'Number Munchers',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#1a1a2e',
    preferredContentMode: 'desktop',
  },
};

export default config;
