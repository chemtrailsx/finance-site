import { auth, googleProvider, signInWithPopup, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc , getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      // Check if the user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== null) {
          // User already has a role, return the user without setting role to null
          return user;
        }
      }
  
      // If the user doesn't exist or has no role, set default values
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          role: null, // Default role
          createdAt: new Date().toISOString(),
          plan: 0, // Default free plan
          interview: 3, // 3 interviews per week
          questionBank: 0, // Basic access
          progressTracking: 0, // Free plan
          interviewGiven: 0,
          caseStudy: {
            plan: 0,
            perWeek: 0,
          },
        },
        { merge: true } // Merge with existing document (if any)
      );
  
      return user;
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in popup was closed before completion.");
      }
      console.error(error);
      throw error;
    }
  };

export const signUpWithEmail = async (
    email: string,
    password: string,
    role: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
  
      // Save user data with role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role, // Add the selected role
        createdAt: new Date().toISOString(),
        plan: 0, // Default free plan
        interview: 3, // 3 interviews per week
        questionBank: 0, // Basic access
        progressTracking: 0, // Free plan
        interviewGiven: 0,
        caseStudy: {
          plan: 0,
          perWeek: 0,
        },
      });
  
      return user;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already in use. Please log in instead.");
      }
      console.error(error);
      throw error;
    }
  };

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    return user;
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email. Please sign up.");
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password. Please try again.");
    }
    console.error(error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
    try {
      await setDoc(
        doc(db, "users", userId),
        { role: role },
        { merge: true } // Merge with existing document
      );
      console.log("User role updated successfully.");
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };
  
  export const logout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  export const purchasePro = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User is not logged in.");
      }
  
      await setDoc(
        doc(db, "users", user.uid),
        { 
          plan: 1,
          interview: 1e10,
          questionBank: 1,
          progressTracking: 1,
          caseStudy: {
            plan: 1,
            perWeek: 2
          }
        },
        { merge: true } // Merge with existing document
      );
      console.log("Pro plan purchased successfully.");
    } catch (error) {
      console.error("Error purchasing Pro plan:", error);
      throw error;
    }
  }

export const purchasePremium = async () => {
    try {
        const User = auth.currentUser;
        if(!User) {
            throw new Error("User is not logged in.");
        }
        await setDoc(
            doc(db, "users", User.uid),{
                plan: 2,
                interview: 1e10,
                questionBank: 1,
                progressTracking: 1,
                caseStudy: {
                    plan: 2,
                    perWeek: 1e10
                }
            },
            { merge: true
            }
        )
    } catch (error) {
        console.error("Error purchasing Premium plan:", error);
        throw error;
    }
}