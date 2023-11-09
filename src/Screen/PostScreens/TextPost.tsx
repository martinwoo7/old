import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useScrollToTop } from "@react-navigation/native";

import EvilIcons from "react-native-vector-icons/EvilIcons";

import { MessageComponent } from "../../Components/Post";
import TagComponent from "../../Components/TagComponent";

const TextPost = ({
    navigation,
    tags,
    setTags,
    content,
    setContent,
    handlePost,
}) => {
    const [disabled, setDisabled] = useState(true);

    const ref = useRef(null);
    useScrollToTop(ref);

    useEffect(() => {
        const unsubscribe = navigation.addListener("tabPress", (e) => {
            // close the screen
            // e.preventDefault()
            // let name = e.target.split("-")[0]
            // console.log(name)
            // navigation.jumpTo(name, {content: content, tags: tags})
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (content === "") {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [content]);

    const dummyData = {
        comment: 0,
        content: content,
        // createdAt: { nanoseconds: 522000000, seconds: 1677872426 },
        // createdBy: "adfsaf2234",
        // id: "iOrcvcdh6LTKzfOOuuN6",
        images: [],
        likes: 1,
        name: "Jenny Jenn",
        type: 0,
        verb: "shouted",
        video: [],
    };

    return (
        <>
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
                        onPress={() => handlePost(0, [], [])}
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
                            type={0}
                            navigation={navigation}
                            tags={tags}
                            new
                        />
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

            {/* <View >
            <View style={{flexDirection: 'row', backgroundColor: "#202225", paddingVertical: 10}}>
                {Objects.map((item, index) => {
                    
                    const isFocused = state === index;
                    const onPress = () => {
                        // console.log("changing to ", item.name, " content")
                        if (!isFocused) {
                            if (images.length > 0 || video) {
                                Alert.alert(
                                    'Changing Post Type',
                                    'Navigating away will remove all attachments',
                                    [
                                        
                                        {
                                            text: 'Cancel',
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Continue',
                                            style: 'destructive',
                                            onPress: () => {                         
                                                setImages([])
                                                setVideo('')
                                                setState(index)
                                            }
                                        },
                                    ],
                                    {
                                        cancelable: true,
                                    }
                                )
                            } else {
                                setState(index)
                            }
                        }
                    }

                    return (
                        <Pressable
                        onPress={onPress}
                        style={{flex: 1, alignItems: 'center'}}
                        key={item.name}
                        >
                            <Icon name={item.name} size={ICON_SIZE} color={isFocused ? 'orange' : 'lightgrey'} />
                        </Pressable>
                    )
                })}
            </View>
        </View> */}
        </>
    );
};

export default TextPost;

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
});
