import { Box } from "lucide-react";
import React from "react";
import Button from "./ui/Button";
import { useOutletContext } from "react-router";

type AuthContext = {
  authState: {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
  };
  signIn: () => Promise<any>;
  signOut: () => Promise<any>;
  refreshAuth: () => Promise<any>;
};

const Navbar = () => {
  const { authState, signIn, signOut } =
    useOutletContext<AuthContext>();

  const { isSignedIn, userName } = authState;

  const handleAuthClick = async () => {
    try {
      if (isSignedIn) {
        await signOut();
      } else {
        await signIn();
      }
    } catch (error) {
      console.log("Auth failed:", error);
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">Roomify</span>
          </div>

          <div className="links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
          </div>
        </div>

        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">
                {userName ? `HI, ${userName}` : "Signed In"}
              </span>

              <Button size="sm" onClick={handleAuthClick}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={handleAuthClick}>
                Log In
              </Button>

              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;