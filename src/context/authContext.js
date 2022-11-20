import { createContext, useContext } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";
import { auth, db } from "../firebase-config";
import { addDoc, collection, serverTimestamp, doc, setDoc, deleteDoc } from "firebase/firestore";

const UserContext = createContext();

export const AuthContextProvider = ({children}) => {
    const createUser = ( email, password ) => {
        return createUserWithEmailAndPassword(auth, email, password);
    } 
    const createUserToFirestore = (fullname, email, address, contact, newUser) => {
         const userCollectionRef = collection(db, 'users');
         return addDoc(userCollectionRef, {
           id: newUser.user.uid,
           fullname: fullname,
           email: email,
           address: address,
           contact: contact,
           createdAt: serverTimestamp(),
       });
    } 
    const createCustomerToFirestore = (fullname, email, address, contact, newUser) => {
        const userCollectionRef = collection(db, 'customers');
        return addDoc(userCollectionRef, {
          id: newUser.user.uid,
          fullname: fullname,
          email: email,
          address: address,
          contact: contact,
          approve: false,
          createdAt: serverTimestamp(),
      });
   } 
    const loginUser = ( email, password ) => {
        return signInWithEmailAndPassword(auth, email, password);
    } 
    const logoutUser = () => { return signOut(auth);} 

    const updateProfile = (password, number,  passwordConfirm, profileId, user) => {
        const reAuthUser = auth.currentUser;
            const cred = EmailAuthProvider.credential(reAuthUser.email, password);
            reauthenticateWithCredential(reAuthUser, cred)
                .then(() => {
                    updatePassword(reAuthUser, passwordConfirm);
                    alert("Password and Contact Updated Successfully");
                    const docRef = doc(db, "users", profileId);
                    const data = {
                        contact: number,
                      };
                    setDoc(docRef, data, { merge:true })
                }).catch((error) => {
                   alert(error.message);
                });
    }
    const updateCustomerProfile = (password, number,  passwordConfirm, profileId, user) => {
        const reAuthUser = auth.currentUser;
            const cred = EmailAuthProvider.credential(reAuthUser.email, password);
            reauthenticateWithCredential(reAuthUser, cred)
                .then(() => {
                    updatePassword(reAuthUser, passwordConfirm);
                    alert("Password and Contact Updated Successfully");
                    const docRef = doc(db, "customers", profileId);
                    const data = {
                        contact: number,
                      };
                    setDoc(docRef, data, { merge:true })
                }).catch((error) => {
                   alert(error.message);
                });
    }

    const approveCustomer = (id) => {
            const docRef = doc(db, "customers", id);
            const data = {
                approve: true,
                };
            setDoc(docRef, data, { merge:true })
    }
    const saveCustomerBill = (id, addCustomerBill, selectedDate, meterReading) => {
            const docRef = doc(db, "customers", id);
            const data = {
                bill: addCustomerBill,
                dueDate: selectedDate,
                meterReading: meterReading,
                };
            setDoc(docRef, data, { merge:true })
    }

    const createCustomerBill = (customerId, date, bill, reading, totalPayable, penalty) => {
        const billCollectionRef = collection(db, 'bills');
        return addDoc(billCollectionRef, {
          customerId: customerId,
          date: date,
          bill: bill,
          reading: reading,
          totalPayable: totalPayable,
        penalty: penalty,
          createdAt: serverTimestamp(),
      });
   } 

    const createCustomerAppointment = (customerId, date, fullname, description, address, number) => {
        const billCollectionRef = collection(db, 'appointments');
        return addDoc(billCollectionRef, {
          customerId: customerId,
          date: date,
          fullname: fullname,
          description:description,
          address: address, 
          status: "Pending",
          contact : number,
          createdAt: serverTimestamp(),
      });
   } 
    const setDoneCustomerAppointment = (appointmentId) => {
        const docRef = doc(db, "appointments", appointmentId);
            const data = {
                status: "Done",
                };
            setDoc(docRef, data, { merge:true })
   } 

    const deleteCustomerAppointment = (appointmentId) => {
        return deleteDoc(doc(db, "appointments", appointmentId));
   } 

   const createCustomerNotification = (notice, dateFrom, dateTo) => {
    const notificationCollectionRef = collection(db, 'notifications');
    return addDoc(notificationCollectionRef, {
      notice: notice,
      dateFrom:dateFrom,
      dateTo:dateTo,
      isSend : true,
      createdAt: serverTimestamp(),
  });
} 

    return (
        <UserContext.Provider value={{
                                        createUser, createUserToFirestore, 
                                        loginUser, logoutUser, updateProfile,
                                        createCustomerToFirestore, updateCustomerProfile,
                                        approveCustomer, saveCustomerBill,createCustomerBill,
                                        createCustomerAppointment, deleteCustomerAppointment,
                                        setDoneCustomerAppointment, createCustomerNotification
                                        }}>
            {children}
        </UserContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(UserContext);
}