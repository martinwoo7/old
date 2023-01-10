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
    getDoc,
    updateDoc,
    arrayUnion,
    where,
    Timestamp,
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
    Platform,
    ScrollView,
    useWindowDimensions,
    TouchableOpacity,
    TextInput,
} from 'react-native'
import { Avatar } from '@rneui/themed';
import moment from 'moment/moment';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Chat from '../Components/Chat';
import SendButton from '../Components/SendButton';
import Input from '../Components/Input';
import emulators from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Scrolling up past a certain point will retrieve more messages

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
                <Avatar size={36} rounded containerStyle={{marginHorizontal: 10}} placeholderStyle={{ opacity: 0 }} source={{uri: route.params.photoURL}}/>
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

const groupedDays = (messages) => {
    return messages.reduce((acc, el, i) => {
        let date = el.createdAt.toDate()
        const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        if (acc[messageDay]) {
            return {...acc, [messageDay]: acc[messageDay].concat([el]) }
        }
        return {...acc, [messageDay]: [el]}
    }, {})
}

const generateItems = (messages) => {
    const days = groupedDays(messages)
    const sortedDays = Object.keys(days).sort(
        (x, y) => x > y ? 1 : x < y ? -1 : 0
    )
    const items = sortedDays.reduce((acc, date) => {
        const sortedMessage = days[date].sort(
            (x, y) => y.createdAt.toDate() > x.createdAt.toDate() ? 1 : y.createdAt.toDate() < x.createdAt.toDate() ? -1 : 0
        )
        return acc.concat([...sortedMessage, {type:'day', date, id: date }])
    }, [])
    return items
}

const MessageContainer = ({ route }) => {

    const db = emulators.firestore
    const auth = emulators.authentication

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [renderMessages, setRenderMessages] = useState([])

    const unsubRef = useRef()
    const groupId = useRef()
    const generatedItems = useRef()

    const sendMessage = async () => {
        let receiverID = route.params.id
        let messageText = message
        let time = Timestamp.fromDate(new Date())
        
        if (message.length > 1 && message.length < 40) {
            if (!groupId.current) {
                // if the groupId is still not set, it means a previous chat
                // didn't exist and we need to create a new collection
                
                // creating private chat
                console.log("Creating new group message")
            
                const newDocRef = collection(db, 'group')
                const docRef = await addDoc(newDocRef, {
                    createdAt: time,
                    createdBy: auth.currentUser.uid,
                    lastMessage: '',
                    lastSender: auth.currentUser.uid,
                    members: [auth.currentUser.uid, receiverID],
                    modifiedAt: time,
                    name: route.params.to,
                    type: route.params.type // 1 is for private, 2 is group 
                })

                groupId.current = docRef.id
                console.log('Group id created: ', groupId.current)

            } else {
                console.log("group id already set")
            }
            
            try {
                console.log('saving message to db: ', messageText)
                
                await addDoc(collection(db, "group", groupId.current, "messages"), {
                    owner: auth.currentUser.uid,
                    to: receiverID,
                    message_text: messageText,
                    createdAt: time,
                })
                .then((msg) => {
                    setMessages([ 
                        {
                            owner: auth.currentUser.uid,
                            to: receiverID,
                            message_text: messageText,
                            createdAt: time,
                        }, ...messages
                    ])
                    setMessage('')
                    console.log('Message sent successfully with id', msg.id)
                })

                await updateDoc(doc(db, 'group', groupId.current), {
                    modifiedAt: time,
                    lastMessage: messageText,
                    lastSender: auth.currentUser.uid
                })

                

            } catch (error) {
                Alert.alert('Message sending failed with error', error.message)
            }
        } else { 
            Alert.alert('Chat not sent', 'Must be between 1 and 40 characters');
        }
    }
    
    const getMessages = async () => {
        // check if message to person already exists
        if (route.params.groups || groupId) {
            groupId.current = route.params.groups ? route.params.groups : groupId.current
        }

        if (!groupId.current) {
            try {
                const q = query(
                    collection(db, 'group'),
                    where('members', 'array-contains', auth.currentUser.uid),
                    where('members', "array-contains", route.params.id),
                    where('type', '==', 1)
                )
    
                const retrieve = await getDoc(q)
                if (retrieve.exists()) {
                    // should only have one return
                    groupId.current(retrieve.id)
                } else {
                    // only group chats exists or no private chats exist
                    console.log("Private chat doesn't exist, creating new")
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            const q2 = query(
                collection(db,'group', groupId.current, 'messages'),
                orderBy('createdAt', 'asc'),
                limit(50)
            )
            const unsubscribe = onSnapshot(q2, (snapshot) => {
                const newMessages = []
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        // console.log("New message: ", change.doc.data().message_text)
                        // setMessages(oldMessages => {
                        //     return [
                        //         ...oldMessages,
                        //         change.doc.data()
                        //     ]
                        // })

                        // I need to add extra 'tags' here to identify when a chat group ends and 
                        // when one begins.
                        // Also need to add tags to determine which message in a group is the start
                        // and which is the end
                        newMessages.unshift(change.doc.data())
                    }
                    if (change.type === 'modified') {
                        console.log("Modified message: ", change.doc.data().message_text)
                        // can't make changes to messages yet - I need to save the message Id to do this
                    }
                    if (change.type === 'removed') {
                        console.log("Deleted message: ", change.doc.data().message_text)
                        // I can follow what FB does and instead of deleting - change the text to 'deleted'
                    }
                })
                // console.log(newMessages)
                setMessages(oldMessages => {
                    return newMessages.concat(oldMessages)
                })
            })
            unsubRef.current = unsubscribe
        }
    }

    useEffect(() => {
        if (route.params.groups) {
            groupId.current = route.params.groups
        }
        getMessages()
        return () => {
            unsubRef.current && unsubRef.current()
        }
    }, [])

    useEffect(() => {
        generatedItems.current = generateItems(messages)
        setRenderMessages(generatedItems.current)
    }, [messages])

    // I need to render message groups?
    const renderItem = ({item}) => {
        if (item.type && item.type === 'day') {
            return <Day {...item} />
        }
        return <Message 
            currentUser={auth.currentUser.uid} 
            owner={item.owner} 
            message={item} 
            display={route.params.photoURL}
        />
    }

    return(
        // I need to add dividers for messages in different days
        <>
            {/* <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-200}> */}
            <FlatList  
                style={[{backgroundColor: 'white'}]}
                contentContainerStyle={{paddingTop: 20, padding: 10, marginTop: 50}}
                showsVerticalScrollIndicator={false}
                inverted
                data={renderMessages}
                extraData={renderMessages}
                renderItem={renderItem}
                ListEmptyComponent={<View><Text>Empty :(</Text></View>}
            >  
                <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginVertical: 5}}></View>
            </FlatList>
            {/* </KeyboardAvoidingView> */}

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
                        // autoFocus={true}
                        style={styles.inputStyle}
                    />
                </View>
                <TouchableOpacity
                    style={{paddingVertical: 5, paddingHorizontal: 7, borderRadius: 50, backgroundColor: '#c5c5c5'}}
                    activeOpacity={0.5}
                    disabled={message.length < 1}
                    onPress={() => sendMessage()}
                >
                    <MaterialIcons name="keyboard-arrow-right" size={12} color="black" />
                </TouchableOpacity>
            </View>
        </>
    )
}

const Day = (props) => {
    const temp = moment(new Date(props.date))
    const today = moment()
    let date

    if (temp.year() === today.year()) {
        // same year
        if (temp.month() === today.month()) {
            // same month
            if (temp.date() === today.date()) {
                // same day
                date = "Today"
            } else {
                if (today.date() - temp.date() === 1) {
                    date = "Yesterday"
                } else {
                    date = temp.format("dddd")
                }
            }
        } else {
            date = temp.format("MMM Do")
        }
    } else {
        date = temp.format("MM Do YYYY")
    }

    
    return(
        <View style={styles.date}>
            <Text style={{color: 'lightgrey'}}>{date}</Text>
        </View>
    )
}

const Message = ({ message, currentUser, owner, display}) => {
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

    // const [focused, setFocused] = useState(false)

    // const handleClick = () => {
    //     setFocused(!focused)
    // }

    return currentUser === owner ? (
        <View style={[styles.flexify, styles.spaceMsg]}>
            
            <View style={[styles.msgBg, {marginRight: 10}]} >
                <Text style={{fontWeight: "600", marginBottom: 5}}>
                    {message.message_text}
                </Text>
                <Text style={{ fontWeight: "600", textAlign: "right"}}>
                    {dateToTime(new Date(message.createdAt * 1000))}
                </Text>
            </View>
            <Avatar 
                rounded
                title="M"
                containerStyle={{backgroundColor: 'coral'}}
            />
        </View>
    ) : (
        <View style={[styles.flexify, styles.spaceMsg]}>
            <Avatar 
                placeholderStyle={{ opacity: 0 }}
                rounded
                source={{ uri: display}}
            />
            <View style={[styles.msgBg, {backgroundColor: '#c5c5c5', marginLeft: 10}]}>
                {/* <Text style={{fontWeight: "800", fontSize: 13, color: '#4c4c4c', textTransform: 'capitalize'}}>
                    Other Person
                </Text> */}
                <Text styles={{fontWeight: "600", marginBottom: 5}}>
                    {message.message_text}
                </Text>
                <Text style={{ fontWeight: "600" }}>
                    {dateToTime(new Date(message.createdAt * 1000))}
                </Text>
            </View>
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
        // flex: 1,
        backgroundColor: '#efefef',
        borderRadius: 20,
        padding: 10,
        // flex: 0, 
        alignSelf: 'flex-start', 
        maxWidth: "60%",
        marginLeft: 'auto'
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
    },
    date: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5
    }
})

export default ChatScreen;