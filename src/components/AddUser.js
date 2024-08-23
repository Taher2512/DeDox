/*eslint-disable*/
import React,{useEffect,useState} from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import idl from "../../contracts/idl/idl.json"
// import { Program, Provider, web3, BN } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction,sendAndConfirmTransaction } from "@solana/web3.js";
import { User } from '../models/User';
// import { useConnection } from './providers/ConnectionProvider';
// import {transact, Web3MobileWallet,} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js"
const programID = new PublicKey('2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk');
const opts = {
  preflightCommitment: 'processed'
};

const CONNECTION = new Connection('https://api.devnet.solana.com', 'confirmed');
import { Program } from "@coral-xyz/anchor";
import usePhantomConnection from '../hooks/WalletContextProvider';
export default function AddUser() {
    const [provider, setProvider] = useState();
  const [program, setProgram] = useState();
  const [wallet, setWallet] = useState();
  const [documents, setDocuments] = useState([]);
  const [imageHash, setImageHash] = useState('');
  const [signers, setSigners] = useState('');
  const {
    connection,
    session,
    phantomWalletPublicKey,
    signAndSendTransaction,
    disconnect,
    signAllTransactions,
  } = usePhantomConnection();
//{"_keypair": {"publicKey": [20, 170, 118, 29, 152, 240, 210, 12, 80, 33, 218, 19, 161, 133, 218, 62, 129, 239, 37, 189, 30, 230, 13, 163, 59, 241, 47, 168, 245, 158, 107, 5], "secretKey": [245, 191, 163, 182, 53, 96, 30, 18, 39, 154, 189, 243, 237, 228, 153, 213, 32, 169, 117, 14, 158, 54, 106, 184, 201, 22, 200, 70, 110, 213, 62, 22, 20, 170, 118, 29, 152, 240, 210, 12, 80, 33, 218, 19, 161, 133, 218, 62, 129, 239, 37, 189, 30, 230, 13, 163, 59, 241, 47, 168, 245, 158, 107, 5]}}
    useEffect(() => {
        const initializeWallet = async () => {
          try {
            // const newWallet = {"_keypair": {"publicKey": [20, 170, 118, 29, 152, 240, 210, 12, 80, 33, 218, 19, 161, 133, 218, 62, 129, 239, 37, 189, 30, 230, 13, 163, 59, 241, 47, 168, 245, 158, 107, 5], "secretKey": [245, 191, 163, 182, 53, 96, 30, 18, 39, 154, 189, 243, 237, 228, 153, 213, 32, 169, 117, 14, 158, 54, 106, 184, 201, 22, 200, 70, 110, 213, 62, 22, 20, 170, 118, 29, 152, 240, 210, 12, 80, 33, 218, 19, 161, 133, 218, 62, 129, 239, 37, 189, 30, 230, 13, 163, 59, 241, 47, 168, 245, 158, 107, 5]}};
            const newWallet=Keypair.generate()
            //   await AsyncStorage.setItem('wallet', JSON.stringify(Array.from(newWallet.secretKey)));
              setWallet(newWallet);
              console.log("pubkey",newWallet.publicKey)
            
          } catch (error) {
            console.error('Error initializing wallet:', error);
          }
        };
    
        initializeWallet();
      }, []);
    //   useEffect(() => {
    //     if (wallet) {
    //       const connection = new Connection('https://api.devnet.solana.com', opts.preflightCommitment);
    //       const provider = new Provider(connection,wallet,opts)
    //       setProvider(provider);
    
    //       const program = new Program(idl, programID, provider);
    //       setProgram(program);
    //     }
    //   }, [wallet]);
    const sendDocument = async () => {
        if (!wallet) {
          Alert.alert('Error', 'Wallet not initialized');
          return;
        }
        try {
            console.log(phantomWalletPublicKey)
         const user=new User("image_hash",new PublicKey(phantomWalletPublicKey))
         const instructionDataBuffer=user.serialize()
         const transaction = new Transaction();
         const pubkey=new PublicKey(phantomWalletPublicKey)
        const [pda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("user"), pubkey.toBuffer()],
      new PublicKey(programID)
    );
    const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: pubkey,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: pda,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: instructionDataBuffer,
        programId: new PublicKey(programID),
      });
      const program = new Program(idl, programID);
Program
    const tx = await program.methods.createUser("mustafa", pubkey).accounts({
      owner: pubkey,
      user: pda,
    }).instruction();

    transaction.add(tx);
   const txreciept=await signAndSendTransaction(transaction)
   console.log(txreciept)
        //   const id = Date.now();
        //   const date = Math.floor(Date.now() / 1000);
        //   const signersPubkeys = [new PublicKey("CpJkQcutYGKX7KXY1U8prybVyM6DTYmvv1MbC2kmLhyW").toBuffer()]
    
        //   const documentKeypair = Keypair.generate();
        // //   const instruction = new TransactionInstruction({
        // //     keys: [
        // //       { pubkey: documentKeypair.publicKey, isSigner: true, isWritable: true },
        // //       { pubkey: pubkey, isSigner: true, isWritable: true },
        // //       { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        // //     ],
        // //     programId: programID,
        // //     data: Buffer.from([
        // //       0, // Instruction index for send_document
        // //       ...new Uint8Array(new BigUint64Array([BigInt(id)]).buffer),
        // //       ...Buffer.from(imageHash),
        // //       ...pubkey.toBuffer(),
        // //       ...Buffer.from(new Uint8Array(signersPubkeys)),
        // //       ...new Uint8Array(new BigInt64Array([BigInt(date)]).buffer),
        // //     ]),
        // //   });
        //   console.log(instruction)
        // //   const transaction = new Transaction().add(instruction);
        //   const signature = await CONNECTION.sendTransaction(transaction, [wallet, documentKeypair]);
    
        //   await CONNECTION.confirmTransaction(signature);
    
        // //   Alert.alert('Success', 'Document sent successfully');
        // console.log('Success', 'Document sent successfully');
        //   getAllDocuments();
        } catch (error) {
          console.error('Error sending document:', error);
        //   Alert.alert('Error', 'Failed to send document');
        }
      };
  return (
    <View>
        <TouchableOpacity onPress={sendDocument} style={{width:200,height:60,backgroundColor:'white',padding:10,borderRadius:15}}>
          <Text style={{color:'black',textAlign:'center',fontSize:20}}>Upload DOcs</Text>
        </TouchableOpacity>
    </View>
  )
}
