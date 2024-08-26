/*eslint-disable*/
import React from 'react'
import { Dimensions, FlatList, Image, StatusBar, TouchableOpacity, View } from 'react-native'
import EnhancedDarkThemeBackground from './EnhancedDarkThemeBackground'

export default function DocumentPage() {
    const {width,height}=Dimensions.get('window')
    const Children=({})=>{
        const data=[1,2,3,4]
        return (
            <View style={{paddingTop:StatusBar.currentHeight+20,padding:20}}>
            <FlatList
              data={data}
              numColumns={2}
              keyExtractor={(item)=>item.toString()}
              ItemSeparatorComponent={()=><View style={{height:20}}/>}
              renderItem={({item})=>{
                  return(
                      <TouchableOpacity style={{height:200,width:(width-60)/2,marginRight:20,borderRadius:20}}>
                       <Image source={require('../assets/dummyimg.jpg')} style={{height:"100%",width:'100%',resizeMode:'stretch',borderRadius:20}}/>
                      </TouchableOpacity>
                  )
              }}
            />
            </View>
        )
    }   
  return (
  <EnhancedDarkThemeBackground children={<Children/>}/>
  )
}
