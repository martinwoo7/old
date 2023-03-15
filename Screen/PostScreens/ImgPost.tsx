import { useEffect, useState, useRef} from 'react';
import { Text, View, StyleSheet, Pressable, TextInput, ScrollView, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker'
import { useScrollToTop } from '@react-navigation/native'

import EvilIcons from 'react-native-vector-icons/EvilIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { MessageComponent } from '../../Components/Post';
import TagComponent from '../../Components/TagComponent';

import { nanoid } from 'nanoid/non-secure';


const ImgPost = ({ navigation, tags, setTags, content, setContent, handlePost }) => {
    const [disabled, setDisabled] = useState(true)
    const [image, setImage] = useState([])

    const ref = useRef(null)
    useScrollToTop(ref)

    useEffect(() => {
        if (content === '') {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [content])

    const dummyData = {
        likes: 0,
        comments: 0,
        name: 'Jimmy',
        verb: 'posted a picture',
        content: content,
        images: null,
        video: null,
        createdAt: new Date(2022, 11, 30, 5, 16),
    }

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
        <SafeAreaView style={[styles.container]}>
            <View style={{flexDirection: 'row', marginTop: 10, alignItems:'center'}}>
                <Pressable onPress={()=> navigation.goBack()}>
                    <EvilIcons name="close" size={36} color="lightgrey" />
                </Pressable>
                {/* <Text style={{color:'lightgrey', fontSize: 24, marginLeft: 15}}>New Post</Text> */}
                <Pressable
                disabled={disabled}
                onPress={() => handlePost(1, image, [])} 
                style={{alignItems:'center', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 25 , marginLeft:'auto', backgroundColor: disabled ? '#D1B58A' : 'orange'}}
                >
                    <Text style={{fontSize: 16, color: disabled ? 'grey': 'white'}}>Post</Text>
                </Pressable>
            </View>
            <KeyboardAwareScrollView
            ref={ref}
            showsVerticalScrollIndicator={false} 
            enableOnAndroid 
            extraHeight={75} 
            style={{marginTop: 10}}
            keyboardShouldPersistTaps='handled'
            >
                <Text style={{color: "lightgrey", fontSize: 24, marginBottom: 5}}>Preview:</Text>

                {/* render content here */}
                <View style={{ flex: 1 }}>
                    <MessageComponent enabled={false} data={dummyData} state={1} navigation={navigation} tags={tags} new/>
                    
                    <Text style={[styles.header]}>Images: </Text>
                    <View style={{ marginTop: 10, marginBottom: 15}}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
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

                    <Text style={[styles.header]}>Content:</Text>
                    <TextInput
                    multiline
                    style={{color: 'lightgrey'}} 
                    placeholderTextColor='lightgrey'
                    placeholder="Add interesting content here"
                    value={content}
                    onChangeText={(input) => {
                        setContent((old) =>  input)
                    }}
                    />
                    <Text style={[styles.header, {marginTop: 50, marginBottom: 5}]}>Tags:</Text>

                    <TagComponent tags={tags} setTags={setTags} />
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default ImgPost;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '5%',
        flex: 1,
    },
    header: {
        color: 'lightgrey',
        fontSize: 24,
        marginTop: 20

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
    },
})