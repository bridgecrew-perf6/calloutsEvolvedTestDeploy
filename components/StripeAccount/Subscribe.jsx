import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth } from "../../contexts/AuthContext";
import { firestore } from "../../firebase/firebaseClient";
import { createCheckoutSession } from "../../stripe/createChekoutSession";

const Subscribe = ({
  isProductLoading,

  products,
  selectedPrice,
  setSelectedPrice,
  mode,
  setMode,
}) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div>
      <h2>Subscribtion plans</h2>
      {isProductLoading ? (
        "Loading subscription plans"
      ) : (
        <>
          {products &&
            products.map((product, index) => (
              <div key={index + "product"}>
                <div>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    height="100"
                    width="100"
                  />
                </div>
                <h3>{product.name}</h3>
                <p>description:{product.description}</p>
                <p>role:{product.role}</p>

                {product.prices &&
                  product.prices.map((price, index) => (
                    <div key={index + "price"}>
                      <form>
                        <input
                          type="radio"
                          name="price"
                          checked={price.id === selectedPrice}
                          value={price.id}
                          id={price.id}
                          onChange={(e) => {
                            setSelectedPrice(e.currentTarget.value);
                            setMode(price.type);
                          }}
                        />
                        <label>{price.interval}</label>
                      </form>
                    </div>
                  ))}
              </div>
            ))}

          <button
            disabled={!selectedPrice || isLoading}
            onClick={() => {
              createCheckoutSession(
                currentUser.uid,
                selectedPrice,
                mode,
                setIsLoading
              );
            }}
          >
            {" "}
            {isLoading ? "Loading..." : "Subscribe"}
          </button>
        </>
      )}
    </div>
  );
};

export default Subscribe;
