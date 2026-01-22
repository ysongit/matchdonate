import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from "react";

function Home() {
  const router = useNavigate();

  const { authenticated, login } = usePrivy();

  useEffect(() => {
   if (authenticated) router("/overview");
  }, [authenticated])
  
  return (
    <div>
      <Button 
        type="primary"
        block
        className="mt-3"
        onClick={() => login()}
      >
       Login
      </Button>
    </div>
  )
}

export default Home;