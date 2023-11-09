import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useScrollToTop } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Video from "react-native-video";

import EvilIcons from "react-native-vector-icons/EvilIcons";
import AntDesign from "react-native-vector-icons/AntDesign";

import { MessageComponent } from "../../Components/Post";
import TagComponent from "../../Components/TagComponent";

import { nanoid } from "nanoid/non-secure";

const VidPost = ({
    navigation,
    tags,
    setTags,
    content,
    setContent,
    handlePost,
}) => {
    const [video, setVideo] = useState(null);
    const [disabled, setDisabled] = useState(true);

    const ref = useRef(null);
    useScrollToTop(ref);

    const videoRef = useRef(null);
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            const changedResult = result.assets.map((element) => {
                const key = nanoid(5);
                return { ...element, key: key };
            });
            // setImage((old) => [...old, result.assets])
            // setVideo(changedResult)
            console.log("video load cancelled");
        }
    };

    useEffect(() => {
        if (content === "") {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [content]);

    const dummyData = {
        likes: 0,
        comments: 0,
        name: "Jimmy",
        verb: "shouted",
        content: content,
        images: null,
        video: null,
        createdAt: new Date(2022, 11, 30, 5, 16),
    };
    return (
        <SafeAreaView style={[styles.container]}>
            <View
                style={{
                    flexDirection: "row",
                    marginTop: 10,
                    alignItems: "center",
                }}
            >
                <Pressable onPress={() => navigation.goBack()}>
                    <EvilIcons name="close" size={36} color="lightgrey" />
                </Pressable>
                {/* <Text style={{color:'lightgrey', fontSize: 24, marginLeft: 15}}>New Post</Text> */}
                <Pressable
                    disabled={disabled}
                    onPress={handlePost}
                    style={{
                        alignItems: "center",
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        borderRadius: 25,
                        marginLeft: "auto",
                        backgroundColor: disabled ? "#D1B58A" : "orange",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            color: disabled ? "grey" : "white",
                        }}
                    >
                        Post
                    </Text>
                </Pressable>
            </View>
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                enableOnAndroid
                extraHeight={75}
                ref={ref}
                style={{ marginTop: 10 }}
                keyboardShouldPersistTaps="handled"
            >
                <Text
                    style={{
                        color: "lightgrey",
                        fontSize: 24,
                        marginBottom: 5,
                    }}
                >
                    Preview:
                </Text>

                {/* render content here */}
                <View style={{ flex: 1 }}>
                    <MessageComponent
                        enabled={false}
                        data={dummyData}
                        type={2}
                        navigation={navigation}
                        tags={tags}
                        new
                    />

                    <View style={{ marginTop: 10 }}>
                        {video ? (
                            <Video
                                source={{ uri: video.uri }}
                                // ref={(ref) => {videoRef.value = ref}}
                            />
                        ) : (
                            <Pressable
                                onPress={pickImage}
                                style={styles.imageContainer}
                            >
                                <AntDesign
                                    name="plus"
                                    size={42}
                                    color="lightgrey"
                                />
                            </Pressable>
                        )}
                    </View>

                    <Text style={[styles.header]}>Content:</Text>
                    <TextInput
                        multiline
                        style={{ color: "lightgrey" }}
                        placeholderTextColor="lightgrey"
                        placeholder="Add interesting content here"
                        value={content}
                        onChangeText={(input) => {
                            setContent((old) => input);
                        }}
                    />
                    <Text
                        style={[
                            styles.header,
                            { marginTop: 50, marginBottom: 5 },
                        ]}
                    >
                        Tags:
                    </Text>

                    <TagComponent tags={tags} setTags={setTags} />
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default VidPost;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: "5%",
        flex: 1,
    },
    header: {
        color: "lightgrey",
        fontSize: 24,
        marginTop: 20,
    },
    imageContainer: {
        width: 100,
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "lightgrey",
        borderStyle: "dashed",
        borderRadius: 1,
    },
});
