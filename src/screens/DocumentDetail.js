/*eslint-disable*/
import React, { useState } from 'react'
import { ImageBackground, StatusBar, TouchableOpacity, View,Text, Image, Modal, Touchable, ScrollView,Dimensions } from 'react-native'
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground'
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

export default function DocumentDetail() {
    const signers=[1,2,3,4]
    const Children=()=>{
        const [visible, setvisible] = useState(false)
        const address="2ooqk3QB9KVqcwKE8EnxDNoUnTAMfTH43qmqtMA1T1zk"
        const x=useSharedValue(0)
        const y=useSharedValue(0)
        const width=Dimensions.get('screen').width-95
        const v1=useSharedValue(0)
         const v2=useSharedValue(1)
        const gestureHandler=useAnimatedGestureHandler({
          onStart:(e,c)=>{
             c.startX=x.value
              c.startY=y.value
          },
          onActive:(e,c)=>{
            if(x.value>c.startX+e.translationX){
              v2.value=v2.value+0.02
            }
            if(x.value>width/2){
            v1.value=withTiming(360,{duration:650})  
            v2.value=v2.value-0.02
            }
            else{
              v1.value=0
            }
            x.value=c.startX+e.translationX
             y.value=0
          },
          onEnd:(e,c)=>{
    
            if(x.value>width){
            //  runOnJS(navigation.navigate)(('nextpage'))
             x.value=withTiming(0,{duration:1000});
            }else{
              x.value=withTiming(0,{duration:500});
              y.value=withTiming(0,{duration:500})
              v2.value=1
            }
          }
      })
        const animatedStyle2=useAnimatedStyle(()=>{
          return{
              transform:[{translateX:x.value>=width?width:x.value<=0?0:x.value},{translateY:0}]
          }
      })
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
            <Modal visible={visible} transparent style={{paddingTop:StatusBar.currentHeight+20}}>
              <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.3)',alignItems:"center",justifyContent:"center",padding:20}}>
                <View style={{width:"100%",alignItems:'flex-end',justifyContent:'flex-end'}}>
                <TouchableOpacity onPress={()=>{setvisible(false)}}>
                    <Image tintColor={'white'} style={{height:50,width:50}} source={require('../assets/backgrounds/cross.png')}/>
                </TouchableOpacity>
                </View>
                   <Image style={{width:'100%',height:"90%",resizeMode:'stretch'}} source={require('../assets/dummyimg.jpg')}/>
              </View>
            </Modal>
                <View style={{width:"100%",alignItems:"center",justifyContent:"center"}}>
                <TouchableOpacity onPress={()=>{setvisible(true)}} style={{position:'absolute',zIndex:2,borderWidth:1,borderColor:'white',width:200,height:50,borderRadius:20,flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingVertical:15}}>
                <Image source={require('../assets/backgrounds/eye.png')} tintColor={'white'} style={{height:40,width:40}}/>
                  <Text style={{color:"white",fontSize:16,fontWeight:'bold'}}>View Document</Text>
                </TouchableOpacity>
                    <ImageBackground source={require('../assets/dummyimg.jpg')} resizeMode='cover' style={{height:350,width:250,borderRadius:25,overflow:'hidden',opacity:0.4}}>
                      
                    </ImageBackground>
                </View>
                <View style={{flex:1,width:"100%",gap:10,marginTop:20}}>
                   <Text style={{color:"white",fontSize:22,fontWeight:"bold"}}>Uploader</Text>
                   <View style={{flexDirection:'row',alignItems:"center",justifyContent:'space-around'}}>
                   <Image style={{height:80,width:80,borderRadius:15}} source={require('../assets/backgrounds/dummyselfie.jpg')}/>
                   <View style={{flex:1,height:90,padding:15,justifyContent:'center'}}>
                   <Text style={{color:'white',fontSize:16}}>Address: {address.substring(0,4)}....{address.substring(address.length-4,address.length)}</Text>
                   </View>
                   </View>
                   <Text style={{color:"white",fontSize:22,fontWeight:"bold"}}>Signers</Text>
                    {signers&&signers.map((item,index)=>{
                        return(
                            <View key={index} style={{flexDirection:'row',alignItems:"center",justifyContent:'space-around'}}>
                   <Image style={{height:80,width:80,borderRadius:15}} source={require('../assets/backgrounds/dummyselfie.jpg')}/>
                   <View style={{flex:1,height:90,padding:10,justifyContent:'space-around'}}>
                   <Text style={{color:'white',fontSize:16}}>Address: {address.substring(0,4)}....{address.substring(address.length-4,address.length)}</Text>
                   <View style={{backgroundColor:'#a9ffa9', borderColor:'green',borderWidth:2,width:100,alignItems:'center',justifyContent:'center',borderRadius:10,paddingVertical:5}}>
                     <Text style={{color:'green',fontSize:16,fontWeight:'bold'}}>Signed</Text>
                   </View>
                   </View>
                   </View>
                        )
                    })}
                   
                    <GestureHandlerRootView>
                    <View style={{width:'100%',alignItems:"center",justifyContent:'center',padding:15,gap:20}}>
                    <LinearGradient   colors={['black','black','black']} style={{width:"100%",height:65,backgroundColor:'green',borderRadius:5,padding:5,flexDirection:"row",elevation:10}}>
                    <PanGestureHandler  onGestureEvent={gestureHandler} >
                        <Animated.View  style={[{borderRadius:5,backgroundColor:"#d4ff0d",height:'100%',aspectRatio:1,alignItems:"center",justifyContent:"center",elevation:10,zIndex:2},animatedStyle2]}>
                    <ImageComponent source={require('../assets/next.png')} style={[{tintColor:'white'},animationstyle2]} />
                        <ImageComponent source={require('../assets/tick.png')} style={[{tintColor:'white'},animationstyle]} />
                        </Animated.View>
                    </PanGestureHandler>
                    <View style={{flex:1,justifyContent:'center',paddingLeft:30}}>
                    <Animated.Text style={[{color:'white',fontSize:22,fontWeight:'bold',opacity:1},animatedStyle3]}>Slide to place order</Animated.Text>
                    </View>

                    </LinearGradient>
                    </View>
                    </GestureHandlerRootView>
                    <View style={{height:50}}/>
                </View>
            </ScrollView>
        )
    }
  return (
    <EnhancedDarkThemeBackground children={<Children/>}/>
  )
}
