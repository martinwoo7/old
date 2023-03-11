import React, { useState } from "react";
import { Alert } from 'react-native'
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import TextPost from "./PostScreens/TextPost";
import ImgPost from "./PostScreens/ImgPost";
import VidPost from "./PostScreens/VidPost";
import PollsPost from "./PostScreens/PollsPost";
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
    writeBatch
} from 'firebase/firestore';
import emulators from "../firebase";

const PostNavigation = createBottomTabNavigator()

const NewPost = ({ navigation }) => {

    const db = emulators.firestore
    const auth = emulators.authentication

    const [tags, setTags] = useState([])
    const [content, setContent] = useState('')

    const createCounter = (ref, numShards) => {
        const batch = writeBatch(db)
        batch.set(ref, { numShards: numShards });
        for (let i = 0; i < numShards; i++) {
            const shardRef = doc(ref, 'shards', i.toString())
            const likeRef = doc(ref, 'likes', i.toString())
            batch.set(shardRef, { count: 0})
            batch.set(likeRef, { count: 0})
        }
        return batch.commit()
    }

    const handlePost = async (type: number, images, video) => {
        // handle backend posting here
        console.log("Handle Post: ", tags, content)
        let verb = null
        switch (type) {
            case 0:
                verb = "shouted"
                break;
            case 1:
                verb = "posted a picture"
                break;
            case 2:
                verb = "shared a video"
                break;
            case 3:
                verb = "asked a question"
                break;
        }

        // also need to handle saving images and video to storage
        // use those references as the data for adding to the post
        // const newPostRef = collection(db, 'posts')
    
        await addDoc(collection(db, "posts"), {
            comment: 0,
            content: content,
            createdAt: Timestamp.fromDate(new Date()),
            createdBy: auth.currentUser.uid,
            likes: 1,
            name: auth.currentUser.displayName,
            score: 0,
            type: type,
            verb: verb,
            images: images,
            video: video,
            tags: tags,

        }).then((result) => {
            console.log('Post successfully created with id', result.id)
            const ref = doc(db, "counters", result.id)
            createCounter(ref, 10)
            
            navigation.goBack()
        })

    }

    return (
        <PostNavigation.Navigator
            initialRouteName="TextPost"
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: "orange",
                tabBarStyle: {
                    backgroundColor: '#202225'
                }

            }}

        >
            <PostNavigation.Screen
                name="TextPost"
                // component={TextPost}
                children={() => <TextPost navigation={navigation} tags={tags} setTags={setTags} content={content} setContent={setContent} handlePost={handlePost} />}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (<Icon name="text" color={color} size={size} />)
                }}
            // initialParams={{
            //     content: '',
            //     tags: []
            // }}
            />
            <PostNavigation.Screen
                name="ImgPost"
                // component={ImgPost}
                children={() => <ImgPost navigation={navigation} tags={tags} setTags={setTags} content={content} setContent={setContent} handlePost={handlePost} />}

                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (<Icon name="file-image-outline" color={color} size={size} />)
                }}
            // initialParams={{
            //     content: '',
            //     tags: []
            // }}
            />
            <PostNavigation.Screen
                name="VidPost"
                // component={VidPost}
                children={() => <VidPost navigation={navigation} tags={tags} setTags={setTags} content={content} setContent={setContent} handlePost={handlePost} />}

                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (<Icon name="file-video-outline" color={color} size={size} />)
                }}
            // initialParams={{
            //     content: '',
            //     tags: []
            // }}
            />
            <PostNavigation.Screen
                name="PollsPost"
                // component={PollsPost}
                children={() => <PollsPost navigation={navigation} tags={tags} setTags={setTags} content={content} setContent={setContent} handlePost={handlePost} />}

                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (<Icon name="poll" color={color} size={size} />)
                }}
            // initialParams={{
            //     content: '',
            //     tags: []
            // }}
            />
        </PostNavigation.Navigator>
    )
}

export default NewPost;