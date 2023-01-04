import React, { useEffect, useState } from "react";
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
} from 'react-native';
import emulators from "../firebase";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import SearchBar from "../Components/Search";
import FilterList from "../Components/FilterList";
// import GroupModal from "./ModalScreen";

import { getUserData } from "../utils/users";
import { Avatar } from "@rneui/themed";

// TODO: test with extra long displaynames
// TODO: implement search functionality
// TODO: animate the lengthening and shortening of search bar

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

const ChatList = ({ navigation }) => {
    const db = emulators.firestore
    const auth = emulators.authentication

    const [conv, setConv] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);

    


    const getConversations = async () => {
        let convo = []
        try {
            setLoading(true)
            
            // this user data needs to be saved in local storage maybe?
            // unless they don't charge for this
            const userData = await getUserData(auth.currentUser.uid)
            if (userData.groups.length > 0) {
                for (const group of userData.groups) {
                    const q = query(collection(db, 'message', group, 'messages'), orderBy('createdAt','desc'), limit(1))
                    const querySnapshot = await getDocs(q)
                    querySnapshot.forEach((doc) => {
                        convo.push({
                            groupId: group,
                            to: doc.data().to,
                            message_text: doc.data().message_text,
                            date: doc.data().createdAt,
                            photoURL: doc.data().photoURL,
                            displayName: doc.data().displayName,
                        })
                    })
                }
                convo.sort((a, b) => new Date(a.date * 1000) < new Date(b.date * 1000) ? 1 : -1)

                // console.log(convo)
                // const q = query(collection(db, 'group'), where('groupID','in', userData.groups), orderBy('modifiedAt', 'desc'))
                // const querySnapshot = await getDocs(q)
                // querySnapshot.forEach((doc) => {
                //     convo.push({
                //         groupId: groupID,
                //         to: doc.data().name,
                //         message_text: doc.data().message_text,
                //         date: doc.data().modifiedAt,
                //         photoURL: doc.data().photoURL,
                //         displayName: doc.data().displayName,
                //         lastMessage: doc.data().lastMessage,
                //     })
                // })
                return convo
            } else {
                console.log("user is not in any groups")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getPeople = async () => {
        let peep = []
        try {
            setLoading(true)
            const q = query(collection(db, "user"), where("uid", "!=", auth.currentUser.uid))
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach((doc) => {
                peep.push({
                    displayName: doc.data().displayName,
                    uid: doc.data().uid,
                    photoURL: doc.data().photoURL,
                })
            })
            return peep
            // return new Promise((resolve) => setTimeout(() => {resolve('result')}, 1000))
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        const doSomething = async () => {

            const peep = await getPeople()

            if (peep !== null) {
                setPeople(peep)
                setLoading(false)
            }
        }
        doSomething()
    },[])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            const convo = await getConversations()

            if (convo !== null) {
                setConv(convo)
                setLoading(false)     
            }
        })
        return unsubscribe
    }, [navigation])

    
    const renderItem = ( {item} ) => {
        return (
            <TouchableOpacity 
                onLongPress={() => {console.log("long pressed!")}} 
                style={styles.item}
                onPress={()=>{navigation.navigate('ChatScreen', {to: item.displayName, id: item.to, photoURL: item.photoURL, groups: item.groupId, type: 1})}}
            >
                <View style={styles.row}>
                    {/* <MaterialIcons name="person" size={70} style={styles.dp}/> */}
                    <Avatar size={64} containerStyle={{marginRight: 10}} rounded placeholderStyle={{ opacity: 0 }} source={{uri: item.photoURL}}/>
                    <View style={{flexDirection: "column", width:"100%"}}>
                        <Text style={{fontWeight: "600", maxWidth: "100%", fontSize: 18}} numberOfLines={1}>{item.displayName}</Text>
                        <View style={{flexDirection: "row"}}>
                            <Text numberOfLines={1} style={{flex: 0, alignSelf: "flex-start", maxWidth: "60%"}}>{item.message_text} </Text>
                            <Text style={{}}>{`\u2022 ${timeAgo(new Date(item.date.seconds*1000).getTime())}`}</Text>
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
            <View style={[styles.list, {paddingTop: 20}]}><ActivityIndicator size="large" /></View> : 
            <View style={styles.list}>
                {conv && conv.length > 0 ? 
                <FlatList 
                    data={conv}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                /> : 
                <Text style={styles.noChats} >
                    No chats active :(
                </Text>
                }
            </View>}
            
            
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
    }
})
export default ChatList;
