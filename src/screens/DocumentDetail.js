/*eslint-disable*/
import React, { useEffect, useState } from 'react'
import { ImageBackground, StatusBar, TouchableOpacity, View,Text, Image, Modal, ScrollView,Dimensions, ToastAndroid } from 'react-native'
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground'
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import Clipboard from '@react-native-clipboard/clipboard'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import usePhantomConnection from '../hooks/WalletContextProvider'
import { CONNECTION, getDocSignedPDA, getUserPDA, programId } from '../components/constants'
import { BN, Program } from '@project-serum/anchor'
import idl from "../../contracts/idl/idl.json"
import { set } from '@project-serum/anchor/dist/cjs/utils/features'
export default function DocumentDetail({docPDA}) {
    const {phantomWalletPublicKey,signAllTransactions,signAndSendTransaction}=usePhantomConnection()
    
    const pubKey=new PublicKey(phantomWalletPublicKey)
    const customProvider={
        publicKey:pubKey,
        signTransaction:signAndSendTransaction,
        signAllTransactions:signAllTransactions,
        connection:CONNECTION
      }
      const program=new Program(idl,programId,customProvider)
    const [docId, setdocId] = useState(null)
    const [signers, setsigners] = useState([])
    const [uploader, setuploader] = useState(null)
    const [imageUrl, setimageUrl] = useState(null)
    useEffect(()=>{
        // Fetch the document details from the blockchain
        fetchDocumentDetails()
         
    })
    const fetchDocumentDetails=async()=>{
        const data=await program.account.document.fetch(docPDA)
        setimageUrl(data.imageHash.toString())
        const uploader=data.uploader.toString()
        const docId=data.docId.toNumber()
        const docSigners=data.signers.map((signer)=>signer.toString())
        setdocId(docId)
        const uploaderPDA=await getUserPDA(new PublicKey(uploader))
        const uploaderData=await program.account.user.fetch(uploaderPDA)
        setuploader(uploaderData)
        const signerArray=[]
        for(let i=0;i<docSigners.length;i++){
            const signerPDA=await getUserPDA(new PublicKey(docSigners[i]))
            const signerData=await program.account.user.fetch(signerPDA)
            console.log("Signer data fetched:",signerData)
            const signedDocPDA=await getDocSignedPDA(new PublicKey(docSigners[i]),docId)
            const signedDocData=await program.account.signedDocument.fetch(signedDocPDA)
            let signed=false
            if(signedDocData){
               signed=true
            }
            signerData={
                signed,
                user:docSigners[i],
                imageUrl:signerData.imageHash.toString()
            }
            signerArray.push(signerData)
        }
        setsigners(signerArray)

    }
    const signDocument=async()=>{
        if (!phantomWalletPublicKey) {
            Alert.alert('Error', 'Wallet not connected');
            return;
          }
          try {
            // ... (previous code remains the same)
            const pubKey = new PublicKey(phantomWalletPublicKey);
            const documentId = docId;
            console.log("Using public key:", pubKey.toString());
            const [documentPDA, bump] = await PublicKey.findProgramAddress(
              [
                Buffer.from("signeddocument"),
                pubKey.toBuffer(),
                new BN(documentId).toArrayLike(Buffer, 'le', 8)
              ],
              new PublicKey(programId)
            );
            // console.log("signed document PDA:", documentPDA.toString());
            
            const transaction = new Transaction()
            const customProvider={
              publicKey:pubKey,
              signTransaction:signAndSendTransaction,
              signAllTransactions:signAllTransactions,
              connection:CONNECTION
            }
            
            console.log("reached here",pubKey)
            const program = new Program(idl, "2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk", customProvider)
            const tx = await program.methods.addSignedDocument(
              new BN(documentId),
              pubKey 
            ).accounts({
              signedDocument:documentPDA,
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
              Alert.alert("Success", "Document signed successfully");
            } catch (signError) {
              console.error('Error signing or sending transaction:', signError);
              Alert.alert('Error', 'Failed to sign or send transaction: ' + signError.message);
            }
          } catch (error) {
            console.error('Error preparing transaction:', error);
            Alert.alert('Error', 'Failed to prepare transaction: ' + error.message);
          }
    }
    const Children=()=>{
        const ImageComponent=Animated.createAnimatedComponent(Image)
        const [visible, setvisible] = useState(false)
        const address="2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk"
        const x=useSharedValue(0)
        const y=useSharedValue(0)
        const width=Dimensions.get('screen').width
        const v1=useSharedValue(0)
         const v2=useSharedValue(1)
         const translateX = useSharedValue(0);
        const signDocument=async()=>{
          console.log("Document signed")
        }
         const gestureHandler=useAnimatedGestureHandler(({
            onStart: (_, context) => {
                context.startX = translateX.value;
              },
              onActive: (event, context) => {
                if(context.startX+event.translationX>=0 && context.startX+event.translationX<(300-65)){
                translateX.value = context.startX + event.translationX;
                }
              },
              onEnd: () => {
               
                if(translateX.value>300-68){
                     runOnJS(signDocument)()
                }
                else{
                    translateX.value = withSpring(0);
                }
              },
        }))
        
      const animationstyle=useAnimatedStyle(()=>{
        return{
          transform:[{rotate:`${v1.value}deg`}],
          width:x.value>width/2?withTiming(25,{duration:500}):withTiming(0,{duration:500}),
          height:x.value>width/2?withTiming(25,{duration:500}):withTiming(0,{duration:500}),  
        }
      })
      const animationstyle2=useAnimatedStyle(()=>{
        return{
            transform:[{rotate:`${v1.value}deg`}],  
          width:x.value>width/2?withTiming(0,{duration:500}):withTiming(28,{duration:500}),
          height:x.value>width/2?withTiming(0,{duration:500}):withTiming(28,{duration:500}),
    
        }
      })
      const animatedStyle3=useAnimatedStyle(()=>{
           return{
            opacity:v2.value
           }
      })
        return(
            <ScrollView style={{paddingTop:StatusBar.currentHeight+20,padding:20,flex:1}}>
           {imageUrl&& <Modal visible={visible} transparent style={{paddingTop:StatusBar.currentHeight+20}}>
              <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.3)',alignItems:"center",justifyContent:"center",padding:20}}>
                <View style={{width:"100%",alignItems:'flex-end',justifyContent:'flex-end'}}>
                <TouchableOpacity onPress={()=>{setvisible(false)}}>
                    <Image tintColor={'white'} style={{height:30,width:30}} source={require('../assets/backgrounds/cross.png')}/>
                </TouchableOpacity>
                </View>
                   <Image style={{width:'100%',height:"90%",resizeMode:'stretch'}} source={{uri:imageUrl}}/>
              </View>
            </Modal>}
                {imageUrl&&<View style={{width:"100%",alignItems:"center",justifyContent:"center"}}>
                <TouchableOpacity onPress={()=>{setvisible(true)}} style={{position:'absolute',zIndex:2,borderWidth:1,borderColor:'white',width:200,height:50,borderRadius:20,flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingVertical:15}}>
                <Image source={require('../assets/backgrounds/eye.png')} tintColor={'white'} style={{height:40,width:40}}/>
                  <Text style={{color:"white",fontSize:16,fontWeight:'bold'}}>View Document</Text>
                </TouchableOpacity>
                    <ImageBackground source={{uri:imageUrl}} resizeMode='cover' style={{height:350,width:250,borderRadius:25,overflow:'hidden',opacity:0.4}}>
                      
                    </ImageBackground>
                </View>}
                <View style={{flex:1,width:"100%",gap:10,marginTop:20}}>
                   <Text style={{color:"white",fontSize:22,fontWeight:"bold"}}>Uploader</Text>
                   {uploader&&<View style={{flexDirection:'row',alignItems:"center",justifyContent:'space-around'}}>
                   <Image style={{height:80,width:80,borderRadius:15}} source={{uri:uploader.imageHash}}/>
                   <View style={{flex:1,height:90,padding:15,justifyContent:'center',flexDirection:'row',gap:10}}>
                   <Text style={{color:'white',fontSize:16}}>Address: {uploader.user.substring(0,4)}....{uploader.user.substring(address.length-4,address.length)}</Text>
                   <TouchableOpacity onPress={()=>{
                    Clipboard.setString(address)
                    ToastAndroid.show("Address copied to clipboard",ToastAndroid.SHORT)
                    }}>
                    <Image style={{height:20,width:20,tintColor:'white'}} source={require('../assets/backgrounds/copy.png')}/>
                   </TouchableOpacity>
                   </View>
                   </View>}
                   <Text style={{color:"white",fontSize:22,fontWeight:"bold"}}>Signers</Text>
                    {signers&&signers.map((item,index)=>{
                        return(
                            <View key={index} style={{flexDirection:'row',alignItems:"center",justifyContent:'space-around'}}>
                   <Image style={{height:80,width:80,borderRadius:15}} source={{uri:item.imageUrl}}/>
                   <View style={{flex:1,height:90,padding:10,justifyContent:'space-around'}}>
                   <View style={{height:45,flexDirection:'row',gap:10,width:'100%',alignItems:'center'}}>
                   <Text style={{color:'white',fontSize:16}}>Address: {item.user.substring(0,4)}....{item.user.substring(item.user.length-4,item.user.length)}</Text>
                   <TouchableOpacity onPress={()=>{
                    Clipboard.setString(item.user)
                    ToastAndroid.show("Address copied to clipboard",ToastAndroid.SHORT)
                    }}>
                    <Image style={{height:20,width:20,tintColor:'white'}} source={require('../assets/backgrounds/copy.png')}/>
                   </TouchableOpacity>
                   </View>
                   {item.signed?<View style={{backgroundColor:'rgba(0,3,0,0.3)', borderColor:'green',borderWidth:2,width:100,alignItems:'center',justifyContent:'center',borderRadius:10,paddingVertical:4}}>
                     <Text style={{color:'green',fontSize:15,fontWeight:'bold'}}>Signed</Text>
                   </View>:
                   <View style={{backgroundColor:'rgba(0,3,0,0.3)', borderColor:'red',borderWidth:2,width:150,alignItems:'center',justifyContent:'center',borderRadius:10,paddingVertical:4}}>
                     <Text style={{color:'red',fontSize:15,fontWeight:'bold'}}>Not Signed</Text>
                   </View>
                   }

                   </View>
                   </View>
                        )
                    })}
                     <View style={{width:'100%',padding:15,borderWidth:1,borderColor:'orange',borderRadius:15,alignItems:'center',justifyContent:"center",marginTop:20}}>
                        <Text style={{color:'white',fontSize:16,fontWeight:'bold',textAlign:'center'}}>Please read the document carefully before signing</Text>
                     </View>
                    {signers.filter((item)=>item.user.toString()===pubKey.toString())[0].signed&&<GestureHandlerRootView>
                    <View style={{width:'100%',alignItems:"center",justifyContent:'center',padding:15,gap:20}}>
                    <PanGestureHandler   onGestureEvent={gestureHandler}   >
                    <Animated.View    style={{width:300,height:65,backgroundColor:'black',borderRadius:5,padding:5,flexDirection:"row",elevation:10}}>

                        <Animated.View  style={[{borderRadius:5,backgroundColor:"#d4ff0d",height:'100%',aspectRatio:1,alignItems:"center",justifyContent:"center",elevation:10,zIndex:2,transform:[{translateX}]}]}>
                    <ImageComponent source={require('../assets/next.png')} style={[{tintColor:'white'},animationstyle2]} />
                        <ImageComponent source={require('../assets/tick.png')} style={[{tintColor:'white'},animationstyle]} />
                        </Animated.View>
                    <Animated.View style={{flex:1,justifyContent:'center',paddingLeft:30}}>
                    <Animated.Text style={[{color:'white',fontSize:22,fontWeight:'bold',opacity:1},animatedStyle3]}>Sign the document</Animated.Text>
                    </Animated.View>
                    </Animated.View>
                    </PanGestureHandler>

                    </View>
                    </GestureHandlerRootView>}
                    <View style={{height:50}}/>
                </View>
            </ScrollView>
        )
    }
  return (
    <EnhancedDarkThemeBackground children={<Children/>}/>
  )
}
