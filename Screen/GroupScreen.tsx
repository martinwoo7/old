import React, {useEffect, useState} from "react";
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Text,
    SafeAreaView,
    FlatList,
    StatusBar,
    TextInput,
    ScrollView,
    Pressable,
} from "react-native"
import { Avatar } from "@rneui/themed";
import SearchBar from "../Components/Search";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import Animated, {SlideInUp, SlideInDown, Layout, LightSpeedInLeft, LightSpeedOutRight} from "react-native-reanimated";


const Stories = ({ people, handleDelete }) => {
    const handleStories = ({item}) => {
        return (
            // <Animated.View entering={LightSpeedInLeft} exiting={LightSpeedOutRight} key={item.uid} layout={Layout.springify()}>
            <View>
                <TouchableWithoutFeedback
                    
                    onPress={() => {handleDelete(item.uid)}}
                >
                    <View         
                        style={{alignItems: 'center', marginHorizontal: 5, position: 'relative', paddingTop: 20, marginRight: 20}}
                    >   
                        <View style={styles.close} >
                            <MaterialIcons name="clear" size={20}/>
                        </View>
                        
                        <Avatar size={60} rounded source={{uri: item.photoURL}} />
                        {/* test text wrapping for long names  */}
                        <Text style={{fontSize: 12}}>{item.displayName}</Text>
                    </View>
                </TouchableWithoutFeedback>
            {/* </Animated.View> */}
            </View>
        )
    }
    return (
        <FlatList
            // style={{marginTop: 80}}
            data={people}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={handleStories}
            ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 77.7, position: 'relative', paddingTop: 20}}></View>}
        />

    )
}


const RadioButton = (props) => (
    <View style={[{
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'lightgrey',
        alignItems: 'center',
        justifyContent: 'center',
    }, props.style]}>
        {
            props.selected ? 
            <View style={{height: 12, width: 12, borderRadius: 6, backgroundColor: 'lightgrey'}} /> 
            : 
            null
        }
    </View>
)

const Item = ({ displayName, photoURL, id, selected, handleSelect}) => {
    return (
        
        <Pressable 
            style={styles.item}
            onPress={()=>{handleSelect(id, displayName, photoURL)}}
            activeOpacity={0.8}
        >
            <Avatar size={64} containerStyle={{marginRight: 10}} rounded placeholderStyle={{ opacity: 0 }} source={{uri: photoURL}} />
            <Text style={{fontWeight: '600', fontSize: 18, flex: 1, flexWrap: 'wrap'}}>{displayName}</Text>
            <RadioButton selected={selected} style={{marginLeft: 'auto'}} />
        </Pressable>
    )
} 

const ListEmpty = () => (
    <View>
        <Text style={{color:'lightgrey', textAlign:'center', marginTop: 10}}>
            No available contacts :(
        </Text>
    </View>
)

const GroupScreen = ({ navigation, route }) => {
    const data = route.params.data
    const [searchPhrase, setSearchPhrase] = useState('')
    const [clicked, setClicked] = useState(false)

    // change this group state to useRef
    const [groupName, setGroupName] = useState('')
    const [people, setPeople] = useState([])

    const handleDelete = (uid) => {
        // console.log(uid, " deleted")
        const newPeople = people.filter((person) => person.uid != uid)
        setPeople(newPeople)
    }

    const handleAdd = (uid, displayName, photoURL) => {
        // console.log(uid, " added")
        const newPeople = [...people,
        {
            displayName: displayName,
            uid: uid,
            photoURL: photoURL
        }]
        setPeople(newPeople)
    }

    const handleSelect = (uid, displayName, photoURL) => {
        if (people.some((item) => item.uid === uid)) {
            handleDelete(uid)
        } else {
            handleAdd(uid, displayName, photoURL)
        } 
    }

    const renderItem = ({item}) => {
        if (searchPhrase === '') {
            return <Item displayName={item.displayName} photoURL={item.photoURL} id={item.uid} selected={people.some((person) => person.uid === item.uid)} handleSelect={handleSelect}/>
        }

        // filter
        if (item.displayName.toUpperCase().includes(searchPhrase.toUpperCase().trim().replace(/\s/g, ""))) {
            return <Item displayName={item.displayName} photoURL={item.photoURL} id={item.uid} selected={people.some((person) => person.uid === item.uid)} handleSelect={handleSelect} />
        }

    }

    return (
        <SafeAreaView style={[styles.modalContainer, styles.AndroidSafeArea]} >

            <View style={[styles.topBar]}>
                <TouchableOpacity style={{padding: 5}} onPress={()=>{navigation.goBack()}} >
                    <MaterialIcons name="arrow-back" size={25} />
                </TouchableOpacity>
                <Text style={[styles.title, {paddingLeft: 5}]}>New Group</Text>
                <TouchableOpacity style={{padding: 5, marginLeft: 'auto'}} onPress={()=>{console.log("group list:", people)}} >
                    <MaterialIcons name="send" style={{}} size={25} />
                </TouchableOpacity>
            </View>

            <View style={styles.name}>
                <TextInput 
                    placeholder={"Group name (optional)"}
                    value={groupName}
                    onChangeText={setGroupName}
                />      
            </View>
            <SearchBar 
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                clicked={clicked}
                setClicked={setClicked}
                
            />

            <View >
                {/* {people.length > 0 ?
                    <Stories people={people} handleDelete={handleDelete} /> :
                    null
                } */}
                <Stories people={people} handleDelete={handleDelete} />
            </View>

            <View onStartShouldSetResponder={()=>{setClicked(false)}} style={styles.listContainer}>
                <FlatList 
                    data={data}
                    renderItem={renderItem}
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
        alignContent: 'center',
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
    name: {
        width: "100%",
        // alignItems: "center",
        justifyContent: "flex-start",
        // backgroundColor: "red",
        padding: 10,
        marginBottom: 10,
    },
    close: {
        position: "absolute",
        right: 0,
        top: 15,
        zIndex: 2,
        backgroundColor: "lightgrey",
        borderRadius: 50,
        padding: 2,
    }
})
export default GroupScreen