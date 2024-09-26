import { useQuery } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "./components/home/Home";
import Signup from "./components/singup/Signup";
import Noti from "./components/Notifications/Noti";
import Suggestions from "./components/Suggestions/Suggestion";
import Skele from "./components/skeletons/Skele";
import NotificationDisplayer from "./components/list/NotificationDisplayer";
import Search from "./components/search/Search";
import UpdateProfile from "./components/Update Profile/UpdateProfile";
import ShowProfile from "./components/profile/ShowProfile";
import Addpost from "./components/Addpost/Addpost";
import UserProfile from "./components/profile/UserProfile";
import ShowComment from "./components/Comments/ShowComment";
import Signin from "./components/signin/Signin";
function App() {
  const { data, isPending, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      return data;
    },
  });

  var isLoggedIn = data && !data.error;

  if (isLoading || isPending) {
    return (
      <div className="flex flex-row justify-center  min-w-full p-2">
        <Skele />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex border justify-center">
        {isLoggedIn && <Noti />}
        <Routes>
          <Route
            path="/signup"
            element={!isLoggedIn ? <Signup /> : <Navigate to="/home" />}
          />
          <Route
            path="/signin"
            element={!isLoggedIn ? <Signin /> : <Navigate to="/home" />}
          />
          <Route
            path="/home"
            element={isLoggedIn ? <Home /> : <Navigate to="/signup" />}
          />
          <Route
            path="/notifications"
            element={
              isLoggedIn ? <NotificationDisplayer /> : <Navigate to="/signup" />
            }
          />
          <Route
            path="/search"
            element={isLoggedIn ? <Search /> : <Navigate to="/signup" />}
          />
          <Route
            path="/searchuser"
            element={isLoggedIn ? <UserProfile /> : <Navigate to="/signup" />}
          />
          <Route
            path="/profile"
            element={isLoggedIn ? <ShowProfile /> : <Navigate to="/signup" />}
          />
          <Route
            path="/update"
            element={isLoggedIn ? <UpdateProfile /> : <Navigate to="/signup" />}
          />
          <Route
            path="/addpost"
            element={isLoggedIn ? <Addpost /> : <Navigate to="/signup" />}
          />
          <Route
            path="/addpost"
            element={isLoggedIn ? <Addpost /> : <Navigate to="/signup" />}
          />
          <Route
            path="/post"
            element={isLoggedIn ? <ShowComment /> : <Navigate to="/signup" />}
          />

          <Route
            path="/*"
            element={
              isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/signup" />
            }
          />
        </Routes>

        {isLoggedIn && <Suggestions />}
      </div>
    </Router>
  );
}

export default App;
