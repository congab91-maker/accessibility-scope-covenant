import type { HexAddress } from "./types";

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
}

export interface WalletOption {
  id: string;
  name: string;
  icon?: string;
  rdns?: string;
  provider: Eip1193Provider;
}

interface AnnouncedProvider {
  info: { uuid: string; name: string; icon?: string; rdns?: string };
  provider: Eip1193Provider;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { providers?: Eip1193Provider[]; isMetaMask?: boolean };
  }

  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent<AnnouncedProvider>;
  }
}

const STUDIONET_CHAIN_ID = "0xf22f";

function providerName(provider: Eip1193Provider, index: number): string {
  const candidate = provider as Eip1193Provider & { isMetaMask?: boolean; isCoinbaseWallet?: boolean; isRabby?: boolean };
  if (candidate.isRabby) return "Rabby Wallet";
  if (candidate.isCoinbaseWallet) return "Coinbase Wallet";
  if (candidate.isMetaMask) return "MetaMask";
  return `Browser wallet ${index + 1}`;
}

export function dedupeWalletOptions(options: WalletOption[]): WalletOption[] {
  const providers = new Set<Eip1193Provider>();
  const reverseDomains = new Set<string>();
  const anonymousNames = new Set<string>();
  const identifiedNames = new Set(options.flatMap((option) => option.rdns?.trim() ? [option.name.trim().toLowerCase()] : []));
  return options.filter((option) => {
    const name = option.name.trim().toLowerCase();
    const reverseDomain = option.rdns?.trim().toLowerCase();
    if (providers.has(option.provider)) return false;
    if (reverseDomain) {
      if (reverseDomains.has(reverseDomain)) return false;
      reverseDomains.add(reverseDomain);
    } else {
      if (identifiedNames.has(name) || anonymousNames.has(name)) return false;
      anonymousNames.add(name);
    }
    providers.add(option.provider);
    return true;
  });
}

export async function discoverWallets(waitMs = 260): Promise<WalletOption[]> {
  const found: WalletOption[] = [];
  const announce = (event: WindowEventMap["eip6963:announceProvider"]) => {
    const { info, provider } = event.detail;
    found.push({ id: info.uuid, name: info.name, icon: info.icon, rdns: info.rdns, provider });
  };
  window.addEventListener("eip6963:announceProvider", announce);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((resolve) => window.setTimeout(resolve, waitMs));
  window.removeEventListener("eip6963:announceProvider", announce);

  const legacy = window.ethereum?.providers?.length ? window.ethereum.providers : window.ethereum ? [window.ethereum] : [];
  legacy.forEach((provider, index) => {
    found.push({ id: `legacy-${index}`, name: providerName(provider, index), provider });
  });
  return dedupeWalletOptions(found);
}

function isAddress(value: unknown): value is HexAddress {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
}

async function ensureStudionet(provider: Eip1193Provider): Promise<void> {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (typeof chainId === "string" && chainId.toLowerCase() === STUDIONET_CHAIN_ID) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: STUDIONET_CHAIN_ID }] });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    if (code !== 4902 && code !== -32603) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: STUDIONET_CHAIN_ID,
          chainName: "GenLayer Studio Network",
          nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
          rpcUrls: ["https://studio.genlayer.com/api"],
          blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
        },
      ],
    });
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: STUDIONET_CHAIN_ID }] });
  }
}

export async function connectWallet(option: WalletOption): Promise<HexAddress> {
  const accounts = await option.provider.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || !isAddress(accounts[0])) throw new Error("The selected provider returned no valid account");
  await ensureStudionet(option.provider);
  return accounts[0];
}
