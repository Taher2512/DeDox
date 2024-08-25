/*eslint-disable*/
import React from 'react'
import { TouchableOpacity,Alert, Text } from 'react-native'
import idl from "../../contracts/idl/idl.json"
import { Connection, PublicKey, SystemProgram, Transaction,  } from "@solana/web3.js";
import { Program, BN } from "@project-serum/anchor";
const programID = new PublicKey('2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk');
const CONNECTION = new Connection('https://devnet.helius-rpc.com/?api-key=e9bbe608-da76-49e8-a3bc-48d03381b6b3', 'confirmed');
import usePhantomConnection from '../hooks/WalletContextProvider';
export default function AddDocumentButton({imageHash,docPDA,docId,signers,style,textStyle}) {
    const {
        phantomWalletPublicKey,
        signAndSendTransaction,
        signAllTransactions,
      } = usePhantomConnection();
    const sendDocument=async()=>{
        if (!phantomWalletPublicKey) {
          Alert.alert('Error', 'Wallet not connected');
          return;
        }
        try {
          // ... (previous code remains the same)
          const pubKey = new PublicKey(phantomWalletPublicKey);
          console.log("Using public key:", pubKey.toString());
          const signerArray=signers.map((signer)=>new PublicKey(signer))
          const [documentPDA, bump] = await PublicKey.findProgramAddress(
            [
              Buffer.from("document"),
              pubKey.toBuffer(),
              new BN(docId).toArrayLike(Buffer, 'le', 8)
            ],
            programID
          );
          console.log("Document PDA:", documentPDA.toString());
          const transaction = new Transaction()
          const customProvider={
            publicKey:pubKey,
            signTransaction:signAndSendTransaction,
            signAllTransactions:signAllTransactions,
            connection:CONNECTION
          }
          console.log("reached here",pubKey)
          const program = new Program(idl, "2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk", customProvider)
          const tx = await program.methods.addDocument(
            new BN(docId),
            imageHash,
            new BN(Date.now()),
            signerArray // Pass the array of PublicKey objects
          ).accounts({
            document: documentPDA,
            user: pubKey,
            systemProgram: SystemProgram.programId,
          }).instruction()
          transaction.add(tx)
          transaction.feePayer = pubKey;
          const { blockhash, lastValidBlockHeight } = await CONNECTION.getLatestBlockhash('confirmed');
          transaction.recentBlockhash = blockhash;
          try {
            const signedTransaction = await signAndSendTransaction(transaction);
            console.log("Signed transaction:", signedTransaction);
            return documentPDA
          } catch (signError) {
            console.error('Error signing or sending transaction:', signError);
            Alert.alert('Error', 'Failed to sign or send transaction: ' + signError.message);
          }
          // ... (rest of the function remains the same)
        } catch (error) {
          console.error('Error preparing transaction:', error);
          Alert.alert('Error', 'Failed to prepare transaction: ' + error.message);
        }
      }
  return (
    <TouchableOpacity onPress={sendDocument} style={style}>
     <Text style={textStyle}>Upload Document</Text>
    </TouchableOpacity>
  )
}
