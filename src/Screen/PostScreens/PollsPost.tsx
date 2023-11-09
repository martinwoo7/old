import { useEffect, useState, useRef} from 'react';
import { Text, View, StyleSheet, Pressable, TextInput} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useScrollToTop } from '@react-navigation/native'

import EvilIcons from 'react-native-vector-icons/EvilIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { MessageComponent } from '../../Components/Post';
import TagComponent from '../../Components/TagComponent';

import { nanoid } from 'nanoid/non-secure';

const PollsPost = ({ navigation, tags, setTags, content, setContent, handlePost }) => {
    const [disabled, setDisabled] = useState(true)

    const [options, setOptions] = useState([
        {   
            key: nanoid(5),
            content: "",
            added: false

        },
        {
            key: nanoid(5),
            content: "",
            added: false
        }
    ])

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
        verb: 'asked a question',
        content: content,
        images: null,
        video: null,
        createdAt: new Date(2022, 11, 30, 5, 16),
    }

    const addOption = () => {
        const key = nanoid(5)
        setOptions((old) => [...old, {content: "", added: true, key: key}])
    }
    const removeOption = (key) => {
        setOptions((old) => old.filter((option) => option.key !== key))
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
                onPress={() => {console.log('submit')}} 
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
                    <MessageComponent enabled={false} data={dummyData} type={3} navigation={navigation} tags={tags} options={options} new/>

                    <Text style={[styles.header]}>Poll options:</Text>
                        <View style={{marginTop: 10}}>
                            {options.map((item, index) => {
                                // console.log(item.key)
                                if (item.added) {
                                    return (
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}} key={item.key}>
                                            <TextInput 
                                            placeholder={"Option " + (index + 1)} 
                                            placeholderTextColor='darkgrey' 
                                            style={[styles.option, {flex: 1}]}
                                            value={item.content}
                                            onChangeText={(input)=>{
                                                let temp = [...options]
                                                temp[index] = {...temp[index], content: input}
                                                setOptions(temp)
                                            }}
                                            />
                                            <View style={{justifyContent: 'center', alignContent: 'center', marginHorizontal: 15}}>
                                                <Pressable onPress={()=>removeOption(item.key)}>
                                                    <EvilIcons name="close" size={32} color="darkgrey" />
                                                </Pressable>
                                            </View>
                                        </View>
                                    )
                                } else {
                                    return (
                                        <View style={{marginBottom: 15}} key={item.key}>
                                            <TextInput 
                                            placeholder={"Option " + (index + 1)} 
                                            placeholderTextColor='darkgrey' 
                                            style={[styles.option]}
                                            
                                            value={item.content}
                                            onChangeText={(input)=>{
                                                let temp = [...options]
                                                temp[index] = {...temp[index], content: input}
                                                setOptions(temp)
                                            }}
                                            />
                                        </View>

                                    )
                                }
                            })}

                            <Pressable style={[styles.option]} onPress={addOption}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <AntDesign name="plus" size={26} color="darkgrey" />
                                    <Text style={{marginLeft: 10, color: 'darkgrey'}}>Add option</Text>
                                </View>
                            </Pressable>
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

export default PollsPost;

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
    option: {
        backgroundColor: 'aliceblue',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
    }
})