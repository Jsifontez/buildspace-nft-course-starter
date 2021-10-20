import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useState, useEffect } from "react";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 50;

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState("")

  /*
   * Gotta make sure this is async
   */
  const checkIfWalletIsConnected = async () => {
    /**
     * First make sure we have access to window.ethereum
     */
    const { ethereum } = window
    if (!ethereum) {
      console.log("Make sure you have metamaks!")
      return
    }
    console.log("We have the ethereum object", ethereum)

    /**
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: 'eth_accounts'})

    /**
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (accounts.length !==0) {
      const account = accounts[0]
      console.log("Found an authorized account:", account)
      setCurrentAccount(account)
    } else {
      console.log("Not authorized account found")
    }
  }

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert("Get MetaMask!")
        return
      }

      // Fancy method to request access to account
      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      // Boom! This should print out public address once we authorize Metamask
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount == "" ? (
            <button className="cta-button connect-wallet-button" onClick={connectWallet}>
              Connect to Wallet
            </button>
          ) : (
            <button className="cta-button connect-wallet-button" onClick={null}>
              Mint NFT
            </button>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;