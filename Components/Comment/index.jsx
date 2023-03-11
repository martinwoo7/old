import React, {useRef, useEffect, useState} from 'react'
import { StyleSheet, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TextInput } from "react-native-gesture-handler";
import emulators from "../../firebase";
import { addDoc, collection, query, serverTimestamp, updateDoc, doc, increment, writeBatch} from "firebase/firestore";

const incrementComment = async (ref, numShards) => {

    const shardId = Math.floor(Math.random() * numShards).toString();
    const shardRef = doc(ref, 'shards', shardId)
    await updateDoc(shardRef, {
        count: increment(1)
    })
}

const Comment = ({ navigation, route }) => {
    const { postId, parentId, replyContent } = route.params
    const db = emulators.firestore
    const auth = emulators.authentication

    const [text, setText] = useState('')

    

    const handlePost = async () => {
        // const batch = writeBatch(db)
        let id 
        if (postId === parentId) {
            await addDoc(collection(db, 'posts', postId, 'comments'), {
                content: text,
                createdAt: serverTimestamp(),
                createdBy: auth.currentUser.uid,
                modifiedAt: serverTimestamp(),
                postId: postId,
                name: auth.currentUser.displayName,
                likes: 1
            })
            .then(async (msg) => {
                console.log("Comment saved successfully with id ", msg.id)
                id = msg.id
            })
        } else {
            await addDoc(collection(db, 'posts', postId, 'comments'), {
                content: text,
                createdAt: serverTimestamp(),
                createdBy: auth.currentUser.uid,
                modifiedAt: serverTimestamp(),
                parent: parentId,
                postId: postId,
                name: auth.currentUser.displayName,
                likes: 1
            })
            .then(async (msg) => {
                cconsole.log("Comment saved successfully with id ", msg.id)
                id = msg.id
            })
        }
        const ref = doc(db, 'counters', id)

        // There's a chance that the numShard will not be 10 and I need to change this
        incrementComment(ref, 10)
        navigation.goBack()
        
    }
    return (
        <>
        <SafeAreaView style={{flex: 1}}>
            <View
            elevation={3}
            style={{flexDirection: 'row', marginHorizontal: 20, marginTop: 10, paddingVertical: 10, alignItems: 'center'}}
            >
                <Pressable onPress={()=>navigation.goBack()}>
                    <MaterialCommunityIcons name="window-close" size={28} color="aliceblue" style={{margin: 0, padding: 0}} />
                </Pressable>
                <Text style={{color: "aliceblue", marginLeft: 20}}>Add new comment</Text>
                <Pressable style={{marginLeft: 'auto'}} onPress={handlePost}>
                    <Text style={{color: "orange"}}>Post</Text>
                </Pressable>
            </View>

            <View style={{marginHorizontal: 10, borderBottomWidth: 1, borderBottomColor: 'darkgrey', paddingVertical: 20}}>
                <Text  style={{color: 'aliceblue'}}>{replyContent}</Text>
            </View>
            <KeyboardAwareScrollView style={{}} enableOnAndroid>

                <TextInput 
                    multiline
                    value={text}
                    onChangeText={(value) => setText(value)}
                    placeholder="Add your comment here"
                    placeholderTextColor="lightgrey"
                    style={{color: 'lightgrey', marginHorizontal: 10, marginTop: 20}}
                />
                
                
            </KeyboardAwareScrollView>
            
            
        </SafeAreaView>
        {/* <View style={{}}>
            <Pressable><Text>Press some buttons here</Text></Pressable>
        </View> */}
    
        </>
    )
}

export default Comment;
