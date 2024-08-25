import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Connection, PublicKey} from '@solana/web3.js';
import {Program, AnchorProvider, web3} from '@project-serum/anchor';
import {Button} from 'react-native-paper';
import idl from '../../contracts/idl/idl.json';
import {useWallet} from '@solana/wallet-adapter-react';

const programID = new PublicKey('9wjuwLCf2RB6bLFGcA9gtfu2PwaVytx1TyQR6bKYwxM8');
const opts = {
  preflightCommitment: 'processed',
};

export default function AddUser({imageHash}) {
  const {connected, publicKey, signTransaction, signAllTransactions} =
    useWallet();
  const [program, setProgram] = useState();

  useEffect(() => {
    const connection = new Connection(
      'https://api.devnet.solana.com',
      opts.preflightCommitment,
    );
    const provider = new AnchorProvider(
      connection,
      {publicKey, signTransaction, signAllTransactions},
      opts,
    );
    const program = new Program(idl, programID, provider);
    setProgram(program);
  }, [connected, publicKey, signTransaction, signAllTransactions]);

  const addUserPhoto = async () => {
    if (!connected || !publicKey) {
      console.log('Please connect your wallet first');
      return;
    }

    try {
      const [userPhotoPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_photo'), publicKey.toBuffer()],
        program.programId,
      );

      const tx = await program.methods
        .addUserPhoto(imageHash, publicKey)
        .accounts({
          userPhoto: userPhotoPDA,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Transaction signature', tx);
    } catch (error) {
      console.error('Error adding user photo:', error);
    }
  };

  return (
    <View>
      <Button
        onPress={addUserPhoto}
        mode="contained"
        style={{backgroundColor: 'white'}}
        labelStyle={{color: 'black'}}
        contentStyle={{width: 200, height: 60, borderRadius: 15}}>
        Add User Photo
      </Button>
    </View>
  );
}
