import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { firestore } from "../firebase/firebaseClient";
import getStripe from "./initializeStripe";

export const createCheckoutSession = async (
  uid,
  selectedPrice,
  mode,
  setIsLoading
) => {
  setIsLoading(true);

  const collectionRef = collection(
    firestore,
    "stripe/data/customers",
    uid,
    "checkout_sessions"
  );
  const price = selectedPrice;
  console.log(mode);
  const paymentMode = () => {
    if (mode === "one_time") {
      return "payment";
    } else if (mode === "recurring") {
      return "subscription";
    }
  };
  console.log(paymentMode());

  try {
    const docRef = await addDoc(collectionRef, {
      mode: paymentMode(),
      price: selectedPrice,
      success_url: window.location.origin,
      cancel_url: window.location.origin,
    });

    try {
      onSnapshot(docRef, async (snap) => {
        const { error, sessionId, url } = snap.data();
        if (error) {
          console.log(error);
          alert(error.message);
          setIsLoading(false);
        }

        // error && alert(error.message);

        if (sessionId) {
          console.log("sessionId exists");
          console.log(sessionId);

          try {
            const stripe = await getStripe();
            stripe.redirectToCheckout({ sessionId });
          } catch (error) {
            setIsLoading(false);
            alert(error.message);
          }
        }
      });
    } catch (error) {
      setIsLoading(false);
      alert(error.message);
    }
  } catch (error) {
    setIsLoading(false);
    alert(error.message);
  }
};
