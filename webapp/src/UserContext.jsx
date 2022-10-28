import * as React from "react";
import PropTypes from "prop-types";
import { getCurrentUserProfile, getAllUserProfiles } from "./services";

const UserContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = React.useState({});
  const [profiles, setProfiles] = React.useState([]);

  const getUserProfile = React.useCallback(async (userId) => {
    if (!profiles) {
      setProfiles(await getAllUserProfiles());
    }
    return profiles.find((u) => u.userId === userId);
  }, [profiles]);

  const updateAllUserProfiles = async () => {
    setProfiles(await getAllUserProfiles());
  };

  React.useEffect(() => {
    (async () => {
      setUser(await getCurrentUserProfile());
      setProfiles(await getAllUserProfiles());
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      setProfiles(await getAllUserProfiles());
    })();
  }, [user]);

  const value = React.useMemo(() => ({
    user, setUser, getUserProfile, updateAllUserProfiles,
  }), [user, getUserProfile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserProvider, useUser };
