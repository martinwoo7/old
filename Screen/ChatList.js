import React, { useEffect, useState, useRef } from "react";
import {
    collection,
    setDoc,
    doc,
    query,
    getDoc,
    limit,
    onSnapshot,
    orderBy,
    getDocs,
    where,
    Timestamp,
} from 'firebase/firestore';
import {
    View,
    StyleSheet,
    FlatList,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Platform,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import emulators from "../firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import SearchBar from "../Components/Search";

import { getUserData } from "../utils/users";
import { Avatar } from "@rneui/themed";

// TODO: test with extra long displaynames
// TODO: animate the lengthening and shortening of search bar

const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.log(error)
    }
    // console.log('Saved ',key, ' to async')
}

const timeAgo = (date) => {
    let seconds = Math.floor((new Date().getTime() - date) / 1000)
    let interval = seconds / 31536000

    if (interval > 1) {
        return Math.floor(interval) + 'yr'
    }
    interval = seconds / 2592000
    if (interval > 1) {
        return Math.floor(interval) + 'mo'
    }
    interval = seconds / 86400
    if (interval > 1) {
        return Math.floor(interval) + 'd'
    }
    interval = seconds / 3600
    if (interval > 1) {
        return Math.floor(interval) + 'h'
    }
    interval = seconds / 60
    if (interval > 1) {
        return Math.floor(interval) + 'm'
    }
    return Math.floor(seconds) + 's'
}

const objectsEqual = (ob1, ob2) => {
    Object.keys(ob1).length === Object.keys(ob2).length && Object.keys(ob1).every(p => ob1[p] === ob2[p])
}

const ChatList = ({ navigation }) => {
    const db = emulators.firestore
    const auth = emulators.authentication

    const [conv, setConv] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false)

    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);

    const firstFire = useRef(true)
    const unsubRef = useRef()
    // const test = Timestamp.fromDate(new Date(2020, 12))

    const getPeople = async () => {
        const peep = []
        try {
            const q = query(collection(db, "user"), where("uid", "!=", auth.currentUser.uid))
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach((doc) => {
                peep.push({
                    displayName: doc.data().displayName,
                    uid: doc.data().uid,
                    photoURL: doc.data().photoURL,
                })
            })
            storeData('people_list', peep)
            return peep
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        let lastFetchTimestamp
        setLoading(true)

        const doSomething = async () => {
            let peopleList 
            try {
                peopleList = await AsyncStorage.getItem('people_list')
                if (peopleList === null) {
                    peopleList = await getPeople()
                    // console.log("people list not in async")
                } else {
                    peopleList = JSON.parse(peopleList)
                    // console.log("people list in async retrieved")
                }
                setPeople(peopleList)


                // await AsyncStorage.removeItem('last_fetch')
                // await AsyncStorage.removeItem('conversations')
                lastFetchTimestamp = await AsyncStorage.getItem('last_fetch')
                if (lastFetchTimestamp === null) {
                    lastFetchTimestamp = Timestamp.fromDate(new Date(2020, 11))
                } else {
                    lastFetchTimestamp = JSON.parse(lastFetchTimestamp)
                    let temp = (lastFetchTimestamp.seconds * 1000) + (lastFetchTimestamp.nanoseconds / 1000000)
                    lastFetchTimestamp = Timestamp.fromDate(new Date(temp))
                }
                console.log('last fetch from ', lastFetchTimestamp.toDate())
                
                let q = query(
                    collection(db, 'group'), 
                    where('members','array-contains', auth.currentUser.uid),
                    where('modifiedAt', '>', lastFetchTimestamp),
                    orderBy('modifiedAt', 'desc'),
                    limit(25)
                )

                const unsub = onSnapshot(q, async (querySnapshot) => {
                    const temp = await AsyncStorage.getItem('conversations')
                    let time = Timestamp.fromDate(new Date())
                    // let time = Timestamp.fromDate(new Date(2020, 11))
                    
                    const newMessages = []                 
                    if (temp === null) {
                        // if nothing is saved means first open of app or data deleted
                        // either way - get the entire list of conversations
                        querySnapshot.forEach((doc) => {
                            newMessages.push({
                                groupId: doc.id,
                                lastMessage: doc.data().lastMessage,
                                lastSender: doc.data().lastSender,
                                name: doc.data().name,
                                modifiedAt: doc.data().modifiedAt,
                                type: doc.data().type,
                                members: doc.data().members,
                            })
                        })
                        storeData('conversations', newMessages)
                        storeData('last_fetch', time)
                        setConv(newMessages)
                    } else {
                        console.log("conversations in async retrieved")
                        // There is something saved so 
                        // 1. use the async data as initial list
                        // 2. subsequent updates 
        
                        let oldMessages = JSON.parse(temp)
                        if (firstFire.current) {
                            // if this is the initial render
                            
                            querySnapshot.forEach((doc) => {
                                const temp = 
                                    {
                                        groupId: doc.id,
                                        lastMessage: doc.data().lastMessage,
                                        lastSender: doc.data().lastSender,
                                        name: doc.data().name,
                                        modifiedAt: doc.data().modifiedAt,
                                        type: doc.data().type,
                                        members: doc.data().members,
                                    }
                                
                                const found = oldMessages.find(item => item.groupId === temp.groupId)
                                if (found) {
                                    // id already exists in oldMessages
                                    // check if time modified is the same
                                    if (!objectsEqual(found, temp)) {
                                        // objects are not equal, so replace old with new one
                                        oldMessages = oldMessages.filter(item => item.groupId !== found.groupId)
                                        oldMessages.push(temp)
                                    }
                                    
                                } else {
                                    // id doesn't exist, so just add it
                                    oldMessages.push(temp)
                                }
                                // It shouldn't be possible to delete a chat without being in the app, so we won't account for that
                            })
                            oldMessages.sort((a,b) => (b.modifiedAt.seconds - a.modifiedAt.seconds))
                            storeData('conversations', oldMessages)
                            storeData('last_fetch', time)
                            setConv(oldMessages)
                            firstFire.current = false
        
                        } else {
                            // subsequent renders should only have 1 update at a time
                            querySnapshot.docChanges().forEach((change) => {
                                if (change.type === "added") {
                                    console.log("New changes added in chatList: ", change.doc.data())
                                    const found = oldMessages.some(item => item.groupId === change.doc.id)
                                    if (!found) {
                                        oldMessages.unshift({
                                            groupId: change.doc.id,
                                            lastMessage: change.doc.data().lastMessage,
                                            lastSender: change.doc.data().lastSender,
                                            name: change.doc.data().name,
                                            modifiedAt: change.doc.data().modifiedAt,
                                            type: change.doc.data().type,
                                            members: change.doc.data().members,
                                        })
                                    } else {
                                        let temp = {
                                            groupId: change.doc.id,
                                            lastMessage: change.doc.data().lastMessage,
                                            lastSender: change.doc.data().lastSender,
                                            name: change.doc.data().name,
                                            modifiedAt: change.doc.data().modifiedAt,
                                            type: change.doc.data().type,
                                            members: change.doc.data().members,
                                        }
                                        if (!objectsEqual(found, temp)) {
                                            // objects are not equal, so replace old with new one
                                            oldMessages = oldMessages.filter(item => item.groupId !== found.groupId)
                                            oldMessages.push(temp)
                                        }
                                        else {
                                            // they're equal so skip
                                            console.log("Already exists - skipping")
                                        }
                                        
                                    }
                                    
                                }
        
                                if (change.type === "modified") {
                                    console.log("Item modified in chatList: ", change.doc.data())
                
                                    oldMessages = oldMessages.map((c, i) => {
                                        if (c.groupId === change.doc.id) {
                                            return {
                                                groupId: change.doc.id,
                                                lastMessage: change.doc.data().lastMessage,
                                                lastSender: change.doc.data().lastSender,
                                                name: change.doc.data().name,
                                                modifiedAt: change.doc.data().modifiedAt,
                                                type: change.doc.data().type,
                                                members: change.doc.data().members,
                                            }
                                        } else {
                                            return c
                                        }
                                    })                        
                                }
        
                                if (change.type === 'removed') {
                                    console.log("Item removed from chatList: ", change.doc.data())
                                    oldMessages = oldMessages.filter(item => item.groupId !== change.doc.id)
                                }
                                // oldMessages.sort((a,b) => (b.modifiedAt.seconds -a.modifiedAt.seconds ))
                                storeData('conversations', oldMessages)
                                storeData('last_fetch', time)
                                setConv(oldMessages)
                            })
                        }
                    }
                })
                unsubRef.current = unsub
                
            } catch (error) {
                console.log(error)
            } 
        }     
        
        doSomething()
        setLoading(false)

        return () => {
            unsubRef.current && unsubRef.current()
        }

    }, [])
    
    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout))
    }

    const onRefresh = (() => {
        setRefreshing(true)
        wait(1000).then(() => setRefreshing(false))
    })

    const renderItem = ( {item} ) => {
        let text = item.lastMessage
        if (item.lastSender === auth.currentUser.uid) {
            text = 'Me: ' + text
        }

        let otherId
        if (item.type === 1) {

            otherId = item.members.find((id) => {
                return id !== auth.currentUser.uid
            })
        } else {
            otherId = null
        }

        let profile_picture
        if (otherId) {
            profile_picture = people.find(({uid}) => {
                return uid === otherId
            })
        } else {
            // group chat
            profile_picture = [{
                photoURL: "none"
            }]
        }

        return (
            <TouchableOpacity 
                onLongPress={() => {console.log("long pressed!")}} 
                style={styles.item}
                onPress={()=>{navigation.navigate('ChatScreen', {to: item.name, id: otherId, photoURL: profile_picture.photoURL, groups: item.groupId, type: item.type})}}
            >
                <View style={styles.row}>
                    {/* set this to group icon if group */}
                    {/* <MaterialIcons name="person" size={70} style={styles.dp}/> */}
                    <Avatar size={64} containerStyle={{marginRight: 10}} rounded placeholderStyle={{ opacity: 0 }} source={{uri: profile_picture.photoURL}}/>
                    <View style={{flexDirection: "column", width:"100%"}}>
                        <Text style={{fontWeight: "600", maxWidth: "100%", fontSize: 18}} numberOfLines={1}>{item.name}</Text>
                        <View style={{flexDirection: "row"}}>
                            <Text numberOfLines={1} style={{flex: 0, alignSelf: "flex-start", maxWidth: "60%"}}>{text} </Text>
                            <Text style={{}}>{`\u2022 ${timeAgo(new Date(item.modifiedAt.seconds*1000).getTime())}`}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>
            <View style={styles.top}>
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.button} onPress={() => {console.log("3 buttons pressed")}}>
                        <MaterialIcons name="menu" size={18} />
                    </TouchableOpacity>
                    
                    <Text style={{fontWeight: "bold", fontSize: 22}}>
                        Chats
                    </Text>
                    <TouchableOpacity onPress={()=>{navigation.navigate('Modal', {data: people})}} style={styles.button} >
                        <MaterialIcons name="edit" size={18} />
                    </TouchableOpacity>
                    
                </View>
                
                <SearchBar 
                    searchPhrase={searchPhrase}
                    setSearchPhrase={setSearchPhrase}
                    clicked={clicked}
                    setClicked={setClicked}
                />

            </View>
            {loading ?
                <View style={styles.loading}><ActivityIndicator size="large" /></View> :
                <View style={styles.list}>          
                    {conv && conv.length > 0 ? 
                    <FlatList 
                        data={conv}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                    /> : 
                    <Text style={styles.noChats} >
                        No chats active :(
                    </Text>
                    }
                    
                </View>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    top: {
        margin: 0,
        padding: 0,
        alignItems: 'center',
    },
    container: {
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        flex: 1,
    },
    item: {
        alignSelf: "center",
        paddingVertical: 10,
        width: '90%',
        // backgroundColor: "red"
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    AndroidSafeArea: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
    topBar: {
        flexDirection: "row", 
        paddingVertical: 10, 
        alignItems: "center",
        justifyContent: "space-between",
        // backgroundColor: "aliceblue",
        width: "90%",
    },
    list: {
        flex: 1,
        // backgroundColor: 'aliceblue'
    },
    button: {
        backgroundColor: 'lightgrey',
        padding: 6,
        borderRadius: 25,
    },
    noChats: {
        color: 'lightgrey',
        // alignContent: 'center'
        // justifyContent: 'center',
        // backgroundColor: 'red',
        textAlign: 'center',
        marginTop: 15,
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
export default ChatList;
