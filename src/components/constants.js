/*eslint-disable*/
import { Connection, PublicKey } from "@solana/web3.js";
import ConnectButton from "./ConnectButton";
import usePhantomConnection from "../hooks/WalletContextProvider";
import DocumentDetail from "../screens/DocumentDetail";
import { BN } from "@project-serum/anchor";

const CONNECTION = new Connection('https://devnet.helius-rpc.com/?api-key=71ac2476-6792-470c-8bf1-85fc9e701bc3', 'confirmed');
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
const imageURI="https://aquamarine-rare-gopher-724.mypinata.cloud/ipfs/"
export { CONNECTION,programId,getUserPDA,getDocSignedPDA,imageURI };
