'use client';

import { WagmiConfig, createConfig, http } from 'wagmi';
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  arbitrumSepolia,
} from 'wagmi/chains';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'Zelion Chain',
  projectId: 'c9c4efc298258660bd60dc1519ed2e51', // ✅ Make sure this is valid
  chains: [mainnet, polygon, arbitrum, optimism, arbitrumSepolia], // ✅ Add this
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [arbitrumSepolia.id]: http(), // ✅ Add transport
  },
  ssr: true,
});

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider
          chains={config.chains}
          theme={darkTheme({
            accentColor: '#00f0ff',
            accentColorForeground: 'black',
            borderRadius: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
