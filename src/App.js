import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers'
import myEpicNft from './utils/MyEpicNFT.json'

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 50;
// I moved the contract address to the top for easy access.
const CONTRACT_ADDRESS = "0x0c5049eda58298014f491B32E4C1222b54346D91"

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState("")
  const [nftMinted, setNftMinted] = useState(0)

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
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
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

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup out event listener
  const setupEventListener = async () => {
    // Most of this looks the same as askContractToMintNft function
    try {
      const { ethereum } = window
      if (ethereum) {
        // same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        /**
         * if nftMinted == 0 mean that the app is connecting.
         * So I should call nftMinted to know the current nfts minted
         */
        if (nftMinted === 0) {
          let nfts = await connectedContract.nftMintedSoFat()
          setNftMinted(nfts.toNumber())
        }

        /**
         * THIS IS THE MAGIC SAUCE.
         * This will essentially "capture" our event when our contract throws it.
         * If you're familiar with webhooks, it's very similar to that!
         * we use the 'on' to listen the 'event' emited by the contract
         */
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setNftMinted(tokenId.toNumber())
          alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`)
        })

        console.log("Setup event listener")
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT()

        console.log("Mining... please wait")
        await nftTxn.wait()

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx${nftTxn.hash}`)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
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

  const ShowNftMinted = () => {
    return (
      <p className="sub-text">NFT Minted: {nftMinted}/50</p>
    )
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount &&
            <ShowNftMinted />
          }
          {currentAccount === "" ? (
            <button className="cta-button connect-wallet-button" onClick={connectWallet}>
              Connect to Wallet
            </button>
          ) : (
            <button className="cta-button connect-wallet-button" onClick={askContractToMintNft}>
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
