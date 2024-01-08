import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Keyboard, Text} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const SearchBar = ({clicked, searchPhrase, setSearchPhrase, setClicked}) => {
    return(
        <View style={styles.container}>
            <View style={clicked ? styles.searchContainer_clicked : styles.searchContainer_unclicked}>
                <MaterialIcons name="search" size={20} color="#6C757D" style={{padding: 5}}/>    
                <TextInput
                    value={searchPhrase}
                    onChangeText={setSearchPhrase}
                    placeholder="Search"
                    placeholderTextColor="#6C757D"
                    style={styles.input}
                    onFocus={()=>{setClicked(true)}}
                    onBlur={()=>{setClicked(false)}}
                />
                {clicked && (<MaterialIcons size={20} style={{}} name="close" color="black" onPress={() => {setSearchPhrase("")}} />)}
            </View>
            {clicked && (
                <View>
                    <TouchableOpacity style={styles.button} title="Cancel" onPress={()=>{Keyboard.dismiss(); setClicked(false); }} ><Text>Cancel</Text></ TouchableOpacity>
                </View>
            )}
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
    },
    searchContainer_unclicked: {
        width: '100%',
        borderRadius: 15,
        flexDirection: 'row',
        backgroundColor: "#F8F9FA",
        alignItems: 'center',
        padding: 5,

    },
    searchContainer_clicked: {
        width: '80%',
        borderRadius: 15,
        flexDirection: 'row',
        backgroundColor: "#F8F9FA",
        alignItems: 'center',
        padding: 5,
        // justifyContent: 'space-evenly',

    },
    input: {
        width: "80%",
    },
    button: {
        color: "black",
        // backgroundColor: 'lightgrey',
        marginLeft: 10,
        padding: 8,
    }
})

export default SearchBar;