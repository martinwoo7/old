import React, { useEffect, useState } from "react";
import {  
    View, 
    TextInput, 
    StyleSheet, 
    Text, 
    FlatList, 
    TouchableOpacity,
    StatusBar,
    Platform,
    SafeAreaView
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Avatar } from "@rneui/themed";
// import FilterList from "../Components/FilterList";
import SearchBar from "../Components/Search";

// check if the chat already exists, if it is, then redirect to existing chat
const Item = ({ displayName, photoURL, id, navigation, groups}) => {
    return (
        <TouchableOpacity 
            style={styles.item}
            onPress={()=>{
                navigation.navigate('ChatScreen', {to: displayName, id: id, photoURL: photoURL, groups: groups, type: 1})
            }}
        >
            <Avatar size={64} containerStyle={{marginRight: 10}} rounded placeholderStyle={{ opacity: 0 }} source={{uri: photoURL}}/>
            <Text style={{fontWeight: '600', fontSize: 18}}>{displayName}</Text>
        </TouchableOpacity>
    )
} 

const ListEmpty = () => (
    <View>
        <Text style={{color:'lightgrey', textAlign:'center', marginTop: 10}}>
            No available contacts :(
        </Text>
    </View>
)

const NewChatScreen = ({ navigation, route}) => {
    const data = route.params.data
    // console.log(data)
    const [searchPhrase, setSearchPhrase] = useState('')
    const [clicked, setClicked] = useState(false)

    const renderItem = ({item}) => {
        if (searchPhrase === '') {

            return <Item displayName={item.displayName} photoURL={item.photoURL} id={item.uid} navigation={navigation} groups={item.groups}/>
        }

        // filter
        if (item.displayName.toUpperCase().includes(searchPhrase.toUpperCase().trim().replace(/\s/g, ""))) {
            return <Item displayName={item.displayName} photoURL={item.photoURL} id={item.uid} navigation={navigation} groups={item.groups}/>
        }

    }

    return (

        <SafeAreaView style={[styles.modalContainer, styles.AndroidSafeArea]} >

            <View style={[styles.topBar]}>
                <TouchableOpacity style={{padding: 5}} onPress={()=>{navigation.goBack()}}>
                    <MaterialIcons name="arrow-back" size={25} />
                </TouchableOpacity>
                <Text style={[styles.title, {paddingLeft: 5}]}>New Message</Text>
            </View>

            <SearchBar 
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                clicked={clicked}
                setClicked={setClicked}
            />

            <TouchableOpacity 
                style={styles.groupContainer}
                onPress={()=>{navigation.navigate('NewGroup', {data: data})}}
            >
                <MaterialIcons name="groups" size={40} style={{marginHorizontal: 5}}/>
                <Text style={{marginLeft: 10, fontWeight: "bold"}}>Create a new group</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} style={{marginLeft: 'auto'}}/>
            </TouchableOpacity>

            <View onStartShouldSetResponder={()=>{setClicked(false)}} style={styles.listContainer}>
                <FlatList 
                    data={data}
                    renderItem={renderItem}
                    // keyExtractor={(item) => item.id}
                    ListEmptyComponent={<ListEmpty />}
                    ItemSeparatorComponent={() => (<View style={{borderBottomColor: "lightgrey", borderBottomWidth: StyleSheet.hairlineWidth, marginLeft: "20%"}}/>)}
                />
            </View>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        // alignContent: 'center',
    },
    modalContainer: {
        paddingHorizontal: '5%',
        height: '100%',
        // backgroundColor: 'red',
    },
    listContainer: {
        // height: '100%',
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
        // backgroundColor: 'aliceblue',
    },
    item: {
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        // fontStyle: "italic",
    },
    groupContainer: {
        flexDirection: "row", 
        alignItems: "center", 
        alignContent: "center", 
        // backgroundColor:"red",
        marginTop: 10,
    }, 
    AndroidSafeArea: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
})
export default NewChatScreen;