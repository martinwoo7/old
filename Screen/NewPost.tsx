import React, {useEffect, useMemo, useState} from "react";
import { Text, View, StyleSheet, Pressable, TextInput, Image, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Icon  from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { ICON_SIZE } from "../constants";
import { MessageComponent } from "../Components/Post";
import * as ImagePicker from 'expo-image-picker'
import emulators from "../firebase";
import { nanoid } from "nanoid/non-secure";

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

const ImageBox = ({image, setImage}) => {
    
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            // allowsEditing: true,
            selectionLimit: 6,
            allowsMultipleSelection: true,
            aspect: [4, 3],
            quality: 1
        })
        
        console.log(result)

        if (!result.canceled) {
            const changedResult = result.assets.map((element) => {
                const key = nanoid(5);
                return { ...element, key: key}
            });
            // setImage((old) => [...old, result.assets])
            setImage((old) => old.concat(changedResult))
        }   
    }

    const handleDelete = (key: string) => {
        setImage((current) => current.filter((img) => img.key !== key))
    }

    return (
        <View style={{ marginTop: 10}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* need to manually limit images to 6 on android */}
            {image && image.map((img, _) => {
                
                return (
                    <View style={{width: 100, height: 100, marginRight: 10}} key={img.key}>
                        <Pressable 
                        style={{position: 'absolute', zIndex: 2, paddingVertical: 2, paddingHorizontal: 0, top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12}}
                        onPress={()=> handleDelete(img.key)}
                        >
                            <EvilIcons name="close" size={18} color="white" />
                        </Pressable>
                        <Image source={{uri: img.uri }} style={{height: '100%', width: '100%', borderRadius: 8}}/>
                    </View>
                )
            })}
            {!image ? 
            <Pressable 
            onPress={pickImage} 
            style={styles.imageContainer}
            >
                <AntDesign name="plus" size={42} color="lightgrey" />
            </Pressable> 
            :
            image.length < 6 
            ?
            <Pressable 
            onPress={pickImage} 
            style={styles.imageContainer}
            >
                <AntDesign name="plus" size={42} color="lightgrey" />
            </Pressable>
            :
            null
            }

        </ScrollView>
        </View>
    )
}
const NewPost = ({ navigation, route }) => {

    const [state, setState] = useState(0)
    const [content, setContent] = useState('')
    const [disabled, setDisabled] = useState(true)
    const [images, setImages] = useState([])
    const [video, setVideo] = useState(null)

    const dummyData = {
        likes: 0,
        comments: 0,
        name: 'Jimmy',
        verb: 'shouted',
        content: !content ? "-Interesting content-" : content,
        images: images,
        video: video
    }

    useEffect(() => {
        if (state === 0 && content === '') {
            setDisabled(true)
        } 
        else if (state === 1 && (content === '' || images.length === 0)){
            setDisabled(true)
        }
        else if (state === 2 && (content === '' || !video)) {
            setDisabled(true)
        }
        else {
            setDisabled(false)
        }
    }, [content, images, video])

    const renderContent = (type) => {
        switch(type) {
            case 0 : {
                return (
                    // <TextPost />
                    <>
                        <MessageComponent enabled={false} data={dummyData} />
                        <TextInput
                        multiline
                        style={{color: 'lightgrey', marginTop: 10}} 
                        placeholderTextColor='lightgrey'
                        placeholder="Add interesting content here"
                        value={content}
                        onChangeText={(input) => {
                            setContent((old) => {return input})
                        }}
                        
                        />
                    </>
                )
            }
            case 1 : {
                return (
                    <>
                        <MessageComponent enabled={false} data={dummyData} />
                        <ImageBox image={images} setImage={setImages}/>
                        <TextInput
                        multiline
                        style={{color: 'lightgrey', marginTop: 10}} 
                        placeholderTextColor='lightgrey'
                        placeholder="Add interesting content here"
                        value={content}
                        onChangeText={(input) => {
                            setContent((old) => {return input})
                        }}
                        
                        />
                    </>
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
            <View style={{flexDirection: 'row', marginTop: 10, alignItems:'center'}}>
                <Pressable onPress={()=> navigation.goBack()}>
                    <EvilIcons name="close" size={36} color="lightgrey" />
                </Pressable>
                {/* <Text style={{color:'lightgrey', fontSize: 24, marginLeft: 15}}>New Post</Text> */}
                <Pressable
                disabled={disabled}
                onPress={() => {console.log('submit')}} 
                style={{alignItems:'center', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 25 , marginLeft:'auto', backgroundColor: disabled ? '#D1B58A' : 'orange'}}
                >
                    <Text style={{fontSize: 16, color: disabled ? 'grey': 'white'}}>Next</Text>
                </Pressable>
            </View>
            <Text style={{color: "lightgrey", fontSize: 24, marginTop: 10, marginBottom: 5}}>Preview:</Text>
            {renderContent(state)}
        </SafeAreaView>

        <SafeAreaView>
            <View style={{flexDirection: 'row', backgroundColor: "#202225", paddingVertical: 10}}>
                {Objects.map((item, index) => {
                    
                    const isFocused = state === index;
                    const onPress = () => {
                        // console.log("changing to ", item.name, " content")
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
    },
    imageContainer: {
        width: 100, 
        height: 100, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: 'lightgrey',
        borderStyle: 'dashed',
        borderRadius: 1
    }
})