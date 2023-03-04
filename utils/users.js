import React from "react";
import { doc, setDoc, collection, addDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import emulators from "../firebase";

// This function should write all user data to Firebase.
// Called after successful registration
// Params:
// @user - Promise of UserCredential returned from Firebase authentication services

// Returns:
// Promise<void>
export const createUser =  async (user) => {
    const db = emulators.firestore

    // const userRef = collection(db, "user")
    console.log("Saving user data with UID: ", user.uid)
    try {
        await setDoc(doc(db, "users", user.uid), {
            displayName: user.displayName,
            email: user.email,
            groups: [],
            uid: user.uid,
            photoURL: user.photoURL,
            registeredAt: serverTimestamp(),

        })
        console.log("Sucessfully saved ", user.uid, " to firebase")
    } catch (error) {
        console.log(error);
    }
}

// takes in a user id
// returns array of userData
export const getUserData = async (uid) => {
    const db = emulators.firestore
    console.log("Retrieving user data with UID: ", uid)
    try {
        const userSnap = await getDoc(doc(db, 'users', uid))
        if (userSnap.exists()) {
            return userSnap.data()
        } else {
            console.log("user doesn't exist in db for some reason")
        }
    } catch (error) {
        console.log("Error getting user data")
        console.log(error)
    }

}