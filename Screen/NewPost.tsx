import React, {useEffect, useMemo, useState} from "react";
import { Text, View, StyleSheet, Pressable, TextInput} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Icon  from 'react-native-vector-icons/MaterialCommunityIcons' 
import { ICON_SIZE } from "../constants";
import { MessageComponent } from "../Components/Post";
import emulators from "../firebase";

// TODO: Implement preview
// Either 1. limit text length before truncating or 
// 2. add preview to the side (swipe to view?)
const Objects = [
    {
        name: 'text',

    },
    {
        name: 'file-image-outline'
    },
    {
        name: 'file-video-outline'
    },
    {
        name: 'poll'
    }
]

const NewPost = ({ navigation, route }) => {

    const [state, setState] = useState(0)
    const [content, setContent] = useState('Nothing :)')
    const dummyData = {
        likes: 0,
        comments: 0,
        name: 'Jimmy',
        verb: 'shouted',
        content: content,
    }

    useEffect(() => {
        if (content === '') {
            setContent('Nothing :)')
        }
    }, [content])

    const TextPost = () => {
        return (
            <>
                <MessageComponent enabled={false} data={dummyData} />
                <TextInput
                multiline
                style={{color: 'lightgrey', marginTop: 10}} 
                placeholderTextColor='lightgrey'
                placeholder="Add interesting content here"
                onChangeText={(input) => {
                    setContent(input)
                }}
                
                />
            </>
        )
    }

    const renderContent = (type) => {
        switch(type) {
            case 0 : {
                return (
                    <TextPost />
                )
            }
            case 1 : {
                return (
                    <Text>Post image content</Text>
                )
            }
            case 2 : {
                return (
                    <Text>Post video content</Text>
                )
            }
            case 3 : {
                return (
                    <Text>Post poll content</Text>
                )
            }
        }
    }

    return (
        <>
        <SafeAreaView style={styles.container}>
            <View style={{flexDirection: 'row', marginTop: 10, alignItems:'center' }}>
                <Pressable onPress={()=> navigation.goBack()}>
                    <EvilIcons name="close" size={36} color="lightgrey" />
                </Pressable>
                {/* <Text style={{color:'lightgrey', fontSize: 24, marginLeft: 15}}>New Post</Text> */}
            </View>
            <Text style={{color: "lightgrey", fontSize: 24, marginTop: 10, marginBottom: 5}}>Preview:</Text>
            {renderContent(state)}
        </SafeAreaView>

        <SafeAreaView>
            <View style={{flexDirection: 'row', backgroundColor: "#202225", paddingVertical: 10}}>
                {Objects.map((item, index) => {
                    
                    const isFocused = state === index;
                    const onPress = () => {
                        console.log("changing to ", item.name, " content")

                        if (!isFocused) {
                            setState(index)
                        }
                    }

                    return (
                        <Pressable
                        onPress={onPress}
                        style={{flex: 1, alignItems: 'center'}}
                        key={item.name}
                        >
                            <Icon name={item.name} size={ICON_SIZE} color={isFocused ? 'orange' : 'lightgrey'} />
                        </Pressable>
                    )
                })}
            </View>
        </SafeAreaView>
        </>
    )
}

export default NewPost

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '5%',
        flex: 1,
    }
})