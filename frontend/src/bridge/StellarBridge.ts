import type { WalletState, Result } from '../types';
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
} from '@stellar/freighter-api';

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await isConnected();
    return res.isConnected;
  } catch {
    return false;
  }
}

export async function connectWallet(network: 'mainnet' | 'testnet'): Promise<Result<WalletState>> {
  try {
    const connectedRes = await isConnected();
    if (!connectedRes.isConnected) {
      return {
        ok: false,
        error: { code: 'WALLET_NOT_INSTALLED', message: 'Freighter cüzdanı bulunamadı.', retryable: false },
      };
    }

    // İzin iste (zaten izin varsa direkt address döner)
    const accessRes = await requestAccess();
    if (accessRes.error) {
      return {
        ok: false,
        error: { code: 'WALLET_CONNECTION_FAILED', message: accessRes.error.message || 'Erişim reddedildi.', retryable: true },
      };
    }

    const publicKey = accessRes.address;
    const balance = await fetchBalance(publicKey, network);

    return {
      ok: true,
      value: { connected: true, publicKey, balanceXLM: balance, network },
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bağlantı başarısız.';
    return {
      ok: false,
      error: { code: 'WALLET_CONNECTION_FAILED', message: msg, retryable: true },
    };
  }
}

export async function fetchBalance(publicKey: string, network: 'mainnet' | 'testnet'): Promise<string> {
  try {
    const horizonUrl =
      network === 'mainnet'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org';

    const res = await fetch(`${horizonUrl}/accounts/${publicKey}`);
    if (!res.ok) return '0';
    const data = await res.json();
    const xlm = data.balances?.find((b: { asset_type: string; balance: string }) => b.asset_type === 'native');
    return xlm ? parseFloat(xlm.balance).toFixed(2) : '0';
  } catch {
    return '0';
  }
}

export async function sendPayment(
  _fromPublicKey: string,
  _toPublicKey: string,
  _amountXLM: number,
  _network: 'mainnet' | 'testnet',
  attempt = 1
): Promise<Result<string>> {
  try {
    await new Promise((r) => setTimeout(r, 1500));
    const mockHash = `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { ok: true, value: mockHash };
  } catch {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return sendPayment(_fromPublicKey, _toPublicKey, _amountXLM, _network, attempt + 1);
    }
    return {
      ok: false,
      error: { code: 'STELLAR_TX_FAILED', message: 'İşlem başarısız oldu.', retryable: false },
    };
  }
}

export function getStellarExplorerUrl(hash: string, network: 'mainnet' | 'testnet'): string {
  const base = network === 'mainnet'
    ? 'https://stellar.expert/explorer/public'
    : 'https://stellar.expert/explorer/testnet';
  return `${base}/tx/${hash}`;
}

// Re-export for use in WalletBar
export { getAddress, isAllowed };
