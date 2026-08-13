import { describe, expect, it } from "vitest";

import { dedupeWalletOptions, type Eip1193Provider } from "./wallet";

const provider = (): Eip1193Provider => ({ request: async () => [] });

describe("wallet discovery normalization", () => {
  it("deduplicates the same provider object", () => {
    const first = provider();
    const options = dedupeWalletOptions([
      { id: "one", name: "Backpack", rdns: "app.backpack", provider: first },
      { id: "two", name: "Backpack mirror", rdns: "mirror.backpack", provider: first },
    ]);
    expect(options).toEqual([{ id: "one", name: "Backpack", rdns: "app.backpack", provider: first }]);
  });

  it("deduplicates repeated announcements with the same rdns", () => {
    const options = dedupeWalletOptions([
      { id: "one", name: "Backpack", rdns: "app.backpack", provider: provider() },
      { id: "two", name: "Backpack", rdns: "APP.BACKPACK", provider: provider() },
    ]);
    expect(options).toHaveLength(1);
  });

  it("drops a legacy alias of an announced wallet", () => {
    const options = dedupeWalletOptions([
      { id: "okx", name: "OKX Wallet", rdns: "com.okex.wallet", provider: provider() },
      { id: "metamask", name: "MetaMask", rdns: "io.metamask", provider: provider() },
      { id: "legacy", name: "MetaMask", provider: provider() },
      { id: "phantom", name: "Phantom", rdns: "app.phantom", provider: provider() },
    ]);
    expect(options.map(({ name }) => name)).toEqual(["OKX Wallet", "MetaMask", "Phantom"]);
  });

  it("preserves distinct rdns identities even when display names match", () => {
    const options = dedupeWalletOptions([
      { id: "one", name: "Backpack", rdns: "app.backpack", provider: provider() },
      { id: "two", name: "Backpack", rdns: "other.backpack", provider: provider() },
    ]);
    expect(options.map(({ rdns }) => rdns)).toEqual(["app.backpack", "other.backpack"]);
  });
});
