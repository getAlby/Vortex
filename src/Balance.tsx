import "cross-fetch/polyfill";
import { useEffect, useState } from "react";
import { ActionPanel, Detail, Action, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { fiat } from "@getalby/lightning-tools";
import { connectWallet } from "./wallet";

export default function ShowBalance() {
  const [balance, setBalance] = useState<string | null>(null);
  const [fiatBalance, setFiatBalance] = useState<string | null>(null);

  const updateBalance = async () => {
    const preferences = getPreferenceValues<{ currency: string }>();
    const fiatCurrency = preferences.currency;

    try {
      const nwc = await connectWallet(); // Connect and get the wallet instance
      const balanceInfo = await nwc.getBalance(); // Fetch the balance from the connected wallet
      const fiatBalance = await fiat.getFormattedFiatValue({
        satoshi: balanceInfo.balance,
        currency: fiatCurrency,
        locale: "en",
      });
      setBalance(`${new Intl.NumberFormat().format(balanceInfo.balance)} sats`);
      setFiatBalance(fiatBalance);
    } catch (error) {
      if (error instanceof Error) {
        showToast(Toast.Style.Failure, "Failed to fetch wallet balance", error.message);
      }
      console.error("Failed to fetch wallet balance:", error);
    }
  };

  useEffect(() => {
    updateBalance(); // Fetch balance when component mounts
  }, []); // Run only once on component mount

  return (
    <Detail
      markdown={`# Wallet Balance\nYour balance is: ${balance} (${fiatBalance})`}
      actions={
        <ActionPanel>
          <Action title="Refresh" onAction={updateBalance} />
        </ActionPanel>
      }
    />
  );
}
