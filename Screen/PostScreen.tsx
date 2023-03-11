import React, { useEffect, useRef, useState } from "react";
import {
    Pressable,
    Text,
    View,
    StyleSheet,
    StatusBar,
    Platform,
    FlatList,
} from "react-native";
import { MessageComponent } from "../Components/Post";
import { SafeAreaView } from "react-native-safe-area-context";

import { useInternal } from "../Hooks/useInternal";
import { CONTEXT_MENU_STATE, ICON_SIZE } from "../constants";
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { TapGestureHandler, TextInput } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Avatar } from "@rneui/themed";
import Comment from "../Components/Comment";
import emulators from "../firebase";
import moment from 'moment/moment';
import { collection, query, getDocs, onSnapshot, orderBy, where, limit, writeBatch, doc } from "firebase/firestore";
import Modal from "react-native-modal";

// might have to find a way to speed up the fetching from server.
// Not sure how this current method will scale with larger comments


const createDataTree = (dataset) => {
    const hashTable = Object.create(null);
    dataset.forEach(aData => hashTable[aData.id] = { ...aData, childNodes: [] });
    const dataTree = [];
    dataset.forEach(aData => {
        if (aData.parent) hashTable[aData.parent].childNodes.push(hashTable[aData.id])
        else dataTree.push(hashTable[aData.id])
    });
    return dataTree;
};


const PostScreen = ({ navigation, route }) => {
    const data = route.params.data
    const db = emulators.firestore
    const auth = emulators.authentication

    const firstRender = useRef(true)
    const unsubRef = useRef(null)

    const [comments, setComments] = useState([])
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {

        const getMessages = async () => {
            const q = query(
                collection(db, 'posts', data.id, 'comments'),
                where('postId', '==', data.id),
                // limit(50)
            )

            let temp = []
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (firstRender.current) {
                    snapshot.forEach((doc) => {
                        let item = Object.assign({ id: doc.id }, doc.data())
                        temp.push(item)
                    })
                    firstRender.current = false
                    const result = createDataTree(temp)
                    setComments(result)
                }
                // else {
                //     snapshot.docChanges().forEach((change) => {
                //         if (change.type === 'added') {
                //             let item = Object.assign({ id: change.doc.id }, change.doc.data())
                //             temp.push(item)
                //         }
                //         const result = createDataTree(temp)
                //         setComments(result)
                //     })
                // }
            })
            unsubRef.current = unsubscribe
        }
        getMessages()

        return () => {
            unsubRef.current && unsubRef.current()
        }
    }, [navigation])


    const RecursiveComponent = ({ data }) => {
        const toggleExpand = () => {
            console.log("Toggled expand")
        }
        return (
            <View style={{ marginLeft: 10, borderLeftWidth: 1, borderLeftColor: 'red' }}>
                {data.map((parent) => {
                    const letter = Array.from(parent.name)[0]
                    return (
                        <Pressable
                            style={{ backgroundColor: 'aliceblue', marginTop: 10, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10 }}
                            onPress={toggleExpand}
                            key={parent.id}
                        >

                            <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                <Avatar size={28} rounded containerStyle={{ backgroundColor: 'coral', marginRight: 5 }} title={letter} />
                                <Pressable>
                                    <Text>{parent.name}</Text>
                                </Pressable>
                                <Text style={{ marginLeft: 10 }}>{moment(parent.createdAt.toDate()).fromNow()}</Text>
                            </View>

                            <Text>{parent.content}</Text>

                            <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-around', marginTop: 10 }}>
                                <Pressable>
                                    <Text>Heart</Text>
                                </Pressable>
                                <Pressable onPress={() => navigation.navigate("CommentScreen", { postId: data.id, parentId: parent.id, replyContent: parent.content })}>
                                    <Text>Reply</Text>
                                </Pressable>
                                <Pressable>
                                    <Text>Menu</Text>
                                </Pressable>
                            </View>

                            {parent.childNodes && <RecursiveComponent data={parent.childNodes} />}

                        </Pressable>
                    )
                })}
            </View>
        )
    }

    const renderItem = ({ item }) => {
        const letter = Array.from(data.name)[0]
        const toggleExpand = () => {
            console.log("Toggled expand")
        }
        return (

            <Pressable
                style={{ backgroundColor: 'aliceblue', marginTop: 10, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10 }}
                onPress={toggleExpand}
            >

                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <Avatar size={28} rounded containerStyle={{ backgroundColor: 'coral', marginRight: 5 }} title={letter} />
                    <Pressable>
                        <Text>{item.name}</Text>
                    </Pressable>
                    <Text style={{ marginLeft: 10 }}>{moment(item.createdAt.toDate()).fromNow()}</Text>
                </View>

                <Text>{item.content}</Text>

                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-around', marginTop: 10 }}>
                    <Pressable>
                        <Text>Heart</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate("CommentScreen", { postId: data.id, parentId: item.id, replyContent: item.content })}>
                        <Text>Reply</Text>
                    </Pressable>
                    <Pressable>
                        <Text>Menu</Text>
                    </Pressable>
                </View>

                {item.childNodes && <RecursiveComponent data={item.childNodes} />}


            </Pressable>

        )
    }


    const Empty = () => {
        return (
            <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text style={{ color: "silver" }}>There's nothing here :(</Text>
            </View>

        )
    }
    return (
        <>
            <SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>

                <View style={{ marginBottom: 10, paddingTop: 20, flexDirection: 'row' }}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" color={'lightgrey'} size={ICON_SIZE} />
                    </Pressable>
                    <Pressable style={{ marginLeft: 'auto', marginRight: 20 }} onPress={() => setModalVisible(true)}>
                        <MaterialCommunityIcons name="filter-variant" color={'lightgrey'} size={ICON_SIZE} />
                    </Pressable>
                    <Pressable style={{ marginRight: 20 }}>
                        <MaterialCommunityIcons name="dots-vertical" color={'lightgrey'} size={ICON_SIZE} />
                    </Pressable>

                </View>

                <MessageComponent data={data} enabled={false} navigation={navigation} state={null} tags={data.tags} />
                <FlatList
                    data={comments}
                    renderItem={renderItem}
                    ListEmptyComponent={Empty}
                    style={{marginTop: 15}}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 10}}
                />

            </SafeAreaView>

            <View style={{ backgroundColor: "#202225", paddingHorizontal: 10, paddingVertical: 10 }}>
                <Pressable onPress={() => navigation.navigate("CommentScreen", { postId: data.id, parentId: data.id, replyContent: data.content })}>
                    <Text style={{ color: "lightgrey", paddingVertical: 10, backgroundColor: 'aliceblue', borderRadius: 12, paddingLeft: 10}}>
                        Add a comment
                    </Text>
                </Pressable>
            </View>

            <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} useNativeDriver>
                <View style={{ backgroundColor: 'aliceblue', borderRadius: 8, paddingHorizontal: 15, paddingBottom: 10}}>
                    
                    <Text style={{ borderBottomColor: 'silver', borderBottomWidth: 1, marginBottom: 10, paddingVertical: 10, color: "darkgrey"}}>Sort comments by</Text>
                    
                    <Pressable style={{ flexDirection: 'row', alignItems: "center", marginVertical: 10}}>
                        <MaterialCommunityIcons name="trending-up" size={24} color="darkgrey" />
                        <Text style={[styles.sortItems]}>Trending</Text>
                    </Pressable>

                    <Pressable style={{ flexDirection: 'row', alignItems: "center", marginVertical: 10}}>
                        <MaterialIcons name="bar-chart" size={24} color="darkgrey" />
                        <Text style={[styles.sortItems]}>Top</Text>
                    </Pressable>

                    <Pressable style={{ flexDirection: 'row', alignItems: "center", marginVertical: 10}}>
                        <MaterialCommunityIcons name="decagram-outline" size={24} color="darkgrey" />
                        <Text style={[styles.sortItems]}>New</Text>
                    </Pressable>

                    <Pressable style={{ flexDirection: 'row', alignItems: "center",marginVertical: 10}}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color="darkgrey" />
                        <Text style={[styles.sortItems]}>Old</Text>
                    </Pressable>
                </View>
            </Modal>
        </>
    )
}

export default PostScreen

const styles = StyleSheet.create({
    AndroidSafeArea: {
        // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,

    },
    container: {
        marginHorizontal: 10,
        flex: 1,
    },
    sortItems: {
        color: 'darkgrey', 
        marginLeft: 10,
        // marginTop: 20
    }
})

