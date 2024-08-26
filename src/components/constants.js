/*eslint-disable*/
import { Connection, PublicKey } from "@solana/web3.js";
import ConnectButton from "./ConnectButton";
import usePhantomConnection from "../hooks/WalletContextProvider";
import DocumentDetail from "../screens/DocumentDetail";
import { BN } from "@project-serum/anchor";

const CONNECTION = new Connection('https://devnet.helius-rpc.com/?api-key=e9bbe608-da76-49e8-a3bc-48d03381b6b3', 'confirmed');
const programId="2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk"

const getUserPDA=async(pubKey)=>{
    const [userPDA,bump]=await PublicKey.findProgramAddress([Buffer.from("user_photo"),new PublicKey(pubKey).toBuffer()],new PublicKey(programId))
    return userPDA
}
const getDocSignedPDA=async(pubKey,docId)=>{
    const [documentPDA, bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("signeddocument"),
          pubKey.toBuffer(),
          new BN(docId).toArrayLike(Buffer, 'le', 8)
        ],
        new PublicKey(programId)
      );    
      return documentPDA
}
export { CONNECTION,programId,getUserPDA,getDocSignedPDA };
