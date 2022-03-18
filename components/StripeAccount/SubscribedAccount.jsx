import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

const SubscribedAccount = ({
  subscription,
  isSubscriptionLoading,
  setIsSubscriptionLoading,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const openCustomerPortal = async ({
    isSubscriptionLoading,
    setIsSubscriptionLoading,
  }) => {
    setIsLoading(true);
    const functions = getFunctions();
    const functionRef = httpsCallable(
      functions,
      "ext-firestore-stripe-payments-createPortalLink"
    );
    const { data } = await functionRef({
      returnUrl: window.location.origin,
    });
    if (data.url) {
      window.location.assign(data.url);
    }
    if (data.error) {
      console.log(error);
      alert(data.error.message);
    }
  };

  return (
    <div>
      {isSubscriptionLoading ? (
        "Loading Subscription Data"
      ) : (
        <>
          <h2>Subscribed Account</h2>
          {subscription?.cancel_at_period_end && (
            <div>This subscription will cancel at the end of the period</div>
          )}
          <p>
            Current period start:{" "}
            {new Date(
              subscription?.current_period_start?.seconds * 1000
            ).toLocaleString()}
          </p>
          <p>
            Current period end:{" "}
            {new Date(
              subscription?.current_period_end?.seconds * 1000
            ).toLocaleString()}
          </p>
          <button disabled={isLoading} onClick={openCustomerPortal}>
            {isLoading ? "Loading" : "Open Customer Portal"}
          </button>
        </>
      )}
    </div>
  );
};

export default SubscribedAccount;
