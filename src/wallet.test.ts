import { describe, expect, it } from "vitest";

import { dedupeWalletOptions, type Eip1193Provider } from "./wallet";

const provider = (): Eip1193Provider => ({ request: async () => [] });

describe("wallet discovery normalization", () => {
  it("removes repeated EIP-6963 announcements by rdns and display name", () => {
    const first = provider();
    const options = dedupeWalletOptions([
      { id: "one", name: "Backpack", rdns: "app.backpack", provider: first },
      { id: "two", name: "Backpack", rdns: "app.backpack", provider: provider() },
      { id: "three", name: "backpack", rdns: "other.backpack", provider: provider() },
    ]);
    expect(options).toEqual([{ id: "one", name: "Backpack", rdns: "app.backpack", provider: first }]);
  });

  it("keeps distinct wallets while dropping a legacy alias of an announced wallet", () => {
    const options = dedupeWalletOptions([
      { id: "okx", name: "OKX Wallet", rdns: "com.okex.wallet", provider: provider() },
      { id: "metamask", name: "MetaMask", rdns: "io.metamask", provider: provider() },
      { id: "legacy", name: "MetaMask", provider: provider() },
      { id: "phantom", name: "Phantom", rdns: "app.phantom", provider: provider() },
    ]);
    expect(options.map(({ name }) => name)).toEqual(["OKX Wallet", "MetaMask", "Phantom"]);
  });
});
