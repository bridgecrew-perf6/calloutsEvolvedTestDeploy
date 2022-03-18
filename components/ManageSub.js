import React, { useEffect, useState } from "react";
import SubscribedAccount from "./StripeAccount/SubscribedAccount";
import Subscribe from "./StripeAccount/Subscribe";
import { useAuth } from "../contexts/AuthContext";
import usePremiumStatus from "../stripe/usePremiumStatus";
import { firestore } from "../firebase/firebaseClient";
import { collection, getDocs, where } from "firebase/firestore";
import { query } from "firebase/database";

const ManageSub = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [subscription, setSubscription] = useState({});
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [products, setProducts] = useState();
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [mode, setMode] = useState(null);
  const { currentUser } = useAuth();
  let addData = [];
  const userIsPremium = usePremiumStatus(currentUser);

  // Fetch Subscription Plans
  const fetchProducts = async () => {
    setIsProductLoading(true);
    const db = firestore;
    const productsRef = collection(db, "stripe/data/products");
    const productsQuery = query(productsRef, where("active", "==", true));
    const productsQuerySnap = await getDocs(productsQuery);

    const Iterate = productsQuerySnap.docs.map(async (doc) => {
      const pricesRef = collection(db, `stripe/data/products/${doc.id}/prices`);

      const pricesQuerySnap = await getDocs(pricesRef);
      const prices = pricesQuerySnap.docs.map((price) => {
        return {
          id: price.id,
          ...price.data(),
          type: price.data().type,
        };
      });

      addData.push({
        id: doc.id,
        ...doc.data(),
        prices: prices,
      });
    });

    Promise.all(Iterate).then(() => {
      console.log(addData);
      setProducts(addData);
      setIsProductLoading(false);
    });
  };

  // fetch subscription data
  const fetchSubscription = async () => {
    setIsSubscriptionLoading(true);
    const db = firestore;
    const subsRef = collection(
      db,
      `stripe/data/customers/${currentUser.uid}/subscriptions`
    );
    const subsQuery = query(
      subsRef,
      where("status", "in", ["trialing", "active", "past_due", "unpaid"])
    );

    try {
      const subscriptionData = async () =>
        await getDocs(subsQuery).then((sub) => {
          let data = null;
          if (sub.docs.length > 0) {
            console.log("Data: ", sub.docs[0].data());
            data = sub.docs[0].data();
          }
          return data;
        });

      setSubscription(await subscriptionData());
      console.log("setSubscription: ", await subscriptionData());

      setIsSubscriptionLoading(false);
    } catch (error) {
      console.log("error: ", error);
      console.log("Error Fetching Data of subscription");
      setIsSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    if (userIsPremium) {
      console.log("User Is Premium");
      fetchSubscription();
    } else {
      console.log("User Is Not Premium");
      fetchProducts();
    }
  }, [currentUser, userIsPremium]);

  return (
    <>
      {!userIsPremium ? (
        <Subscribe
          isProductLoading={isProductLoading}
          setIsLoading={setIsLoading}
          products={products}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          mode={mode}
          setMode={setMode}
        />
      ) : (
        <SubscribedAccount
          subscription={subscription}
          isSubscriptionLoading={isSubscriptionLoading}
          setIsSubscriptionLoading={setIsSubscriptionLoading}
        />
      )}
    </>
  );
};

export default ManageSub;
