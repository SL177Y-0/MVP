import { useState, useEffect } from "react";
import { auth, twitterProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { usePrivy } from "@privy-io/react-auth";

function TwitterAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null); // Store the score
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // ✅ Use Privy (if needed)
  const { authenticated, user: privyUser } = usePrivy();
  
  // ✅ Fetch score when user logs in
  useEffect(() => {
    if (!user) return; // Avoid unnecessary calls when user is null

    const fetchScore = async () => {
      setLoading(true);
      setError(null);

      try {
        const privyID = user?.email || "guest"; // Use UID from Firebase or Privy
        const username = user?.displayName || "unknown";

        const response = await fetch(
          `${apiBaseUrl}/api/score/get-score/${privyID}/${username}/null`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch score");

        const data = await response.json();
        setScore(data?.score || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [user]); // ✅ Runs only when `user` changes

  // ✅ Login with Twitter
  const loginWithTwitter = async () => {
    try {
      const result = await signInWithPopup(auth, twitterProvider);
      setUser(result.user);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setScore(null); // ✅ Reset score on logout
  };

  return (
    <div className="">
      {!user ? (
        <button
          onClick={loginWithTwitter}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Sign in with Twitter
        </button>
      ) : (
        <div className="text-center">
          <p className="text-green-600 font-bold">Welcome, {user.displayName}!</p>
          
         
        </div>
      )}
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}

export default TwitterAuth;
