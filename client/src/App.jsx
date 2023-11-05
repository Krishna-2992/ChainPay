import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import { abi } from './contractABI.js'

const vaultAddress = '0x308D4c396337F6c5706C85122f7d6370bc010EeF'

function App() {
    const [accounts, setAccounts] = useState()
    const [provider, setProvider] = useState()
    const [signer, setSigner] = useState()
    const [payableETH, setPayableETH] = useState()

    const listenToEvent = async (signerInitial) => {
        signerInitial = signerInitial ?? signer
        console.log('signer2', signerInitial)
        const vaultContract = new ethers.Contract(
            vaultAddress,
            abi,
            signerInitial
        )
        vaultContract.on('AssetsReceived', (sender, value, data) => {
            console.log('data', sender, value, data)
            displaySuccessMessage(value)
        })
    }

    async function displaySuccessMessage(value) {
        console.log('payableETH:', Number(value))
        document.querySelector('#confirmationMessage').innerHTML = `
            Your ${value / 10 ** 18} ETH has been successfully received!!
        `
        document.querySelector('#specifyingPrototype').innerHTML = `
        Since this is a prototype, we are not currently sending you the actual money. That feature can be implemented by registering as a corporate bank account.

        `
    }

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })
                const provider = new ethers.providers.Web3Provider(
                    window.ethereum
                )
                const signer = await provider.getSigner()
                console.log('signer', signer)
                setProvider(provider)
                setSigner(signer)
                setAccounts(accounts)

                console.log('connected accounts:', accounts)
                await listenToEvent(signer)
            } else {
                alert('please install metamask!!')
            }
        } catch (error) {
            console.log(error)
            console.log('💥💥')
        }
    }

    async function getConvertedINR() {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr'
        )
        const data = await response.json()

        const inr = document.querySelector('#amountInInr').value
        const eth = inr / data.ethereum.inr
        const ethWithTenDecimals = eth.toFixed(10)

        setPayableETH(ethWithTenDecimals)
    }

    async function insufficientBalance() {
        console.log(accounts[0])
        const balance = await provider.getBalance(accounts[0])
        const balanceInEther = ethers.utils.formatEther(balance)

        console.log(balanceInEther)
        console.log(payableETH)

        if (balanceInEther < payableETH) {
            console.log('label1 true')
            return true
        } // means insufficient balance
        else {
            return false
        }
    }

    async function getChainId() {
        const chainId = await window.ethereum.request({
            method: 'eth_chainId',
        })
        return chainId
    }

    async function sendEtherToVault() {
        if (!signer) {
            alert('please connect your sepolia wallet first')
        } else if (await insufficientBalance()) {
            alert('insufficient balanceeeee in your connected account')
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: 11155111 }],
            })
        } else if ((await getChainId()) !== '0xaa36a7') {
            alert(
                'currently we only receive sepolia, so please switch into that network'
            )
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }],
                })
            } catch (err) {
                console.log(err)
            }
        } else {
            const transaction = {
                to: vaultAddress,
                value: ethers.utils.parseEther(payableETH.toString()),
            }
            const txHash = await signer.sendTransaction(transaction)
            // await provider.waitForTransaction(txHash)

            console.log('Transaction sent!')
            document.querySelector('#confirmationMessage').innerHTML = `
                    Processing...please wait
                `
        }
    }

    return (
        <>
            <div className='flex flex-col'>
                <div>
                    <button onClick={connectWallet} className='m-8 p-4'>
                        {!signer ? 'Connect Wallet' : 'Connected'}
                    </button>
                </div>
                <div>
                    <div className='flex flex-row m-4 items-center'>
                        <div>Enter the account number of the receiver: </div>
                        <div>
                            <input
                                type='text'
                                className='mx-4 p-2'
                                placeholder='account number'
                            />
                        </div>
                    </div>
                    <div className='flex flex-row m-4 items-center'>
                        <div>Enter the amount to be sent (in INR):</div>
                        <input
                            type='text'
                            id='amountInInr'
                            placeholder='amount in INR'
                            onChange={getConvertedINR}
                            className='mx-4 p-2'
                        />
                    </div>
                    <div>
                        <button onClick={sendEtherToVault}>
                            Send <span className='font-bold'>{payableETH}</span>{' '}
                            ETH
                        </button>
                    </div>
                    <div id='confirmationMessage' className='text-2xl'></div>
                    <div id='specifyingPrototype' className='text-md'></div>
                </div>
            </div>
        </>
    )
}

export default App
