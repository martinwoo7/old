import React from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    SafeAreaView,
} from 'react-native'

const Item = ({ name, details }) => (
    <View style={styles.item}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.details}>{details}</Text>
    </View>
)

const FilterList = ({ searchPhrase, setClicked, data }) => {
    const renderItem = ({ item }) => {
        // when no input, show all
        if (searchPhrase === '') {
            return <Item name={item.name} details={item.details} />
        }

        // filter
        if (item.name.toUpperCase().includes(searchPhrase.toUpperCase().trim().replace(/\s/g, ""))) {
            return <Item name={item.name} details={item.details} />
        }

        if (item.details.toUpperCase().include(searchPhrase.toUpperCase().trim().replace(/\s/g, ""))) {
            return <Item name={item.name} details={item.details} />
        }

        return (
            <SafeAreaView style={styles.list_container}>
                <View onStartShouldSetResponder={() => {
                    setClicked(false)
                }} >
                    <FlatList 
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                    />

                </View>
            </SafeAreaView>
        )
    }
}

export default FilterList;

const styles = StyleSheet.create({
    list_container: {
        margin: 10,
        height: "85%",
        width: "100%"
    },
    item: {
        margin: 30,
        borderBottomWidth: 2,
        borderBottomColor: "lightgrey",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
        fontStyle: "italic"
    }
})