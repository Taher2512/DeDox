/*eslint-disable*/
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {Buffer} from 'buffer';
global.Buffer = global.Buffer || Buffer;
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Linking} from 'react-native';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {useNavigation} from '@react-navigation/native';

const NETWORK = clusterApiUrl('devnet');

const onConnectRedirectLink = 'myapp://onConnect';
const onDisconnectRedirectLink = 'myapp://onDisconnect';
const onSignAndSendTransactionRedirectLink = 'myapp://onSignAndSendTransaction';
const onSignAllTransactionsRedirectLink = 'myapp://onSignAllTransactions';
const onSignTransactionRedirectLink = 'myapp://onSignTransaction';
const onSignMessageRedirectLink = 'myapp://onSignMessage';

const buildUrl = (path, params) =>
  `https://phantom.app/ul/v1/${path}?${params.toString()}`;

const decryptPayload = (data, nonce, sharedSecret) => {
  if (!sharedSecret) throw new Error('missing shared secret');

  const decryptedData = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret,
  );
  if (!decryptedData) {
    throw new Error('Unable to decrypt data');
  }
  return JSON.parse(Buffer.from(decryptedData).toString('utf8'));
};

const encryptPayload = (payload, sharedSecret) => {
  if (!sharedSecret) throw new Error('missing shared secret');

  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret,
  );

  return [nonce, encryptedPayload];
};

const useContextProvider = createContext({
  connect: () => Promise,
  disconnect: () => Promise,
  signAndSendTransaction: transaction => Promise,
  signAllTransactions: transaction => Promise,
  signTransaction: transaction => Promise,
  signMessage: transaction => Promise,
  requestAirdrop: () => Promise,
  fetchWalletBalance: () => Promise,
  phantomWalletPublicKey: null,
  session: null,
  connection: undefined,
});

export const WalletContextProvider = ({children}) => {
  const [deepLink, setDeepLink] = useState('');
  const [logs, setLogs] = useState([]);
  const connection = new Connection(NETWORK, 'confirmed');
  const addLog = useCallback(log => setLogs(logs => [...logs, '> ' + log]), []);
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();

  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [sharedSecret, setSharedSecret] = useState();
  const [session, setSession] = useState();
  const [phantomWalletPublicKey, setPhantomWalletPublicKey] = useState();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleDeepLink = ({url}) => {
      setDeepLink(url);
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        setDeepLink(url);
      }
    });

    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  useEffect(() => {
    if (!deepLink) {
      return;
    }
    const handleDeepLink = ({url}) => {
      setDeepLink(url);
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        setDeepLink(url);
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    console.log('deepLink', deepLink);
    const url = new URL(
      deepLink.replace('myapp://', 'https://phantom.app/ul/v1/'),
    );
    const params = url.searchParams;
    console.log('params', params);
    if (params.get('errorCode')) {
      addLog(JSON.stringify(Object.fromEntries([...params]), null, 2));
      console.log('Error', params.get('errorCode'));
      return;
    }

    if (/onConnect/.test(url.pathname)) {
      console.log('onConnect', params.get('phantom_encryption_public_key'));
      const sharedSecretDapp = nacl.box.before(
        bs58.decode(params.get('phantom_encryption_public_key')),
        dappKeyPair.secretKey,
      );
      console.log('sharedSecretDapp', sharedSecretDapp);
      console.log('data', params.get('data'));
      const connectData = decryptPayload(
        params.get('data'),
        params.get('nonce'),
        sharedSecretDapp,
      );

      setSharedSecret(sharedSecretDapp);
      setSession(connectData.session);
      console.log('data', connectData);
      setPhantomWalletPublicKey(new PublicKey(connectData.public_key));
      console.log('public key', connectData.public_key);
      addLog(JSON.stringify(connectData, null, 2));
    } else if (/onDisconnect/.test(url.pathname)) {
      setPhantomWalletPublicKey(null);
      addLog('Disconnected!');
    } else if (/onSignAndSendTransaction/.test(url.pathname)) {
      console.log('onSignAndSendTransaction', params.get('data'));
      const signAndSendTransactionData = decryptPayload(
        params.get('data'),
        params.get('nonce'),
        sharedSecret,
      );

      addLog(JSON.stringify(signAndSendTransactionData, null, 2));
    } else if (/onSignAllTransactions/.test(url.pathname)) {
      const signAllTransactionsData = decryptPayload(
        params.get('data'),
        params.get('nonce'),
        sharedSecret,
      );

      const decodedTransactions = signAllTransactionsData.transactions.map(t =>
        Transaction.from(bs58.decode(t)),
      );

      addLog(JSON.stringify(decodedTransactions, null, 2));
    } else if (/onSignTransaction/.test(url.pathname)) {
      const signTransactionData = decryptPayload(
        params.get('data'),
        params.get('nonce'),
        sharedSecret,
      );

      const decodedTransaction = Transaction.from(
        bs58.decode(signTransactionData.transaction),
      );

      addLog(JSON.stringify(decodedTransaction, null, 2));
    } else if (/onSignMessage/.test(url.pathname)) {
      const signMessageData = decryptPayload(
        params.get('data'),
        params.get('nonce'),
        sharedSecret,
      );

      addLog(JSON.stringify(signMessageData, null, 2));
    }
    return () => {
      subscription.remove();
    };
  }, [deepLink]);

  const createTransferTransaction = async () => {
    if (!phantomWalletPublicKey)
      throw new Error('missing public key from user');
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: phantomWalletPublicKey,
        toPubkey: phantomWalletPublicKey,
        lamports: 100,
      }),
    );
    transaction.feePayer = phantomWalletPublicKey;
    addLog('Getting recent blockhash');
    const anyTransaction = transaction;
    anyTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    return transaction;
  };

  const connect = async () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: 'devnet',
      app_url: 'https://phantom.app',
      redirect_link: onConnectRedirectLink,
    });

    const url = buildUrl('connect', params);
    console.log('url', url);
    Linking.openURL(url);
  };

  const disconnect = async () => {
    const payload = {
      session,
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onDisconnectRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    const url = buildUrl('disconnect', params);
    Linking.openURL(url);

    setPhantomWalletPublicKey(null);
    setSession(null);
    setSharedSecret(null);
    addLog('Disconnected!');
    navigation.navigate('ConnectWallet');
  };

  const signAndSendTransaction = async transaction => {
    if (!phantomWalletPublicKey) return;
    setSubmitting(true);
    try {
      transaction.feePayer = phantomWalletPublicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
      });
      const payload = {
        session,
        transaction: bs58.encode(serializedTransaction),
      };
      const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: bs58.encode(nonce),
        redirect_link: onSignAndSendTransactionRedirectLink,
        payload: bs58.encode(encryptedPayload),
      });
      addLog('Sending transaction...');
      const url = buildUrl('signAndSendTransaction', params);

      return new Promise((resolve, reject) => {
        let subscription;

        const onReceiveURL = ({url: responseUrl}) => {
          if (responseUrl.includes(onSignAndSendTransactionRedirectLink)) {
            cleanup();
            const urlParams = new URLSearchParams(responseUrl.split('?')[1]);
            const signedTransaction = urlParams.get('data');
            if (signedTransaction) {
              resolve(signedTransaction);
            } else {
              reject(new Error('Failed to get signed transaction'));
            }
          }
        };

        const cleanup = () => {
          if (subscription) {
            subscription.remove();
          }
          setSubmitting(false);
        };

        subscription = Linking.addEventListener('url', onReceiveURL);
        Linking.openURL(url);

        const timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Transaction signing timed out'));
        }, 60000);

        return {
          then: (onfulfilled, onrejected) =>
            Promise.prototype.then.call(
              promise,
              result => {
                clearTimeout(timeoutId);
                cleanup();
                return onfulfilled(result);
              },
              error => {
                clearTimeout(timeoutId);
                cleanup();
                return onrejected(error);
              },
            ),
        };
      });
    } catch (error) {
      setSubmitting(false);
      throw error;
    }
  };
  const signAllTransactions = async () => {
    const transactions = await Promise.all([
      createTransferTransaction(),
      createTransferTransaction(),
    ]);

    const serializedTransactions = transactions.map(t =>
      bs58.encode(
        t.serialize({
          requireAllSignatures: false,
        }),
      ),
    );

    const payload = {
      session,
      transactions: serializedTransactions,
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAllTransactionsRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    addLog('Signing transactions...');
    const url = buildUrl('signAllTransactions', params);
    Linking.openURL(url);
  };

  const signTransaction = async () => {
    const transaction = await createTransferTransaction();

    const serializedTransaction = bs58.encode(
      transaction.serialize({
        requireAllSignatures: false,
      }),
    );

    const payload = {
      session,
      transaction: serializedTransaction,
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    addLog('Signing transaction...');
    const url = buildUrl('signTransaction', params);
    Linking.openURL(url);
  };

  const signMessage = async () => {
    const message =
      'To avoid digital dognappers, sign below to authenticate with CryptoCorgis.';

    const payload = {
      session,
      message: bs58.encode(Buffer.from(message)),
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignMessageRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    addLog('Signing message...');
    const url = buildUrl('signMessage', params);
    // console.log("url",url)
    Linking.openURL(url);
  };

  const requestAirdrop = async () => {
    if (!phantomWalletPublicKey) {
      addLog('Wallet not connected. Please connect first.');
      return;
    }

    try {
      addLog('Requesting airdrop of 1 SOL...');
      const signature = await connection.requestAirdrop(
        phantomWalletPublicKey,
        LAMPORTS_PER_SOL,
      );
      await connection.confirmTransaction(signature);
      addLog('Airdrop successful! 1 SOL added to your wallet.');
    } catch (error) {
      addLog(`Airdrop failed: ${error.message}`);
    }
  };

  const fetchWalletBalance = async () => {
    if (!phantomWalletPublicKey) {
      addLog('Wallet not connected. Please connect first.');
      return null;
    }

    try {
      addLog('Fetching wallet balance...');
      const balance = await connection.getBalance(phantomWalletPublicKey);
      addLog(`Balance fetched: ${balance / LAMPORTS_PER_SOL} SOL`);
      return balance;
    } catch (error) {
      addLog(`Failed to fetch balance: ${error.message}`);
      return null;
    }
  };

  const memo = useMemo(
    () => ({
      connect,
      disconnect,
      signAndSendTransaction,
      signAllTransactions,
      signTransaction,
      signMessage,
      requestAirdrop,
      fetchWalletBalance,
      phantomWalletPublicKey,
      session,
      connection,
    }),
    [phantomWalletPublicKey, session, sharedSecret],
  );

  return (
    <useContextProvider.Provider value={memo}>
      {children}
    </useContextProvider.Provider>
  );
};

export default function usePhantomConnection() {
  const context = useContext(useContextProvider);
  if (!context) {
    throw new Error('usePhantom must be used within a PhantomProvider');
  }
  return context;
}
