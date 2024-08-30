/*eslint-disable*/
import React, {useEffect, useState} from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import idl from '../../contracts/idl/idl.json';
// import { Program, Provider, web3, BN } from '@project-serum/anchor';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  Keypair,
  SendTransactionError,
} from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  web3,
  getProvider,
  BN,
} from '@project-serum/anchor';
import {User} from '../models/User';
// import { useConnection } from './providers/ConnectionProvider';
// import {transact, Web3MobileWallet,} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js"
const programID = new PublicKey('Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC');
import * as borsh from 'borsh';
const opts = {
  preflightCommitment: 'processed',
};
import bs58 from 'bs58';

const CONNECTION = new Connection(
  'https://devnet.helius-rpc.com/?api-key=e9bbe608-da76-49e8-a3bc-48d03381b6b3',
  'confirmed',
);
import usePhantomConnection from '../hooks/WalletContextProvider';
export default function AddUser() {
  const [provider, setProvider] = useState();
  const [program, setProgram] = useState();
  const [wallet, setWallet] = useState();
  const [documents, setDocuments] = useState([]);
  const [imageHash, setImageHash] = useState('example_image_hash');
  const [signers, setSigners] = useState('');
  const {
    connection,
    session,
    phantomWalletPublicKey,
    signAndSendTransaction,
    disconnect,
    signAllTransactions,
  } = usePhantomConnection();
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        // const newWallet = {"_keypair": {"publicKey": [20, 170, 118, 29, 152, 240, 210, 12, 80, 33, 218, 19, 161, 133, 218, 62, 129, 239, 37, 189, 30, 230, 13, 163, 59, 241, 47, 168, 245, 158, 107, 5], "secretKey": [245, 191, 163, 182, 53, 96, 30, 18, 39, 154, 189, 243, 237, 228, 153, 213, 32, 169, 117, 14, 158, 54, 106, 184, 201, 22, 200, 70, 110, 213, 62, 22, 20, 170, 118, 29, 152, 240, 210, 12, 80, 33, 218, 19, 161, 133, 218, 62, 129, 239, 37, 189, 30, 230, 13, 163, 59, 241, 47, 168, 245, 158, 107, 5]}};
        const newWallet = Keypair.generate();
        //   await AsyncStorage.setItem('wallet', JSON.stringify(Array.from(newWallet.secretKey)));
        setWallet(newWallet);
        console.log('pubkey', newWallet.publicKey);
      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
    };

    initializeWallet();
  }, []);
  useEffect(() => {});
  const addUser = async () => {
    if (!phantomWalletPublicKey) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    try {
      console.log('Using public key:', phantomWalletPublicKey.toString());
      const pubKey = new PublicKey(phantomWalletPublicKey);
      // Check balance
      const balance = await CONNECTION.getBalance(pubKey);
      console.log('Account balance:', balance);
      if (balance < 5000) {
        Alert.alert(
          'Error',
          'Insufficient funds. Please add some SOL to your wallet.',
        );
        return;
      }

      // Derive PDA for user_photo
      const [userPhotoPDA, bump] = await PublicKey.findProgramAddress(
        [Buffer.from('user_photo'), pubKey.toBuffer()],
        programID,
      );
      console.log('User photo PDA:', userPhotoPDA.toString());
      const transaction = new Transaction();
      const customProvider = {
        publicKey: pubKey,
        signTransaction: signAndSendTransaction,
        signAllTransactions: signAllTransactions,
        connection: CONNECTION,
      };
      const program = new Program(
        idl,
        'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC',
        customProvider,
      );
      const tx = await program.methods
        .addUserPhoto(imageHash)
        .accounts({
          user: pubKey,
          userPhoto: userPhotoPDA,
        })
        .instruction();
      transaction.add(tx);
      transaction.feePayer = pubKey;
      const {blockhash, lastValidBlockHeight} =
        await CONNECTION.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;

      console.log('Transaction before sending to Phantom:', transaction);
      // const data=await program.account.userPhoto.fetch(userPhotoPDA)
      //  console.log("data",data)
      try {
        const signedTransaction = await signAndSendTransaction(transaction);
        console.log('Signed transaction:', signedTransaction);
        Alert.alert('Success', 'User photo added successfully');
      } catch (signError) {
        console.error('Error signing or sending transaction:', signError);
        Alert.alert(
          'Error',
          'Failed to sign or send transaction: ' + signError.message,
        );
      }
    } catch (error) {
      console.error('Error preparing transaction:', error);
      Alert.alert('Error', 'Failed to prepare transaction: ' + error.message);
    }
  };
  const sendDocument = async (docId, imageHash, signerArray) => {
    if (!phantomWalletPublicKey) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    try {
      const pubKey = new PublicKey(phantomWalletPublicKey);
      const documentId = 1;
      console.log('Using public key:', pubKey.toString());
      const [documentPDA, bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from('document'),
          pubKey.toBuffer(),
          new BN(documentId).toArrayLike(Buffer, 'le', 8),
        ],
        programID,
      );
      console.log('Document PDA:', documentPDA.toString());
      const transaction = new Transaction();
      const customProvider = {
        publicKey: pubKey,
        signTransaction: signAndSendTransaction,
        signAllTransactions: signAllTransactions,
        connection: CONNECTION,
      };
      console.log('reached here', pubKey);
      const program = new Program(
        idl,
        'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC',
        customProvider,
      );
      const tx = await program.methods
        .addDocument(new BN(documentId), imageHash, new BN(Date.now()), [
          new PublicKey('AKmJpjSdYH2uhewVJWE7CucxGPzUTBw3ycL1qAbxxTDg'),
          pubKey,
        ])
        .accounts({
          document: documentPDA,
          user: pubKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      transaction.add(tx);
      transaction.feePayer = pubKey;
      const {blockhash, lastValidBlockHeight} =
        await CONNECTION.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      try {
        const signedTransaction = await signAndSendTransaction(transaction);
        console.log('Signed transaction:', signedTransaction);
        Alert.alert('Success', 'Document added successfully');
      } catch (signError) {
        console.error('Error signing or sending transaction:', signError);
        Alert.alert(
          'Error',
          'Failed to sign or send transaction: ' + signError.message,
        );
      }
    } catch (error) {
      console.error('Error preparing transaction:', error);
      Alert.alert('Error', 'Failed to prepare transaction: ' + error.message);
    }
  };
  const signDocument = async () => {
    if (!phantomWalletPublicKey) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }
    try {
      const pubKey = new PublicKey(phantomWalletPublicKey);
      const documentId = 1;
      console.log('Using public key:', pubKey.toString());
      const [documentPDA, bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from('signeddocument'),
          pubKey.toBuffer(),
          new BN(documentId).toArrayLike(Buffer, 'le', 8),
        ],
        programID,
      );
      console.log('signed document PDA:', documentPDA.toString());
      const transaction = new Transaction();
      const customProvider = {
        publicKey: pubKey,
        signTransaction: signAndSendTransaction,
        signAllTransactions: signAllTransactions,
        connection: CONNECTION,
      };
      console.log('reached here', pubKey);

      const program = new Program(
        idl,
        'Ch57PUCAvh6SCZ3DNroq7gXH9a1svdkykVabscVxdsEC',
        customProvider,
      );

      const tx = await program.methods
        .addSignedDocument(new BN(documentId), pubKey)
        .accounts({
          signedDocument: documentPDA,
          user: pubKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
      transaction.add(tx);
      transaction.feePayer = pubKey;

      const {blockhash, lastValidBlockHeight} =
        await CONNECTION.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;

      try {
        const signedTransaction = await signAndSendTransaction(transaction);
        console.log('Signed transaction:', signedTransaction);
        Alert.alert('Success', 'Document signed successfully');
      } catch (signError) {
        console.error('Error signing or sending transaction:', signError);
        Alert.alert(
          'Error',
          'Failed to sign or send transaction: ' + signError.message,
        );
      }
    } catch (error) {
      console.error('Error preparing transaction:', error);
      Alert.alert('Error', 'Failed to prepare transaction: ' + error.message);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={signDocument}
        style={{
          width: 200,
          height: 60,
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 15,
        }}>
        <Text style={{color: 'black', textAlign: 'center', fontSize: 20}}>
          Upload DOcs
        </Text>
      </TouchableOpacity>
    </View>
  );
}
