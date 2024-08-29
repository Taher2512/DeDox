/*eslint-disable*/
import React,{useEffect, useState} from 'react'
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground';

import { Image, StatusBar,Text,TouchableOpacity,View } from 'react-native'
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import { CONNECTION, getUserPDA, imageURI } from '../components/constants';
import usePhantomConnection from '../hooks/WalletContextProvider';
import { hex } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Program } from '@project-serum/anchor';
import idl from "../../contracts/idl/idl.json"
import { PublicKey } from '@solana/web3.js';
export default function AddUser() {
    const {phantomWalletPublicKey,signAllTransactions,signAndSendTransaction}=usePhantomConnection()
    const [users, setusers] = useState()
    const [searchedUser, setSearchedUser] = useState('')
    const [text, settext] = useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [properaddress, setproperaddress] = useState('')
   const [loader, setloader] = useState(false)
    const customProvider = {
        publicKey: phantomWalletPublicKey,
        signTransaction: signAndSendTransaction,
        signAllTransactions: signAllTransactions,
        connection: CONNECTION,
      };
    const program=new Program(idl,"2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk",customProvider)
    useEffect(()=>{
        searchUploader()
    },[])
    const searchUploader=async()=>{
       try {
         const userPDA=await getUserPDA(phantomWalletPublicKey)
            const user=await program.account.userPhoto.fetch(userPDA)
            console.log(user)
            setusers([user])
       } catch (error) {
        console.log('Error searching:', error);
       }
    }
    
    const handleSearch = async () => {
        setloader(true)
        setErrorMessage('');
        setSearchedUser(null);
        
        if (!text) {
            setErrorMessage('Please enter a public key.');
            setloader(false)
            return;
        }

        try {
            
            const publicKey = new PublicKey(text);
            const searchPda = await getUserPDA(publicKey);
            const searchUser = await program.account.userPhoto.fetch(searchPda);
            setloader(false)
            setSearchedUser(searchUser);
            setproperaddress(searchUser)

        } catch (error) {
            setloader(false)
            console.log('Error searching:', error);
            if (error instanceof Error) {
                if (error.message.includes('Invalid public key input')) {
                    setErrorMessage('Invalid public key format.');
                } else if (error.message.includes('Account does not exist')) {
                    setErrorMessage('User not found.');
                } else {
                    setErrorMessage('An error occurred while searching.');
                }
            } else {
                setErrorMessage('An unexpected error occurred.');
            }
        }
    };
  const remove=(item)=>{
    const newUsers=users.filter((user)=>user.user.toString()!=item)
    setusers(newUsers)
  }
    const Children=()=>{
        return(
          <View style={{flex:1,paddingTop:StatusBar.currentHeight+25,padding:20}}>
            <Searchbar value={text} onChangeText={settext} onSubmitEditing={handleSearch}  placeholder='Enter the public key' barTintColor={'white'}  style={{width:"100%",height:60}} textColor={'white'} onSearchButtonPress={()=>{console.log('pressed')}}  />
            <View style={{width:"100%",height:110,alignItems:'center',justifyContent:"center"}}>
                {searchedUser&&<View style={{width:'100%',backgroundColor:'#1e1c1d',height:90,alignItems:"center",justifyContent:'space-between',borderRadius:15,flexDirection:'row',padding:10}}>
                 <Image source={{uri:searchedUser.imageHash.toString()}} style={{height:'100%',aspectRatio:1,borderRadius:15,resizeMode:'stretch'}}/>
                 <View style={{width:'50%',height:'100%',justifyContent:"center"}}>
                 <Text style={{color:'white',fontSize:14,fontWeight:'bold',textAlign:'center'}}>Address : {searchedUser.user.toString().slice(0,5)+"..."+searchedUser.user.toString().slice(searchedUser.user.toString().length-4,searchedUser.user.toString().length)}</Text>
                 </View>
                 <TouchableOpacity onPress={()=>{
                    if(properaddress){
                        users.push(properaddress)
                        setSearchedUser(null)
                    }
                    
                    setproperaddress('')
                    }}  style={{backgroundColor:'green',padding:7,borderRadius:10,alignItems:'center',justifyContent:'center'}}>
                      <Text style={{color:"white"}}>Add User</Text>
                 </TouchableOpacity>
                </View>}
                {errorMessage&&<Text style={{color:'red',fontSize:14,fontWeight:'bold'}}>{errorMessage}</Text>}
                {loader&&<ActivityIndicator size="small" color="white" />}
                <View style={{height:1,width:"100%",backgroundColor:'white',top:15}}/>
            </View>
             <View style={{flex:1,paddingTop:20,gap:20}}>
                 <Text style={{fontSize:22,fontWeight:'bold',color:'white'}}>Signers added</Text>
                 {users&&users.map((item,index)=>{
                     return(
                         <View key={index} style={{width:'100%',height:80,alignItems:'center',justifyContent:'space-between',flexDirection:'row',backgroundColor:'#1e1c1d',borderRadius:15,padding:10}}>
                             <Image source={{uri:item.imageHash}} style={{height:'100%',aspectRatio:1,borderRadius:15,resizeMode:'stretch'}}/>
                             <View style={{width:'50%',height:'100%',justifyContent:"center"}}>
                             <Text style={{color:'white',fontSize:14,fontWeight:'bold',textAlign:'center'}}>Address : {item.user.toString().slice(0,5)+"..."+item.user.toString().slice(item.toString().length-4,item.toString().length)}</Text>
                             </View>
                             {index!=0&&<TouchableOpacity style={{backgroundColor:'red',padding:7,borderRadius:10,alignItems:'center',justifyContent:'center'}}>
                                  <Text style={{color:"white"}} onPress={()=>{remove(item.user.toString())}}>Remove</Text>
                             </TouchableOpacity>}
                             {index==0&&<View/>}
                         </View>
                     )
                 })}
             </View>
             <TouchableOpacity onPress={()=>{console.log(users)}} style={{width:"100%",height:60,backgroundColor:'white',padding:10,borderRadius:15,alignSelf:'center',marginTop:20,justifyContent:"center"}}> 
                <Text style={{color:'black',textAlign:'center',fontSize:20}}>Next</Text>
             </TouchableOpacity>
          </View>
        )
    }
  return (
   <EnhancedDarkThemeBackground children={<Children/>}/>
  )
}
