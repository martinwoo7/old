import React, { useEffect, useState, useRef } from 'react'
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
    TouchableOpacity,
    TextInput,
    UIManager,
    LayoutAnimation,
} from 'react-native'
import { Avatar } from '@rneui/themed';
import moment from 'moment/moment';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import emulators from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Animated, { Layout, LightSpeedInLeft, LightSpeedInRight } from 'react-native-reanimated';

// TODO: Scrolling up past a certain point will retrieve more messages

if (Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

const storeData = async (key: string, value: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.log(error)
    }
    // console.log('Saved ',key, ' to async')
}

const ChatScreen = ({ navigation, route }) => {
    // console.log(route.params.to)
    return (
        <SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>
            <Header navigation={navigation} route={route} />
            <MessageContainer route={route} />
        </SafeAreaView>
    )
}

const Header = ({ navigation, route }) => (
    <View style={[styles.flexify, { paddingRight: "5%", paddingVertical: 5 }]}>
        <TouchableOpacity style={{ padding: 15 }} onPress={() => navigation.navigate("ChatList")} activeOpacity={0.5} >
            <MaterialIcons name="arrow-back" size={25} color="white" />
        </TouchableOpacity>

        <View style={[styles.flexify, { flex: 1, margin: 0 }]}>
            <View style={styles.flexify}>
                <Avatar size={36} rounded containerStyle={{ marginRight: 10 }} placeholderStyle={{ opacity: 0 }} source={{ uri: route.params.photoURL }} />
                <Text textBreakStrategy='simple' numberOfLines={1} style={{ fontWeight: "600", color: "white" }}>{route.params.to}</Text>
            </View>
            <View style={styles.flexify}>
                <TouchableOpacity activeOpacity={0.5} style={{ marginRight: 25 }}>
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
        let temp = (el.createdAt.seconds * 1000) + (el.createdAt.nanoseconds / 1000000)
        const messageDay = moment(temp).format('YYYY-MM-DD')
        if (acc[messageDay]) {
            return { ...acc, [messageDay]: acc[messageDay].concat([el]) }
        }
        return { ...acc, [messageDay]: [el] }
    }, {})
}

const generateItems = (messages) => {
    const days = groupedDays(messages)

    const sortedDays = Object.keys(days).sort(
        (x, y) => moment(y, 'YYYY-MM-DD').unix() - moment(x, 'YYYY-MM-DD').unix()
    )
    const items = sortedDays.reduce((acc, date) => {
        const sortedMessage = days[date].sort(
            // (x, y) => {new Date(y.createdAt) - new Date(x.createdAt)}
            (x, y) => y.date - x.date
        )
        return acc.concat([...sortedMessage, { type: 'day', date, id: date }])
    }, [])
    return items
}

// const temp = await AsyncStorage.getItem(groupId.current)

const MessageContainer = ({ route }) => {
    const db = emulators.firestore
    const auth = emulators.authentication

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [renderMessages, setRenderMessages] = useState([])

    const unsubRef = useRef(null)
    const groupId = useRef<string>(null)
    const generatedItems = useRef(null)
    const firstRender = useRef(true)

    const sendMessage = async () => {
        let receiverID = route.params.id
        let messageText = message
        let now = dateToTime(new Date())
        // let time = Timestamp.fromDate(new Date())
        let time = serverTimestamp()

        if (message.length > 1) {
            if (!groupId.current) {
                // if the groupId is still not set, it means a previous chat
                // didn't exist and we need to create a new collection

                // creating private chat
                console.log("Creating new group message")

                const newDocRef = collection(db, 'groups')
                const docRef = await addDoc(newDocRef, {
                    createdAt: time,
                    createdBy: auth.currentUser.uid,
                    from: auth.currentUser.displayName,
                    lastMessage: '',
                    lastSender: auth.currentUser.uid,
                    members: {
                        [auth.currentUser.uid]: true,
                        [receiverID]: true
                    },
                    modifiedAt: time,
                    name: route.params.to,
                    type: route.params.type // 1 is for private, 2 is group 
                })

                groupId.current = docRef.id
                console.log('Group id created: ', groupId.current)

                const q2 = query(
                    collection(db, 'groups', groupId.current, 'messages'),
                    orderBy('createdAt', 'asc'),
                    limit(50)
                )
                const unsubscribe = onSnapshot(q2, (snapshot) => {
                    const newMessages = []
                    snapshot.docChanges().forEach((change) => {
                        // let date = dateToTime(doc.data().createdAt.toDate())
                        if (change.type === 'added') {

                            // I need to add extra 'tags' here to identify when a chat group ends and 
                            // when one begins.
                            // Also need to add tags to determine which message in a group is the start
                            // and which is the end

                            // let temp = Object.assign({id: change.doc.id, date: date}, change.doc.data())
                            let temp = Object.assign({ id: change.doc.id }, change.doc.data())
                            newMessages.unshift(temp)
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
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    setMessages(oldMessages => {
                        let temp = newMessages.concat(oldMessages)
                        storeData(groupId.current, temp)
                        return temp
                    })
                })
                unsubRef.current = unsubscribe

            } else {
                console.log("group id already set", groupId.current)
            }

            try {
                console.log('saving message to db: ', messageText)
                await addDoc(collection(db, "groups", groupId.current, "messages"), {
                    owner: auth.currentUser.uid,
                    to: receiverID,
                    message_text: messageText,
                    createdAt: time,
                    date: now
                })
                    .then((msg) => {
                        console.log('Message sent successfully with id', msg.id)
                    })

                await updateDoc(doc(db, 'groups', groupId.current), {
                    modifiedAt: time,
                    lastMessage: messageText,
                    lastSender: auth.currentUser.uid
                })


            } catch (error) {
                Alert.alert('Message sending failed with error', error.message)
            }
            // getMessages()
        } else {
            Alert.alert('Chat not sent', 'Must be greater than 1 character');
        }
    }

    const getMessages = async () => {
        // console.log("Getting messages")
        // check if message to person already exists

        // Scenarios
        // 1. Enter new chat but didn't type yet - no groupId no route.params (from modal)
        // 2. Enter existing chat - route.params (from modal or chatlist)
        // 3. Just sent message and currently listening  - groupId

        if (route.params.groups || groupId.current) {
            groupId.current = route.params.groups ? route.params.groups : groupId.current
        }

        if (!groupId.current) {
            // User enters new chat from modal
            try {
                // Two scenarios 
                // 1. Private chat
                // 2. Group chat

                // Check if private chat exists - display those chats if it does
                // if the id param is a string as opposed to an array (for the group)
                if (typeof route.params.id === "string" || route.params.id instanceof String) {
                    let me = 'members.' + auth.currentUser.uid
                    let them = 'members.' + route.params.id

                    // check if a private chat already exists
                    const q = query(
                        collection(db, 'groups'),
                        where(me, "==", true),
                        where(them, "==", true),
                        where('type', '==', 1),
                    )
                    const querySnapshot = await getDocs(q)
                    let temp = []
                    querySnapshot.forEach((doc) => {
                        temp.push(doc.id)
                    })
                    // console.log(temp.length)
                    if (temp.length > 0) {
                        // Should only be 1 possible chat
                        console.log("Private chat exists! Retrieving")
                        groupId.current = temp[0]
                    } else if (temp.length === 0) {
                        // Doesn't exist or 
                        console.log("Private chat doesn't exist")
                    } else {
                        // Should never get here
                        console.log("WARNING - SOMETHING WENT WRONG - MULTIPLE OF SAME CHAT")
                    }
                } else {
                    // the id param is an array - it's a group chat
                    // I think I'll let them create multiple group chats with the same people
                    console.log("Creating group chat")
                }
            } catch (error) {
                console.log("Error in creating new chat: ", error)
            }
        }

        // Now we've taken care of the first scenario and also checked if users are
        // entering this screen from the private modal or group modal
        // 1. if we are entering from an existing chat in chatlist screen or 
        // 2. we just found an existing chat coming from the modal screen
        // 3. just created a new group after sending a message
        if (groupId.current) {
            const q2 = query(
                collection(db, 'groups', groupId.current, 'messages'),
                orderBy('createdAt', 'asc'),
                limit(50)
            )

            const unsubscribe = onSnapshot(q2, async (snapshot) => {
                // also need to load in the async items
                let temp = await AsyncStorage.getItem(groupId.current)
                if (temp !== null) {
                    // if it exists, we can start looking for repeats
                    let chats = JSON.parse(temp)

                    // check if this is the intial render
                    // TODO: ill have to change this when I implemented 'last_updated' timestamp
                    let newMessages = []
                    if (firstRender.current) {
                        // console.log('inital render')
                        snapshot.forEach((doc) => {
                            // let date = dateToTime(doc.data().createdAt.toDate())
                            // newMessages.unshift(Object.assign({id: doc.id, date: date}, doc.data()))
                            newMessages.unshift(Object.assign({ id: doc.id }, doc.data()))
                        })

                        // storeData(groupId.current, newMessages)
                        // setMessages(newMessages)
                        firstRender.current = false
                        storeData(groupId.current, newMessages)
                        setMessages(newMessages)

                    } else {
                        // subsequent renders
                        // console.log('subsequent render')
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                console.log("Added message: ", change.doc.data())
                                // let date = dateToTime(change.doc.data().createdAt.toDate())
                                let changedItem = Object.assign({ id: change.doc.id }, change.doc.data())
                                chats.unshift(changedItem)
                            }
                            if (change.type === 'modified') {
                                // console.log("item modified")
                                console.log("Modified message: ", change.doc.data())
                                // can't make changes to messages yet - I need to save the message Id to do this
                            }
                            if (change.type === 'removed') {
                                // console.log("item removed")
                                console.log("Deleted message: ", change.doc.data())
                                // I can follow what FB does and instead of deleting - change the text to 'deleted'
                            }

                        })
                        storeData(groupId.current, chats)
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                        setMessages(chats)
                    }


                } else {
                    // nothing saved - load everything from DB and then save 
                    // them into storage
                    let newMessages = []
                    snapshot.forEach((doc) => {
                        // let date = dateToTime(doc.data().createdAt.toDate())
                        newMessages.unshift(Object.assign({ id: doc.id }, doc.data()))
                    })
                    storeData(groupId.current, newMessages)
                    setMessages(newMessages)
                }
            })
            unsubRef.current = unsubscribe
        } else {
            // 1. Need to create private chat or group chat (but need to send messages first)
            // do we want to listen to the empty chat?
            // only thing is, if you get message while staring at an empty screen, you won't get the messages
            // console.log("Waiting to create private chat")
        }
    }

    const first = async () => {
        // console.log('first')
        if (route.params.groups) {
            groupId.current = route.params.groups
        }
        // await AsyncStorage.removeItem(groupId.current)
        // console.log(groupId.current)
        if (groupId.current) {
            let convoList = await AsyncStorage.getItem(groupId.current)
            if (convoList !== null) {
                let temp = JSON.parse(convoList)
                setMessages(temp)
            }
        }
    }

    useEffect(() => {

        first()
        getMessages()
        return () => {
            // console.log('removing listener')
            unsubRef.current && unsubRef.current()
        }
    }, [])

    useEffect(() => {
        generatedItems.current = generateItems(messages)
        setRenderMessages(generatedItems.current)
    }, [messages])

    // I need to render message groups?
    const renderItem = ({ item }) => {
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

    return (
        // I need to add dividers for messages in different days
        // <>
        // <ScrollView contentContainerStyle={{flex: 1}}>
        <View style={{ flex: 1 }}>
            {/* <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{flex: 1}}
            > */}
            <FlatList
                style={[styles.invert, { backgroundColor: 'white', height: '100%' }]}
                contentContainerStyle={[{ paddingTop: 80, padding: 10, marginBottom: 50 }]}
                showsVerticalScrollIndicator={false}
                data={renderMessages}
                extraData={renderMessages}
                renderItem={renderItem}
                // maxToRenderPerBatch={50}
                initialNumToRender={12}
                ListEmptyComponent={
                    <View style={[styles.invert, styles.date]}>
                        <Text style={{ color: 'lightgrey' }}>Say something :)</Text>
                    </View>
                }
                keyExtractor={item => item.id}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 5 }}></View>
            </FlatList>


            <View style={[styles.flexify, styles.positAtBottom, styles.shadow]}>
                {/* <TouchableOpacity style={{paddingVertical: 5, paddingHorizontal: 7, borderRadius: 50, backgroundColor: '#122643'}}>
                    <MaterialCommunityIcons name="plus" size={12} color="white" />
                </TouchableOpacity> */}

                <View style={{ flex: 1 }}>
                    <TextInput
                        placeholder="Message"
                        onChangeText={(text) => setMessage(text)}
                        value={message}
                        // autoFocus={true}
                        style={styles.inputStyle}
                        multiline={true}

                    />
                </View>
                <TouchableOpacity
                    style={{ paddingVertical: 5, paddingHorizontal: 7, borderRadius: 50 }}
                    activeOpacity={0.5}
                    disabled={message.length < 1}
                    onPress={() => {
                        setMessage('')
                        sendMessage()
                    }}
                >
                    <MaterialIcons name="send" style={{}} size={28} />

                </TouchableOpacity>
            </View>
            {/* </KeyboardAvoidingView> */}
            {/* </ScrollView> */}
        </View>
        // </>
    )
}

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

const Day = (props) => {
    const temp = moment(props.date)
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


    return (
        <View style={[styles.invert, styles.date]}>
            <Text style={{ color: 'lightgrey' }}>{date}</Text>
        </View>
    )
}

const Message = ({ message, currentUser, owner, display }) => {

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
        <View style={[styles.invert, styles.flexify, styles.spaceMsg]}>

            <View style={[styles.msgBg, { marginRight: 10 }]} >
                <Text style={{ fontWeight: "600", marginBottom: 5 }}>
                    {message.message_text}
                </Text>
                <Text style={{ fontWeight: "600", textAlign: "right" }}>
                    {/* {dateToTime(new Date(message.createdAt * 1000))} */}
                    {message.date}
                </Text>
            </View>
            <Avatar
                rounded
                title="M"
                containerStyle={{ backgroundColor: 'coral' }}
            />
        </View>
    ) : (
        <View style={[styles.invert, styles.flexify, styles.spaceMsg]}>
            <Avatar
                rounded
                // source={{ uri: display}}
                containerStyle={{ backgroundColor: 'lightpink' }}
                title="T"
            />
            <View style={[styles.msgBgR, { backgroundColor: 'aliceblue', marginLeft: 10 }]}>
                {/* <Text style={{fontWeight: "800", fontSize: 13, color: '#4c4c4c', textTransform: 'capitalize'}}>
                    Other Person
                </Text> */}
                <Text style={{ fontWeight: "600", marginBottom: 5 }}>
                    {message.message_text}
                </Text>
                <Text style={{ fontWeight: "600" }}>
                    {message.date}
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
        paddingVertical: 10,
        paddingHorizontal: 15,
        // flex: 0, 
        alignSelf: 'flex-start',
        maxWidth: "60%",
        marginLeft: 'auto'
    },
    msgBgR: {
        // flex: 1,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        // flex: 0, 
        alignSelf: 'flex-start',
        maxWidth: "60%",
        marginRight: 'auto'
    },
    spaceMsg: {
        alignItems: 'flex-end',
        marginVertical: 5,
    },
    positAtBottom: {
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.26,
        shadowRadius: 10,
        elevation: 12,
        backgroundColor: 'white',
    },
    date: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5
    },
    invert: {
        transform: [{ rotate: '180deg' }]
    },
    inputStyle: {
        backgroundColor: "lightgrey",
        borderRadius: 25,
        padding: 5,
        paddingHorizontal: 15,
    }
})

export default ChatScreen;