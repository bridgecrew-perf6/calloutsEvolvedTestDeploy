import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  signInAnonymously,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { child, get, ref, runTransaction, update } from "firebase/database";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { auth, database, firestore } from "../firebase/firebaseClient";

const AuthContext = React.createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(0);
  const router = useRouter();

  const register = async (email, password, username, photoURL) => {
    if (currentUser && currentUser.isAnonymous) {
      console.log("turning anonymous user into permanent");
      const credential = EmailAuthProvider.credential(email, password);

      try {
        const user = await linkWithCredential(auth.currentUser, credential);

        console.log(user);

        if (user) {
          updateProfile(user.user, {
            displayName: username,
            photoURL: photoURL,
          }).then(() => {
            console.log("updated firebase profile");
          });

          let userObject = {
            [`userBios/` + user.user.uid]: "...",
            [`userData/` + user.user.uid]: {
              color: "cbb",
              displayName: username,
              userId: user.user.uid,
            },
            [`userStatus/` + user.user.uid]: {
              state: "online",
              timestamp: Timestamp.fromDate(new Date()),
            },
          };

          update(ref(database), userObject).then(() => {
            console.log(
              "finished updating database for new user from anonymous"
            );
          });

          setDoc(
            doc(firestore, "users", user.user.uid),
            {
              displayName: username,
              userId: user.user.uid,
              email: user.user.email,
              userName: username,
              provider: user.user.providerData[0].providerId,
              photoURL: photoURL,
              timestamp: Timestamp.fromDate(new Date()),
            },
            { merge: true }
          );
        }

        console.log("anonymous user turned permanent");
        return await user;
      } catch (error) {
        console.log(error);
        return error;
      }
    } else {
      try {
        const user = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (user) {
          updateProfile(user.user, {
            displayName: username,
            photoURL: photoURL,
          }).then(() => {
            console.log("updated firebase profile");
          });

          let userObject = {
            [`userBios/` + user.user.uid]: "...",
            [`userData/` + user.user.uid]: {
              color: "cbb",
              displayName: username,
              userId: user.user.uid,
            },
            [`userStatus/` + user.user.uid]: {
              state: "online",
              timestamp: Timestamp.fromDate(new Date()),
            },
          };

          update(ref(database), userObject).then(() => {
            console.log("finished updating database for new user");
          });

          setDoc(
            doc(firestore, "users", user.user.uid),
            {
              displayName: username,
              userId: user.user.uid,
              email: user.user.email,
              userName: username,
              provider: user.user.providerData[0].providerId,
              photoURL: photoURL,
              timestamp: Timestamp.fromDate(new Date()),
            },
            { merge: true }
          );
        }

        console.log("new user created");
        return await user;
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    // remove player from all sessions

    const removePlayer = async (playerId) => {
      // check if user is in whitelist

      try {
        console.log("starting to remove from whitelist");

        //decreasing usercount

        const sessionListData = await get(
          child(ref(database), `userSessions/${playerId}`)
        );

        const sessionList = sessionListData.val();
        console.log(sessionList);

        try {
          console.log("removing user from all database");

          update(ref(database), {
            [`userSessions/${playerId}`]: null,
          });
          update(ref(database), {
            [`userStatus/${playerId}`]: null,
          });
          update(ref(database), {
            [`userBios/${playerId}`]: null,
          });

          update(ref(database), {
            [`userData/${playerId}`]: null,
          });

          try {
            const iterateAllSessions = Object.entries(sessionList).map(
              ([id, value]) => {
                update(ref(database), {
                  [`sessionLists/${id}/whitelist/${playerId}`]: null,
                });
              }
            );
            const iterateAllSession2 = Object.entries(sessionList).map(
              ([id, value]) => {
                const decreaseUsersCount = (id) => {
                  const db = database;
                  const postRef = ref(db, `sessionData/${id}`);
                  console.log(postRef);
                  console.log(id);

                  id &&
                    runTransaction(postRef, (post) => {
                      console.log(post);
                      if (post) {
                        post.usersCount--;
                      }
                      return post;
                    });
                };

                decreaseUsersCount(id);

                console.log("decreased usercount");
              }
            );

            Promise.all(iterateAllSessions)
              .then(() => {
                console.log("deleted in sessionList");
              })
              .catch((error) => {
                console.log(error);
              });
            Promise.all(iterateAllSession2)
              .then(() => {
                console.log("deleted in sessionList");

                return signOut(auth);
              })
              .catch((error) => {
                return signOut(auth);
                console.log(error);
              });
          } catch (error) {
            console.log("decrese usersCount error");
            return signOut(auth);
          }

          return signOut(auth);
        } catch (error) {
          console.log("removing user from database error");
          console.log(error);
          return signOut(auth);
        }
      } catch (error) {
        console.log("remove player error error");
        console.log(error);
        return signOut(auth);
      }
    };

    //

    if (currentUser && currentUser.isAnonymous) {
      removePlayer(currentUser.uid);
    } else {
      return signOut(auth);
    }
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };
  const updateUsernameAndPhoto = (username, photo) => {
    updateProfile(currentUser, {
      displayName: username,
      photoURL: photo,
    });

    let userObject = {
      [`userData/` + currentUser.uid + `/displayName`]: username,
      [`userData/` + currentUser.uid + `/photoURL`]: photo,
    };

    update(ref(database), userObject).then(() => {
      console.log("finished updating database for new user from anonymous");
    });

    setDoc(
      doc(firestore, "users", currentUser.uid),
      {
        displayName: username,
        photoURL: photo,
      },
      { merge: true }
    );

    console.log("dvb update/.,");

    setLoader(setLoader + 1);
  };

  const updateUserEmail = (email) => {
    setDoc(
      doc(firestore, "users", currentUser.uid),
      {
        email: email,
      },
      { merge: true }
    );

    const updates = {};

    updateEmail(currentUser, email);
  };

  const updateUserPassword = (password) => {
    updatePassword(currentUser, password);
  };

  const anonymousLogin = async (id) => {
    const user = await signInAnonymously(auth);
    const randomName = () => {
      let name = "";
      for (let i = 0; i < 6; i++) {
        name += String.fromCharCode(97 + Math.floor(Math.random() * 26));
      }
      return name;
    };
    const chosenName = `anonymous ${randomName()}`;

    if (user) {
      updateProfile(user.user, {
        displayName: chosenName,
        photoURL: "...",
      }).then(() => {
        console.log("updated firebase profile");
      });

      let userObject = {
        [`userBios/` + user.user.uid]: "...",
        [`userData/` + user.user.uid]: {
          color: "cbb",
          displayName: chosenName,
          userId: user.user.uid,
        },
        [`userStatus/` + user.user.uid]: {
          state: "online",
          timestamp: Timestamp.fromDate(new Date()),
        },
      };

      update(ref(database), userObject).then(() => {
        console.log("finished updating database for anonymous user");
        router.push(`/session/${id}`);
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      console.log(currentUser);
    } else {
      console.log("No user logged in");
    }
  }, [currentUser]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      setLoading(false);
    });
    return unsubscribe;
  }, [loader]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!url.startsWith("/")) {
        console.log(`App is changing to ${url} `);
        logout();
      }
    };

    router.beforePopState(({ as }) => {
      if (!as.startsWith("/")) {
        logout();
      }

      return true;
    });

    if (process.browser) {
      window.addEventListener("beforeunload", (e) => {
        logout();
      });
    }

    return () => {
      router.beforePopState(() => true);
    };
  }, []);

  const value = {
    currentUser,
    register,
    login,
    logout,
    resetPassword,
    updateUserEmail,
    updateUsernameAndPhoto,
    updateUserPassword,
    anonymousLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
