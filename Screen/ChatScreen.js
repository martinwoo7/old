import React, {useEffect, useState, useRef} from 'react'
import Constants from 'expo-constants';
import {useHeaderHeight} from '@react-navigation/elements';
import { 
    collection,
    setDoc,
    serverTimestamp,
    query,
    addDoc,
    orderBy,
    limit,
    onSnapshot,
    doc,
    getDocs,
    updateDoc,
    arrayUnion,
    where,
} from 'firebase/firestore';
import {
    View,
    StyleSheet,
    Text,
    Alert,
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
    TouchableOpacity,
    TextInput,
} from 'react-native'
import { Avatar } from '@rneui/themed';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Chat from '../Components/Chat';
import SendButton from '../Components/SendButton';
import Input from '../Components/Input';
import emulators from '../firebase';


const ChatScreen = ({ navigation, route }) => {
    // console.log(route.params.to)
    return (
        <SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>
            <Header navigation={navigation} route={route} />
            <MessageContainer route={route} />
        </SafeAreaView> 
    )   
}

const Header = ({ navigation , route }) => (
    <View style={[styles.flexify, {paddingHorizontal: "5%", paddingVertical: 25}]}>
        <TouchableOpacity onPress={() => navigation.navigate("ChatList")} activeOpacity={0.5} >
            <MaterialIcons name="arrow-back" size={18} color="white" />
        </TouchableOpacity>

        <View style={[styles.flexify, {flex: 1, margin: 0}]}>
            <View style={styles.flexify}>
                <Avatar rounded placeholderStyle={{ opacity: 0 }} source={{uri: route.params.photoUrl}}/>
                <Text style={{fontWeight:"600", color: "white"}}>{route.params.to}</Text>
            </View>
            <View style={styles.flexify}>
                <TouchableOpacity activeOpacity={0.5} style={{marginRight: 25}}>
                    <MaterialIcons name="person" size={18} />

                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.5}>
                    <MaterialIcons name="person" size={18} />
                </TouchableOpacity>
            </View>
        </View>
    </View>
)

const MessageContainer = ({ route }) => {

    const db = emulators.firestore
    const auth = emulators.authentication

    const viewport = useWindowDimensions()
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const scrollViewRef = useRef()

    const [groupId, setGroupId] = useState('')

    useEffect(() => {
        if (route.params.groups) {
            setGroupId(route.params.groups)
        }
    },[])

    const currentUid = auth.currentUser.uid;

    const sendMessage = async () => {
        let receiverID = route.params.id
        let messageText = message
        let photoURL = route.params.photoURL
        
        let group = groupId
        if (message.length > 1 && message.length < 40) {
            if (!groupId) {
                // if the groupId is still not set, it means a previous chat
                // didn't exist and we need to create a new collection
 
                console.log("Creating new group message")
            
                const newDocRef = collection(db, 'group')
                const docRef = await addDoc(newDocRef, {
                    createdAt: serverTimestamp(),
                    createdBy: currentUid,
                    members: [currentUid, receiverID],
                    modifiedAt: serverTimestamp(),
                    name: receiverID,
                    type: route.params.type // 1 is for private, 2 is group 
                })
                await updateDoc(doc(db, 'group', docRef.id), {
                    groupID: docRef.id
                })

                await updateDoc(doc(db, 'user', currentUid), {
                    groups: arrayUnion(docRef.id)
                })
                await updateDoc(doc(db, 'user', receiverID), {
                    groups: arrayUnion(docRef.id)
                })

                group = docRef.id
                setGroupId(docRef.id)

            } else {
                console.log("group id already set")
            }
            
            try {
                console.log('saving message to db: ', message)
                await addDoc(collection(db, "message", group, "messages"), {
                    owner: currentUid,
                    to: receiverID,
                    message_text: messageText,
                    createdAt: serverTimestamp(),
                    photoURL: photoURL,
                    displayName: route.params.to,
                })
                .then((message) => {
                    setMessages([...messages, 
                        {
                            message_text: messageText,
                            to: receiverID,
                            owner: currentUid,
                            displayName: route.params.to,
                            photoURL: photoURL,
                            createdAt: serverTimestamp(),
                        }
                    ])
                    
                    console.log('Message sent successfully with id', message.id)
                })

                await updateDoc(doc(db, 'group', group), {
                    modifiedAt: serverTimestamp(),
                    lastMessage: message,
                })

                setMessage('')

            } catch (error) {
                Alert.alert('Message sending failed with error', error.message)
            }
        } else { 
            Alert.alert('Chat not sent', 'Must be between 1 and 40 characters');
        }
    }
    
    const getMessages = async () => {
        // check if message to person already exists

        let tempGroupId
        console.log("group id:", route.params.groups)

        if (route.params.groups || groupId) {
            tempGroupId = route.params.groups ? route.params.groups : groupId
        }

        if (!tempGroupId) {
            try {
                const q = query(doc(db, 'user', route.params.id), where('groups', "array-contains-any", route.params.groups))
    
                const retrieve = await getDocs(q)
                if (retrieve.exists()) {
                    // there is overlap, now check the types
                    for (const group in retrieve.data()) {
                        const q2 = query(collection(db, 'group', group), where('type', "==", 1))
                        const retrieve2 = await getDocs(q2)
                        if (retrieve2.exists()) {
                            tempGroupId = group
                            setGroupId(tempGroupId)
                            console.log("Found groupId: ", tempGroupId)                     
                        } else {
                            console.log("Private chat doesn't exist, creating new")
                        }
                    }
                } else {
                    console.log("Private chat doesn't exist, creating new")
                }
            } catch (error) {
                console.log(error)
    
                // TODO: see if I can single out the 'group empty' error
                console.log("Private chat doesn't exist, creating new")
    
            }
        } else {
            console.log("Group id already set")
        }
        

        if (tempGroupId) {
            console.log('attemping to retrieve chat messages')

            try{
                const q = query(collection(db, 'message', tempGroupId, 'messages'), orderBy('createdAt', 'asc'), limit(15))
                const retrieve = await getDocs(q)

                let chatArr = []
                retrieve.forEach((doc) => {
                    const id = doc.id
                    const data = doc.data()
                    chatArr.push(data)
                })
                console.log(chatArr)
                setMessages(chatArr)
                setGroupId(tempGroupId)
                
            } catch (error) {
                console.log(error)
            }
        }
        else {
            console.log("No prior chats, skipping message fetching")
        }
    }

    const listenForMessage = () => {

    }

    useEffect(() => {
        getMessages()
    }, [route])

    return(
        // i will have to add safeareaview for ios
        <>
        <ScrollView
            ref={scrollViewRef}    
            onContentSizeChange={(width, height) => scrollViewRef.current.scrollTo({y: height})}
            style={[styles.AndroidSafeArea, {backgroundColor: 'white', maxHeight: viewport.height.toFixed(0) - 126, padding: 10}]}
            showsVerticalScrollIndicator={false}
        >  
            <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginVertical: 5}}></View>
            {messages.map((message, index) => (
                <Message 
                    key={index}
                    currentUser={auth.currentUser.uid}
                    owner={message.owner}
                    message={message}
                />
            ))}
        </ScrollView>
        <View style={[styles.flexify, styles.positAtBottom, styles.shadow ]}>
            <TouchableOpacity style={{paddingVertical: 5, paddingHorizontal: 7, borderRadius: 50, backgroundColor: '#122643'}}>
                <MaterialCommunityIcons name="plus" size={12} color="white" />
            </TouchableOpacity>
            
            <View style={{flex: 1}}>
                <TextInput
                    placeholder="Write a message..."
                    onSubmitEditing={()=> sendMessage()}
                    onChangeText={(text) => setMessage(text)}
                    value={message}
                    autoFocus={true}
                    style={styles.inputStyle}
                />
            </View>
            <TouchableOpacity
                style={{paddingVertical: 5, paddingHorizontal: 7, borderRadius: 50, backgroundColor: '#c5c5c5'}}
                activeOpacity={0.5}
                disabled={message.length < 1}
                onPress={() => sendMessage()}
            >
                <MaterialIcons name="keyboard-arrow-right" size={12} color="blacl" />
            </TouchableOpacity>
        </View>
        </>
    )
}

const Message = ({ message, currentUser, owner }) => {
    const dateToTime = (date) => {
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let ampm = hours >= 12 ? 'pm' : 'am'
        hours = hours % 12
        hours = hours ? hours : 12
        minutes = minutes < 10 ? '0' + minutes : minutes
        let strTime = hours + ':' + minutes + ' ' + ampm
        return strTime
    }

    const isDateToday = (date) => {
        const today = new Date().getDate()
        const day = new Date(date * 1000).getDate()

        return today == day
    }

    // console.log(currentUser, owner)
    return currentUser == owner ? (
        <View style={[styles.flexify, styles.spaceMsg]}>
            <Avatar 
                placeholderStyle={{opacity: 0}}
                rounded
                source={{ uri: message.photoURL}}
            />
            <View style={[styles.msgBg, {marginLeft: 10}]}>
                <Text style={{fontWeight: "800", fontSize: 13, color: '#4c4c4c', textTransform: 'capitalize'}}>
                    Me
                </Text>
                <Text style={{fontWeight: "600", marginVertical: 5}}>
                    {message.message_text}
                </Text>
                <Text style={{ fontWeight: "600" }}>
                    {dateToTime(new Date(message.createdAt * 1000))}
                </Text>
            </View>
        </View>
    ) : (
        <View style={[styles.flexify, styles.spaceMsg]}>
            <View style={[styles.msgBg, {backgroundColor: '#c5c5c5', marginRight: 10}]}>
                <Text style={{fontWeight: "800", fontSize: 13, color: '#4c4c4c', textTransform: 'capitalize'}}>
                    {message.displayName}
                </Text>
                <Text styles={{fontWeight: "600", marginVertical: 5}}>
                    {message.message_text}
                </Text>
                <Text styles={{fontWeight: "600" }}>
                    {dateToTime(new Date(message.createdAt * 1000))}
                </Text>
            </View>

            <Avatar 
                placeholderStyle={{ opacity: 0 }}
                rounded
                source={{ uri: message.photoURL}}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#122643',
    },
    flexify: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    msgBg: {
        flex: 1,
        backgroundColor: '#efefef',
        borderRadius: 20,
        padding: 10,
    },
    spaceMsg: {
        alignItems: 'flex-end',
        marginVertical: 5,
    },
    positAtBottom:{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    AndroidSafeArea: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
    dp: {
        marginHorizontal: 10,
    },
    shadow: {
        shadowColor: '#171717',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.26,
        shadowRadius: 10,
        elevation: 12,
        backgroundColor: 'white',
    }
})

export default ChatScreen;