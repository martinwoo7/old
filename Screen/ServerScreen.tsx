import React, {
	useEffect,
	useState,
	useRef,
	useLayoutEffect,
	useMemo,
	useCallback,
} from "react";
import {
	View,
	Text,
	StyleSheet,
	Platform,
	SafeAreaView,
	StatusBar,
	Pressable,
	ActivityIndicator,
	Button,
} from "react-native";
import emulators from "../firebase";
import {
	FlatList,
	Gesture,
	GestureDetector,
	ScrollView,
} from "react-native-gesture-handler";
// import Animated, {
//     useSharedValue,
//     useAnimatedStyle,
//     withSpring,
//     interpolate,
//     Extrapolation,
//     withTiming,
//     runOnJS,
//     interpolateColor,
// } from 'react-native-reanimated';
import {
	collection,
	orderBy,
	query,
	limit,
	onSnapshot,
	getDocs,
	where,
	addDoc,
	Timestamp,
} from "firebase/firestore";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useDrawerProgress } from "@react-navigation/drawer";
import BottomSheet, { TouchableOpacity } from "@gorhom/bottom-sheet";
import * as BT from "reanimated-bottom-sheet";
import { MessageComponent } from "../Components/Post";
import { ICON_SIZE } from "../constants";

const temp = {
	content: "Testing content. This is a strong message and a long message",
	createdAt: new Date(2022, 11, 30),
	createdBy: "ufsaqZFjpdujUJSmb79l9kEAUvbN",
	name: "Jimmy",
	type: 0,
	score: 0,
	likes: 0,
	comments: 0,
	verb: "shouted",
};

const ServerScreen = ({ navigation, route }) => {
	const db = emulators.firestore;
	const auth = emulators.authentication;

	const [items, setItems] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [options, setOptions] = useState(null);

	const filterSheetRef = useRef<BottomSheet>(null);
	const rightSheetRef = useRef<BottomSheet>(null);

	const snapPoints = useMemo(() => ["10%", "50%"], []);

	const drawerProgress = useDrawerProgress();

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}, []);
	// const bgStyle = useAnimatedStyle(() => {
	//     const backgroundColor = interpolateColor(
	//         // tslint:disable-next-line
	//         drawerProgress.value,
	//         [0.98, 0.99],
	//         ["rgba(53, 57, 63, 1)", "rgba(53, 57, 63, 0)"]
	//     )
	//     return {
	//         backgroundColor
	//     }
	// })

	useEffect(() => {
		const getPosts = async () => {
			const q = query(
				collection(db, "posts"),
				where("score", ">=", 0),
				orderBy("score", "desc"),
				limit(50)
			);
			const querySnapshot = await getDocs(q);
			// console.log(querySnapshot.docs)
			const posts = [];
			querySnapshot.forEach((doc) => {
				// temp.push(doc.data())
				const temp = Object.assign({ id: doc.id }, doc.data());
				posts.push(temp);
			});
			setItems(posts);
		};
		getPosts();
	}, []);

	const renderItem = ({ item }) => {
		return (
			<>
				<MessageComponent
					navigation={navigation}
					enabled
					data={item}
					type={item.type}
					tags={item.tags}
				/>
			</>
		);
	};

	const separator = () => {
		return <View style={{ marginVertical: 5 }}></View>;
	};
	const MiddlePanel = () => {
		return (
			<>
				<View style={[styles.middlePanel]}>
					<View
						style={[
							{
								flex: 1,
								marginTop: StatusBar.currentHeight,
								backgroundColor: "#35393F",
								paddingHorizontal: 15,
								borderTopLeftRadius: 12,
							},
						]}
					>
						<TouchableOpacity
							onPress={() => {
								navigation.toggleDrawer();
							}}
						>
							<MaterialCommunityIcons
								name="menu"
								style={{ paddingTop: 15 }}
								color={"lightgrey"}
								size={26}
							/>
						</TouchableOpacity>
						<FlatList
							showsVerticalScrollIndicator={false}
							// refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
							onRefresh={() => onRefresh()}
							refreshing={refreshing}
							data={items}
							renderItem={renderItem}
							keyExtractor={(item) => item.content}
							// contentContainerStyle={{ paddingBottom: 10 }}
							// tslint:disable-next-line
							ItemSeparatorComponent={separator}
							style={{ marginTop: 10 }}
							ListEmptyComponent={
								<View>
									<Text>Nothing here :(</Text>
								</View>
							}
						/>
					</View>

					<View
						style={{
							flexDirection: "row",
							backgroundColor: "#35393F",
							paddingVertical: 7,
						}}
					>
						<Pressable
							style={{
								backgroundColor: "#35393F",
								flex: 1,
								alignItems: "center",
								paddingVertical: 5,
							}}
							onPress={() => {
								filterSheetRef.current.expand();
							}}
						>
							<MaterialCommunityIcons
								name="filter-variant"
								size={ICON_SIZE}
								color="lightgrey"
							/>
						</Pressable>

						<Pressable
							style={{
								backgroundColor: "#35393F",
								flex: 1,
								alignItems: "center",
								paddingVertical: 5,
							}}
							onPress={() => {
								navigation.navigate("NewPost");
							}}
						>
							<MaterialIcons
								name="add"
								size={ICON_SIZE}
								color="lightgrey"
							/>
						</Pressable>

						<Pressable
							style={{
								backgroundColor: "#35393F",
								flex: 1,
								alignItems: "center",
								paddingVertical: 5,
							}}
							onPress={() => {
								rightSheetRef.current.expand();
							}}
						>
							<MaterialCommunityIcons
								name="filter-variant"
								size={ICON_SIZE}
								color="lightgrey"
							/>
						</Pressable>
					</View>

					<BottomSheet
						enablePanDownToClose
						ref={filterSheetRef}
						index={-1}
						snapPoints={snapPoints}
						// onChange={handleSheetChanges}
						backgroundStyle={{ backgroundColor: "#202225" }}
						handleIndicatorStyle={{ backgroundColor: "lightgrey" }}
					>
						<View>
							<Text style={{ color: "lightgrey" }}>
								Filter item
							</Text>
						</View>
					</BottomSheet>

					{/* {options &&
                        <BottomSheet
                            enablePanDownToClose
                            ref={rightSheetRef}
                            index={-1}
                            snapPoints={snapPoints}
                            // onChange={handleSheetChanges}
                            backgroundStyle={{ backgroundColor: '#202225' }}
                            handleIndicatorStyle={{ backgroundColor: "lightgrey" }}
                        >
                            <View style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'aliceblue' }}>
                                <Pressable style={{ marginVertical: 10 }}>
                                    <Text>Follow {options.name}</Text>
                                </Pressable>
                                <Pressable style={{ marginVertical: 10 }}>
                                    <Text>Block {options.name}</Text>
                                </Pressable>
                                <Pressable style={{ marginVertical: 10 }}>
                                    <Text>Report {options.name}</Text>
                                </Pressable>
                            </View>
                        </BottomSheet>
                    } */}
				</View>
			</>
		);
	};

	return (
		<SafeAreaView style={[styles.AndroidSafeArea, styles.container]}>
			<StatusBar
				barStyle={"light-content"}
				translucent
				backgroundColor={"rgba(0,0,0,0)"}
			/>
			<MiddlePanel />
			{/* <Backdrop /> */}
		</SafeAreaView>
	);
};

export default ServerScreen;

const styles = StyleSheet.create({
	AndroidSafeArea: {
		// paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
	},
	container: {
		flex: 1,
		// backgroundColor: '#202225',
		backgroundColor: "#35393F",
	},
	middlePanel: {
		flex: 1,
		height: "100%",
		// backgroundColor: 'blue'
	},
	solid: {
		backgroundColor: "red",
		opacity: 1,
	},
});
