import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './styles/App.css';
import myEpicNft from './utils/MyEpicNFT.json';
import toast, { Toaster } from 'react-hot-toast';

const TWITTER_HANDLE = 'MathisObstinate';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-hrfzykktmx';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = '0x91bA7C4Bfc58f6609dA0D8b6795090f67ffFF0f8';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [loading, setIsLoading] = useState();
    const [numberOfToken, setNumberOfToken] = useState(0);

    const queryNumberOfToken = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    myEpicNft.abi,
                    signer
                );
                setNumberOfToken(Number(await connectedContract.numberOfNFT()));
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        // if (!ethereum) {
        //     console.log('Make sure you have metamask!');
        //     return;
        // } else {
        //     console.log('We have the ethereum object', ethereum);
        // }

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
            const account = accounts[0];
            // console.log('Found an authorized account:', account);
            setCurrentAccount(account);

            queryNumberOfToken();
            setupEventListener();
        } // else {
        // console.log('No authorized account found');
        //}
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert('Get MetaMask!');
                return;
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            // console.log('Connected', accounts[0]);
            setCurrentAccount(accounts[0]);

            queryNumberOfToken();
            setupEventListener();
        } catch (error) {
            console.log(error);
        }
    };

    const setupEventListener = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    myEpicNft.abi,
                    signer
                );

                connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
                    // console.log(from, tokenId.toNumber());
                    toast.dismiss(loading);
                    toast.success(`Hey there! We've minted your NFT and sent it to your wallet.`);
                    queryNumberOfToken();
                });

                // console.log('Setup event listener!');
            } // else {
            // console.log("Ethereum object doesn't exist!");
            //}
        } catch (error) {
            console.log(error);
        }
    };

    const askContractToMintNft = async () => {
        try {
            const { ethereum } = window;
            let chainId = await ethereum.request({ method: 'eth_chainId' });
            // console.log('Connected to chain ' + chainId);

            const rinkebyChainId = '0x4';
            if (chainId !== rinkebyChainId) {
                alert('You are not connected to the Rinkeby Test Network!');
                return;
            }

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    myEpicNft.abi,
                    signer
                );

                // console.log('Going to pop wallet now to pay gas...');
                let nftTxn = await connectedContract.makeAnEpicNFT();
                setIsLoading(toast.loading("We're minting your NFT..."));
                // console.log('Mining...please wait.');
                await nftTxn.wait();
                // console.log(nftTxn);
                console.log(
                    `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
                );
            } // else {
            //  console.log("Ethereum object doesn't exist!");
            // }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        queryNumberOfToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderNotConnectedContainer = () => (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
        </button>
    );

    const renderMintUI = () => (
        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint NFT
        </button>
    );

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    success: {
                        duration: 3000
                    }
                }}
            />
            <div className="App">
                <div className="container">
                    <div className="header-container">
                        <p className="header gradient-text">My First NFT Collection</p>
                        <p className="sub-text">
                            Each unique. Each beautiful. Discover your NFT today.
                        </p>
                        <p className="sub-text">
                            {currentAccount
                                ? numberOfToken + ' / ' + TOTAL_MINT_COUNT + ' NFT Minted'
                                : '? / ' + TOTAL_MINT_COUNT + ' NFT Minted'}
                        </p>
                        {!currentAccount && (
                            <p className="sub-sub-text">
                                You must be connected to see the number of minted NFT
                            </p>
                        )}
                        {currentAccount === '' ? renderNotConnectedContainer() : renderMintUI()}
                    </div>
                    <div className="footer-container">
                        <a
                            className="footer-text"
                            href={OPENSEA_LINK}
                            target="_blank"
                            rel="noreferrer"
                        >
                            🌊 View Collection on OpenSea
                        </a>
                        <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
                        <a
                            className="footer-text"
                            href={TWITTER_LINK}
                            target="_blank"
                            rel="noreferrer"
                        >{`built by @${TWITTER_HANDLE} with _buildspace`}</a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
