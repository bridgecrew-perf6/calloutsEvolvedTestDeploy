import { auth } from "../firebase/firebaseClient";

export default async function isUserPremium() {
  try {
    await auth.currentUser?.getIdToken(true);

    const decodedToken = await auth.currentUser?.getIdTokenResult();
    console.log("is user premium?");
    console.log(decodedToken?.claims?.stripeRole ? true : false);
    return decodedToken?.claims?.stripeRole ? true : false;
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
}
